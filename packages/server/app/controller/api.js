const { createRuntime, selectSource, send, sendfile } = require('./shared')
const path = require('path')
const fs = require('fs')

const getConfig = (app, raw = false) => {
  let { netdrive, controller } = app
  if (raw) return netdrive.config
  let config = { ...netdrive.config }
  if (config.drives) {
    config.drives = netdrive.getDisk()
  }

  config.drivers = netdrive.getDrivers()

  config.guide = {}

  config.drivers.forEach((i) => {
    if (app.guide[i.protocol]) {
      config.guide[i.protocol] = app.guide[i.protocol]
    }
  })

  return config
}

const getCustomConfig = (app) => {
  const ret = {}
  const defaultConfigKey = app.netdrive.defaultConfigKey
  const config = { ...app.netdrive.config }
  for (let i of Object.keys(config)) {
    if (!defaultConfigKey.includes(i)) {
      ret[i] = config[i]
    }
  }
  return ret
}

const getFilePath = (file, app) => {
  return path.join(
    app.appInfo.baseDir,
    './theme',
    app.netdrive.config.theme || 'default',
    file,
  )
}

module.exports = {
  async page(ctx, next) {
    let filepath = getFilePath(ctx.path == '/' ? 'index.html' : ctx.path.substring(1), this.app)
    if ('download' in ctx.query) {
      await this.get(ctx, next)
    } else {
      try {
        if (!fs.existsSync(filepath)) {
          filepath = getFilePath('index.html', this.app)
        }
      } catch (e) {
        filepath = getFilePath('index.html', this.app)
      }

      let status = await sendfile(ctx, filepath)
      if (!status) {
        return await this.list(ctx, next)
      }
    }

  },

  async setting(ctx, next) {
    ctx.body = { data: getConfig(this.app, !!ctx.query.raw) }
  },
  async config(ctx, next) {
    const data = getCustomConfig(this.app)
    ctx.body = { status: 0, data }
  },
  async configField(ctx, next) {
    const data = getCustomConfig(this.app)
    const key = ctx.query.key || ctx.params.field
    const ret = key && data[key] ? data[key] : ''
    if (ctx.query['content-type']) {
      ctx.set('content-type', ctx.query['content-type'])
      ctx.body = ret
    } else {
      ctx.body = { status: 0, data: ret }
    }
  },
  async reload(ctx, next) {
    await this.app.netdrive.reload()
    ctx.body = { status: 0 }
  },
  async updateSetting(ctx, next) {
    let data = { ...ctx.request.body }
    for (let i in data) {
      let val = data[i]
      if (i == 'drives') {
        this.app.netdrive.setDisk(val)
      }
      this.app.netdrive.config[i] = val
    }

    ctx.body = { data: getConfig(this.app) }
  },

  async clearCache(ctx, next) {
    this.app.netdrive.cache.clear()
    ctx.body = { status: 0 }
  },

  async get(ctx, next) {
    let netdrive = this.app.netdrive
    let runtime = await createRuntime(ctx)
    let { data, error } = await netdrive.getFile(runtime)
    // if (runtime.query.download) {
    //   // let { url, error } = await netdrive.getDownloadUrl(runtime)

    // }
    if (error) {
      ctx.body = { error }
      return
    }

    if (data.type == 'file') {
      if (runtime.query.download) {
        if (runtime.query.preview && data.extra.preview_url) {
          data.download_url = data.extra.preview_url
          await send(ctx, this.app, data)
        } else {
          if (netdrive.config.anonymous_download_enable) {
            await send(ctx, this.app, data)
          }
        }

      } else if (runtime.query.preview) {
        if (data.extra.category == 'video' && data.extra.sources?.length > 0) {
          //let download_url = selectSource(data.extra.sources) || data.download_url
          //await send(ctx, netdrive, { ...data, download_url })
        } else {
          await send(ctx, this.app, data)
        }
      } else {
        ctx.body = data
      }
    } else {
      ctx.body = data
    }
  },
  async list(ctx, next) {
    let netdrive = this.app.netdrive
    let runtime = await createRuntime(ctx)
    let { data, error } = await netdrive.getFiles(runtime)
    if (error) {
      ctx.body = { error }
    } else {
      if (data.files?.length > 0) {
        data.files
          .sort((a, b) => (a.type == 'folder' ? -1 : 1))
          .forEach((i) => {
            if (i.type == 'file') {
              i.download_url = '/api/drive/get?download=true&id=' + encodeURIComponent(i.id)
              if (i.extra?.preview_url) {
                i.preview_url = '/api/drive/get?download=true&preview=true&id=' + encodeURIComponent(i.id)
              }
            }
          })
      }
      ctx.body = data
    }

  },
}
