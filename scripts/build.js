
const child_process = require('child_process')
const { readdir, copyFile } = require('fs/promises')
const path = require('path')

const run = cmd => new Promise((resolve, reject) => {
  child_process.exec(cmd, (error, stdout, stderr) => {
    if (error) {
      resolve()
    } else {
      resolve(stdout)
    }
  })
})

const cp = async (src, dst) => {
  let files = await readdir(src)
  for (let file of files) {
    let name = path.basename(file)
    let dst = path.join(dst, name)
    await copyFile(file, dst)
  }
}

const main = async () => {
  await run(`yarn build-web`)
  await cp('../packages/netdrive-plugin/lib', '../packages/netdrive/plugins')
  await run(`pkg ./packages/netdrive/ --output build/netdrive --targets linux-x64,macos-x64,macos-arm64,win-x64`)
}