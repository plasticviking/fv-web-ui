const Webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
require('dotenv').config();

const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const buildPath = path.resolve(__dirname, 'public', 'build');
const mainPath = path.resolve(__dirname, 'src', 'main/entry.tsx');

module.exports = {
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
};

const config = {
  mode: 'development',
  performance: {
    hints: false,
  },
  entry: {
    mainBundle: [
      //'webpack/hot/dev-server',
      'react-hot-loader/patch',
      '@babel/polyfill',
      mainPath,
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
        },
      },
    },
  },
  output: {
    crossOriginLoading: 'anonymous',
    filename: '[name].js',
    path: buildPath,
    publicPath: '/microservice-demo/',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      // 'react-dom': '@hot-loader/react-dom',
    },
  },
  module: {
    rules: [{
      test: /\.[jt]sx?$/,
      loader: 'babel-loader',
    }, {
      test: /\.(s?)css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
        options: {
          hmr: true,
          reloadAll: true,
        },
      }, {
        loader: 'css-loader',
        options: {
          sourceMap: true,
        },
      }, {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
        },
      },
      ],
    }, {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loaders: ['file-loader?name=[name].[ext]'],
    }, {
      test: /\.(otf|eot|svg|ttf|woff|woff2)$/i,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 10000,
        },
      }],
    }
    ],
  },
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    //new Webpack.HotModuleReplacementPlugin(),
    new Webpack.DefinePlugin({
      _API_BASE: 'API_BASE' in process.env ? JSON.stringify(process.env.API_BASE) : '\'http://fv.iron.mapleleaf.intranet/microservices/upload\'',
      _TOKEN_URL: 'TOKEN_URL' in process.env ? JSON.stringify(process.env.TOKEN_URL) : '\'http://fv.iron.mapleleaf.intranet/nuxeo/token\'',
      _NUXEO_API: 'NUXEO_API' in process.env ? JSON.stringify(process.env.NUXEO_API) : '\'http://fv.iron.mapleleaf.intranet/nuxeo/api\'',
    }),
    new HtmlWebpackPlugin({
      chunks: ['mainBundle'],
      filename: 'generated_index.html',
      templateParameters: {},
      template: path.resolve(__dirname, 'templates/main.html'),
    }),
  ],
};

module.exports = config;
