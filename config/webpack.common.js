const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const merge = require('webpack-merge');
const prodConfig = require('./webpack.prod.js');
const devConfig = require('./webpack.dev.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HappyPack = require('happypack');
// 使用共享进行池处理任务 防止资源占用过多
const happyThreadPool = HappyPack.ThreadPool({ size: 5});

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
        // 使用 happypack 多线程打包
        use: ['happypack/loader?id=babel']
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'happypack/loader?id=css']
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
    new HappyPack({
      // 唯一标识符 id 来表示当前 HappyPack 处理哪种文件 
      id: 'babel',
      loaders: ['babel-loader'],
      threadPool: happyThreadPool
    }),
    new HappyPack({
      id: 'css',
      loaders: ['css-loader', 'postcss-loader'],
      threadPool: happyThreadPool
    }),
    new MiniCssExtractPlugin({
      filename: '[name]-[contenthash].css'
    }),
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
