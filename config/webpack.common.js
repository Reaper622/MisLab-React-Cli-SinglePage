const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const merge = require('webpack-merge');
const prodConfig = require('./webpack.prod.js');
const devConfig = require('./webpack.dev.js');

const commonConfig = {
  entry: {
    main: './src/index.js'
  },
  resolve: {
    // 第三方模块只搜索 node_modules 
    modules: [path.resolve(__dirname, '../node_modules')],
    extensions: ['.js', 'jsx'],
    mainFiles: ['index'],
    // 别名 可以用来定义快捷路径
    alias: {
      '@components' : path.resolve(__dirname, '../src/components'),
      '@assets' : path.resolve(__dirname, '../src/assets')
    }
  },
  module: {
    rules: [
      {
        test: /(\.js| \.jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            // 30KB 以下大小的图片文件用base64编码来减少请求次数
            limit: 1024-30,
            // 超出 30KB 的图片仍用 file-loader压缩
            fallback: 'file-loader'
          }
        }]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html'
    }),
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  output: {
    path: path.resolve(__dirname, '../dist')
  }
}

// env为外部传入的全局变量
module.exports = (env) => {
  if(env && env.production) {
    return merge(commonConfig, prodConfig);
  } else {
    return merge(commonConfig, devConfig);
  }
}
