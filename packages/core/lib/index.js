const path = require('path')
const qs = require('querystring')
const { URL } = require('url')
const utils = require('./utils')
const request = require('./request')
const createDriver = require('./driver')
const { createRectifier, createReadStream } = require('./rectifier')
const { isFunction, isClass, createCache } = utils

const injectFunctions = (netdrive, protocol) => {
  return {
    ...netdrive,
    getDrives() {
      let drives = netdrive.config.drives.filter((i) => i.path && i.path.split(':')[0] == protocol)
      if (drives.length == 1) {
        if (drives.length) {
          return [{ ...drives[0], root: true }]
        }
      }
      return drives
    },
    saveDrive(data, where = {}) {
      if (data.key && Object.keys(where).length == 0) where.key = data.key
      let hit = netdrive.config.drives.find((i) => utils.fit(netdrive.decode(i.path), { protocol, ...where }))
      if (hit) {
        hit.path = netdrive.encode({ ...netdrive.decode(hit.path), ...data, protocol })
        console.log('save', data, hit.path)
      }
    },
    encode(data) {
      return netdrive.encode({ ...data, protocol })
    },
    get runtime() {
      return netdrive.runtime
    },
  }
}

const wrapPlugin = (netdrive, src) => {
  if (isFunction(src.onReady)) {
    src.onReady(injectFunctions(netdrive, src.protocol))
  }
  return src
}

const parsePlugins = (netdrive, files = [], store) => {
  let driverMap = new Map(),
    authMap = {},
    cmdMap = new Map()
  for (let ins of files) {
    if (isClass(ins)) {
      let resources = wrapPlugin(netdrive, new ins(netdrive))
      console.log(`load ${resources.protocol}`)
      driverMap.set(resources.protocol, resources)
    } else if (isFunction(ins)) {
      let resource = ins.call(ins, netdrive, utils)

      // if (resource.auth) {
      //   for (let key in resource.auth) {
      //     authMap[key] = resource.auth[key]
      //   }
      // }

      if (resource?.drive) {
        console.log(`load ${resource.drive.protocol}`)
        driverMap.set(resource.drive.protocol, wrapPlugin(netdrive, resource.drive))
      }

      if (resource?.cmd) {
        for (let key in resource.cmd) {
          cmdMap.set(key, resource.cmd[key])
        }
      }
    }
  }
  store.driverMap = driverMap
  // store.authMap = authMap
  store.cmdMap = cmdMap
}

const compose = (middlewares, context) => {
  return (context) =>
    middlewares.reduceRight(
      (a, b) => () => Promise.resolve(b(context, a)),
      () => { },
    )(context)
}

const error = (error) => {
  throw error
}

const chain =
  (fns) =>
    async (data, ...options) => {
      for (let fn of fns) {
        data = await fn(data, ...options)
        if (data.error) break
      }
      return data
    }

module.exports = async (options) => {
  const resources = {}
  const config = options.config || {}
  const cache = options.cache || createCache()
  const lifecycles = {}

  const getDrivers = () => {
    let ret = []
    for (let i of resources.driverMap.values()) {
      if (i.mountable) {
        ret.push({
          name: i.name,
          protocol: i.protocol,
          guide: i.guide,
        })
      }
    }
    return ret
  }

  const getDriver = (protocol) => {
    return resources.driverMap.get(protocol)
  }

  const isSameDisk = async (id, target) => {
    let a = decode(id), b = decode(target)
    return a.protocol === b.protocol && a.key === b.key
  }

  const decode = (p) => {
    let hasProtocol = p.includes('://')
    if (!hasProtocol) p = 'netdrive://' + p
    let data = new URL(p)
    let protocol = data.protocol.replace(':', '')

    if (getDriver(protocol)?.decode) {
      return getDriver(protocol).decode(p)
    }

    let result = {
      protocol,
      key: data.host,
      path: decodeURIComponent(data.pathname || ''),
    }

    if (result.path) result.path = result.path.replace(/^\/+/, '')
    if (hasProtocol) result.protocol = data.protocol.split(':')[0]
    for (const [key, value] of data.searchParams) {
      result[key] = value
    }
    return result
  }

  const encode = (options) => {
    if (getDriver(options.protocol)?.encode) {
      return getDriver(options.protocol).encode(options)
    }

    let { protocol, key, path, ...query } = options
    let pathname = path === undefined || path == '' ? '/' : '/' + path
    let search = qs.stringify(query)
    if (search) search = '?' + search
    let ret = `${key || ''}${pathname}${search}`
    if (protocol) ret = `${protocol}://${ret}`
    return ret
  }

  const bootstrape = async () => {
    parsePlugins(netdrive, options.plugins, resources)
  }

  const reload = async (plugins) => {
    parsePlugins(netdrive, plugins, resources)
  }

  const ocr = async (image, type, lang) => {
    if (config.ocr_server) {
      let { data } = await request.post(config.ocr_server, {
        method: 'post',
        contentType: 'json',
        data: { image }
      })
      return { code: data.result }
    }
    return { error: { message: 'ocr server is NOT ready!' } }
  }

  const useLifetime = (type) => {
    if (!lifecycles[type]) {
      lifecycles[type] = []
    }

    return (cb) => {
      const remove = () => {
        let idx = lifecycles[type].findIndex((i) => i == cb)
        if (idx >= 0) {
          lifecycles[type].splice(idx, 1)
        }
      }

      if (!lifecycles[type].find((i) => i == cb)) {
        lifecycles[type].push(cb)
      }

      return remove
    }
  }

  const hookLifetime = (type) => chain(lifecycles[type])


  const netdrive = {
    config,
    cache,
    request,
    utils,
    error,
    ocr,
    isSameDisk,
    decode,
    encode,
    hookLifetime,
    getDriver,
    onListed: useLifetime('onListed'),
    onGeted: useLifetime('onGeted'),
    createRectifier,
    createReadStream
  }

  const driver = createDriver(netdrive)
  netdrive.driver = driver
  bootstrape()

  return {
    ...driver,
    reload,
    decode,
    encode,
    getDrivers,
    isSameDisk
  }
}
