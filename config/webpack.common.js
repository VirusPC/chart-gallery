const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const dirPath = path.resolve(__dirname, "../src/demos");
const examples = {};
fs.readdirSync(dirPath)
  .filter((item) => fs.statSync(path.resolve(dirPath, item)).isDirectory())
  .forEach((frameworkName) => {
    examples[frameworkName] = [];
    fs.readdirSync(path.resolve(dirPath, frameworkName))
      .filter((item) => fs.statSync(path.resolve(dirPath, frameworkName, item)).isDirectory())
      .forEach((example) => examples[frameworkName].push(example));
  });

console.log("Example List", examples);

let entryObj = {};
for(const framework of Object.keys(examples)){
  examples[framework].forEach((example) => entryObj[`${framework}-${example}`] = "./" + path.join("./src/demos", framework, example,"index.js"))
}
console.log(entryObj);

module.exports = {
  entry: {
    index: "./src/index.js",
    ...entryObj,
  },

  output: {
    path: path.resolve(__dirname, "../dist"), // 根目录
    filename: "js/[name]/[name].[hash].bundle.js",
    publicPath: "/",
  },

  // 所有的loader都要在module对象中的rules属性中
  module: {
    rules: [
      // rules中每一个对象就是一个loader
      {
        // 默认只解析json, 需要添加geojson支持....然而本地跑没问题, vercel那边会报错...
        test: /\.geojson$/,
        loader: 'json-loader'
      },
      {
        // css
        test: /\.css$/i,
        use: [
          "style-loader", // 用于在html文档中创建一个style标签, 将样式塞进去
          "css-loader", // 将less编译为css, 但不生成单独的css文件, 在内存中.
        ],
      },
      {
        // html中的标签资源
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        // images
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192, // 8kb以下的图片会被base64处理
              publicPath: "/images/", // 决定转换后的图片的url路径
              outputPath: "./images", // 决定文件本地输出路径
              name: "[hash:5].[ext]", // 修改文件名称[hash:8] hash值取8位 [ext] 文件扩展名
            },
          },
        ],
      },
      {
        //ts, tsx
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        // 使得import/require可以导入相应后缀的文件, 转化成url.
        test: /\.csv$/i,
        loader: "file-loader", //  resolves import/require() on a file into a url and emits the file into the output directory.
        options: {
          outputPath: "data",
        },
      },{

      }
      // {
      //   test: /(\.m?js$) | (\.ts$)/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: [
      //         [
      //           '@babel/preset-env',
      //           {
      //             useBuiltIns: 'usage',   // 按需引入,需要使用polyfill
      //             corejs: { version: 3 },  // 解决warn
      //               targets: {  // 指定兼容性处理哪些浏览器
      //                 "chrome": "58",
      //                 "ie": "9"
      //               }
      //           }
      //         ]
      //       ],
      //       cacheDirectory: true, // 开启babel缓存
      //     }
      //   }
      // }
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/index.html",
      chunks: ["index"],
    }),
    ...Object.keys(examples).flatMap(
      (framework) => examples[framework].map(example =>
        new HtmlWebpackPlugin({
          filename: `demos/${framework}/${example}/index.html`,
          template: `./src/demos/${framework}/${example}/index.html`,
          chunks: [`${framework}-${example}`],
        })
      )
    ),

  ],

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json", ".geojson"],
  },
};
