const commonConfig = require("./webpack.common.js");

module.exports = {
  ...commonConfig,
  mode: 'production',
  devtool: 'cheap-module-source-map'
}
