const axios = require('axios')
const webpack = require('webpack')
const MemoryFs = require('memory-fs')
const proxy = require('http-proxy-middleware')
const serialize = require('serialize-javascript')
const ejs = require('ejs')
const asyncBootstrap = require('react-async-bootstrapper').default
const path = require('path')
const ReactDomServer = require('react-dom/server')
const Helmet = require('react-helmet').default

const serverConfig = require('../../build/webpack.config.server')

const getTemplate = () => {
  return new Promise((resolve, reject) => {
    axios.get('http://localhost:8888/public/server.ejs')
      .then(res => {
        resolve(res.data)
      })
      .catch(reject)
  })
}

const NativeModule = require('module')
const vm = require('vm')

const getModuleFromString = (bundle, filename) => {
  const m = { exports: {} }
  const wrapper = NativeModule.wrap(bundle)
  const script = new vm.Script(wrapper, {
    filename: filename,
    displayErrors: true
  })

  const result = script.runInThisContext()
  result.call(m.exports, m.exports, require, m)

  return m
}

const mfs = new MemoryFs()
const serverCompiler = webpack(serverConfig)

// 指定 compiler 输出
serverCompiler.outputFileSystem = mfs

let serverBundle
let createStoreMap

serverCompiler.watch({}, (err, stats) => {
  if (err) throw err

  stats = stats.toJson()
  stats.errors.forEach(err => console.log(err))
  stats.warnings.forEach(err => console.log(err))

  // 获取服务端打包出来的文件路径
  const bundlePath = path.join(
    serverConfig.output.path,
    serverConfig.output.filename
  )

  const bundle = mfs.readFileSync(bundlePath, 'utf-8')
  const m = getModuleFromString(bundle, 'server-entry.js')

  serverBundle = m.exports.default
  createStoreMap = m.exports.createStoreMap
})

const getStoreState = (sotres) => {
  return Object.keys(sotres).reduce((result, storeName) => {
    result[storeName] = sotres[storeName].toJson()
    return result
  }, {})
}

module.exports = function (app) {
  // 将 public 目录下的静态文件代理到 8888 端口
  app.use('/public', proxy({
    target: 'http://localhost:8888'
  }))

  app.get('*', function (req, res) {
    getTemplate().then(template => {
      const routerContext = {}
      const stores = createStoreMap()
      const app = serverBundle(stores, routerContext, req.url)

      asyncBootstrap(app).then(() => {
        if (routerContext.url) {
          res.status(302).setHeader('Location', routerContext.url)
          res.end()
          return
        }

        const helmet = Helmet.rewind()
        const state = getStoreState(stores)
        const content = ReactDomServer.renderToString(app)

        const html = ejs.render(template, {
          appString: content,
          initalState: serialize(state),
          meta: helmet.meta.toString(),
          title: helmet.title.toString(),
          style: helmet.style.toString(),
          link: helmet.link.toString()
        })

        res.send(html)
      })
    })
  })
}

/*
* 开发环境服务端渲染的实现原理：
* 监听wepack打包的结果，
* 拿到这个结果，输出到 mfs 内存中，
* 通过 hack 方法将获取的内容转成模块
* 通过 ReactDomServer 方法得到内容
* 替换 <!-- app --> 占位符
*
* */
