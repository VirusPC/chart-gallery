const commonConfig = require("./webpack.common");

module.exports = {
  ...commonConfig,
  
  mode: 'development',

  devServer: {
    contentBase: "./dist",
    hot: true
  },

  devtool: 'eval-cheap-module-source-map'
}
