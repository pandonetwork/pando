var nodeExternals = require('webpack-node-externals')
const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'pando',
    libraryTarget: 'umd',
    library: 'pando',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@root': path.resolve(__dirname, 'src/'),
      // '@pando': path.resolve(__dirname, 'src/pando.ts'),
      // '@factories': path.resolve(__dirname, 'src/factories/'),
      // '@components': path.resolve(__dirname, 'src/components/'),
      // '@objects': path.resolve(__dirname, 'src/objects/'),
      // '@contracts': path.resolve(__dirname, 'src/contracts/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
      '@lib': path.resolve(__dirname, 'src/lib/'),
      '@ui': path.resolve(__dirname, 'src/ui/'),
      '@inquirer': path.resolve(__dirname, 'src/ui/inquirer')
      // '@build': path.resolve(__dirname, 'build/'),
      // "@interfaces": path.resolve(__dirname, 'src/interfaces/ipando.d.ts')
    }
  },
  module: {
    rules: [{ test: /.tsx?$/, loader: 'ts-loader' }]
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })
  ],
  target: 'node', // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()]
}
