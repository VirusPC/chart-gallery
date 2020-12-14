const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
 
let examplesDirPath = path.resolve(__dirname, "../src");
let examplesName = fs.readdirSync(examplesDirPath)
                    .filter((item) => fs.statSync(path.resolve(examplesDirPath, item)).isDirectory());
let entryObj = {};
examplesName.forEach((name) => entryObj[name] = './src/'+name+'/index.ts');


module.exports = {
  entry: {
    "index": "./src/index.ts",
    ...entryObj
  },

  output: {
    path: path.resolve(__dirname, '../dist'), // 根目录
    filename: 'js/[name].[hash].bundle.js',
    publicPath: "/"
  },

  // 所有的loader都要在module对象中的rules属性中
  module: {
    rules: [  // rules中每一个对象就是一个loader
      {  // css
        test: /\.css$/i,
        use: [
            'style-loader',  // 用于在html文档中创建一个style标签, 将样式塞进去
            'css-loader' // 将less编译为css, 但不生成单独的css文件, 在内存中.
        ]
      },
      {  // html中的标签资源
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {  // images
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,  // 8kb以下的图片会被base64处理
              publicPath: '/images/',  // 决定转换后的图片的url路径
              outputPath: './images',  // 决定文件本地输出路径
              name: '[hash:5].[ext]'  // 修改文件名称[hash:8] hash值取8位 [ext] 文件扩展名
            }
          }
        ]
      },
      {  //ts, tsx
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: './src/index.html',
      chunks: ['index']
    }),
    ...examplesName.map((name) => new HtmlWebpackPlugin({
      filename: name + '/index.html',
      template: './src/' + name + '/index.html',
      chunks: [name]
    }))
  ]
}
