const commonConfig = require("./webpack.common");
const merge = require('webpack-merge');

module.exports = merge(commonConfig, {
  mode: 'development',

  devServer: {
    contentBase: "./dist",
    hot: true
  },

  devtool: 'eval-cheap-module-source-map'
});
