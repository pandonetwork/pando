var nodeExternals = require('webpack-node-externals')
var TsConfigPathsPlugin = require('awesome-typescript-loader')
  .TsConfigPathsPlugin

const path = require('path')

module.exports = {
  entry: './src/pando/index.ts',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'pando.js',
    libraryTarget: 'umd',
    library: 'Pando',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsConfigPathsPlugin /* { tsconfig, compiler } */()]
  },
  module: {
    rules: [{ test: /.tsx?$/, loader: 'ts-loader' }]
  },
  target: 'node', // in order to ignore built-in modules like path, fs, etc.
  devtool: 'source-map',
  externals: [nodeExternals()]
}
