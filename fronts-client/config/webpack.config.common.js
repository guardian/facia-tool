const path = require('path');
const webpack = require('webpack');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
// https://github.com/Igorbek/typescript-plugin-styled-components
const createStyledComponentsTransformer = require('typescript-plugin-styled-components')
  .default;
const styledComponentsTransformer = createStyledComponentsTransformer();
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, '../../public/fronts-client/dist'),
    filename: 'app.bundle.js'
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.(ts|tsx|spec.ts|spec.tsx)$/,
        include: '/',
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
          getCustomTransformers: () => ({
            before: [styledComponentsTransformer]
          })
        }
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|otf|gif)$/,
        loader: 'file-loader',
        options: {
          publicPath: '/assets/fronts-client/dist/'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    plugins: [new TSConfigPathsPlugin()],
    extensions: ['.ts', '.tsx', '.js']
  },
  stats: {
    // See https://github.com/TypeStrong/ts-loader#loader-options
    warningsFilter: /export .* was not found in/
  }
};
