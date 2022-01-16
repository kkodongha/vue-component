const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const babelLoaderExcludeNodeModulesExcept = require('babel-loader-exclude-node-modules-except');
const { ModuleFilenameHelpers } = require('webpack');

module.exports = {
  entry:
    process.env.NODE_ENV === 'development'
      ? [
          'core-js/es/promise',
          'core-js/es/set',
          'core-js/es/map',
          './src/main.js',
        ]
      : [
          'core-js/es/promise',
          'core-js/es/set',
          'core-js/es/map',
          './src/index.js',
        ],
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js',
    library: {
      type: 'umd',
      name: 'vue-component',
    },
  },
  target: ['web', 'es5'],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.s(c|a)ss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              sassOptions: {
                indentedSyntax: true,
              },
            },
          },
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            scss: ['style-loader', 'css-loader', 'sass-loader'],
            sass: [
              'vue-style-loader',
              'css-loader',
              'sass-loader?indentedSyntax',
            ],
          },
        },
      },
      {
        test: /\.js$/,
        exclude: babelLoaderExcludeNodeModulesExcept(['yup']),
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|otf|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        PROD_ENV: JSON.stringify(process.env.PROD_ENV),
        npm_package_version: JSON.stringify(process.env.npm_package_version),
      },
    }),
    // new CopyWebpackPlugin({
    //   patterns: [{ from: path.resolve(__dirname, './static') }],
    // }),
  ],
  devServer: {
    hot: true,
    historyApiFallback: true,
    static: path.resolve(__dirname),
    host: '127.0.0.1',
    port: '3500',
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.js',
      '@': path.resolve('src'),
    },
    extensions: ['*', '.js', '.vue', '.json'],
  },
  performance: {
    hints: false,
  },
};

if (process.env.NODE_ENV !== 'development') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new HtmlWebpackPlugin({
      template: 'index_template.html',
      filename: 'index.html',
    }),
  ]);
}

if (process.env.NODE_ENV === 'production') {
  module.exports.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          compress: {
            pure_funcs: ['console.log'],
          },
          mangle: true,
          output: {
            comments: false,
          },
        },
      }),
    ],
  };
} else {
  module.exports.devtool =
    process.env.NODE_ENV === 'development' ? 'eval-source-map' : 'source-map';
}
