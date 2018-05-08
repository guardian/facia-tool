import path from 'path';

export default {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, '../../public/client-v2/dist'),
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/, // regex to test the file's path against
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/, // regex to test the file's path against
        use: 'eslint-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      Actions: path.resolve(__dirname, '../src/actions'),
      Components: path.resolve(__dirname, '../src/components'),
      Constants: path.resolve(__dirname, '../src/constants'),
      Fixtures: path.resolve(__dirname, '../src/fixtures'),
      Reducers: path.resolve(__dirname, '../src/reducers'),
      Selectors: path.resolve(__dirname, '../src/selectors'),
      Services: path.resolve(__dirname, '../src/services'),
      Types: path.resolve(__dirname, '../src/types'),
      Util: path.resolve(__dirname, '../src/util')
    }
  }
};
