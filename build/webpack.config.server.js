const path = require('path')

module.exports = {
  target: 'node',  // 打包出来的执行环境
  entry: {
    app: path.join(__dirname, '../client/server-entry.js')
  },
  output: {
    filename: 'server-entry.js',
    path: path.join(__dirname, '../dist'),
    publicPath: '/public',       // 在生成的 script 标签中增加的前缀，可以直接静态文件增加 CDN 前缀
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        enforce: 'pre', //在代码编译之前执行loader，报错则不继续编译
        test: /.(js|jsx)$/,
        loader: 'eslint-loader',
        exclude: [
          path.resolve(__dirname, '../node_modules')
        ]
      },
      {
        test: /.jsx$/,
        loader: 'babel-loader'
      },
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: [
          path.join(__dirname, '../node_modules')
        ]
      }
    ]
  }
}