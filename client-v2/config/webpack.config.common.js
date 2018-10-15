const path = require('path');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, '../../public/client-v2/dist'),
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      {
        test: /^(?!.*\.spec\.tsx?$).*\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|otf)$/,
        loader: 'file-loader',
        options: {
          publicPath: '/assets/client-v2/dist/'
        }
      }
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    plugins: [new TSConfigPathsPlugin()],
    extensions: ['.ts', '.tsx', '.js']
  }
};
