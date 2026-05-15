const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    context: __dirname,
    entry: {
      app: './frontend/scripts/app.js',
      dashboard: './frontend/scripts/dashboard.js',
      login: './frontend/scripts/login.js',
      reg: './frontend/scripts/reg.js',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      filename: 'scripts/[name].js',
      clean: true,
    },
    performance: {
      hints: false,
    },
    optimization: {
      splitChunks: false,
      runtimeChunk: false,
    },
    resolve: {
      extensions: ['.js'],
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
          type: 'asset/resource',
          generator: { filename: 'images/[name].[contenthash:8][ext]' },
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: { filename: 'fonts/[name].[contenthash:8][ext]' },
        },
      ],
    },
    plugins: [
      ...(isProd
        ? [
            new MiniCssExtractPlugin({
              filename: 'styles/[name].[contenthash].css',
            }),
          ]
        : []),
      new HtmlWebpackPlugin({
        template: './frontend/index.html',
        filename: 'index.html',
        chunks: ['app'],
        inject: 'body',
      }),
      new HtmlWebpackPlugin({
        template: './frontend/login.html',
        filename: 'login.html',
        chunks: ['login'],
        inject: 'body',
      }),
      new HtmlWebpackPlugin({
        template: './frontend/registration.html',
        filename: 'registration.html',
        chunks: ['reg'],
        inject: 'body',
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'frontend/templates', to: 'templates', noErrorOnMissing: true },
          { from: 'frontend/images', to: 'images', noErrorOnMissing: true },
        ],
      }),
    ],
    devServer: {
      static: path.resolve(__dirname, 'dist'),
      port: 8080,
      hot: true,
      historyApiFallback: { index: '/index.html' },
    },
    devtool: isProd ? 'source-map' : 'eval-source-map',
  };
};
