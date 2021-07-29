const commonConfig = require("./webpack.common.js");
const merge = require("webpack-merge");

module.exports = merge(commonConfig, {
  mode: 'production',
  devtool: 'cheap-module-source-map'
});
