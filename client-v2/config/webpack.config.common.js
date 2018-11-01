const path = require('path');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
// https://github.com/Igorbek/typescript-plugin-styled-components
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const styledComponentsTransformer = createStyledComponentsTransformer();


module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, '../../public/client-v2/dist'),
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|spec.ts|spec.tsx)$/,
        include: '/',
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          getCustomTransformers: () => ({ 
            before: [styledComponentsTransformer] 
          })
        }
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|otf)$/,
        loader: 'file-loader',
        options: {
          publicPath: '/assets/client-v2/dist/'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    plugins: [new TSConfigPathsPlugin()],
    extensions: ['.ts', '.tsx', '.js']
  }
};
