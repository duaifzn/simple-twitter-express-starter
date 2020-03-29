const port = process.env.PORT;
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: 'app.js',
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      template: '../views/layouts/main.handlebars',

      // Pass the full url with the key!
      portUrl: `ws://localhost:${port}/tweets`,

    })
  ]
}