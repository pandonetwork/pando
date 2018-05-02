var nodeExternals = require('webpack-node-externals')
const path = require('path')

module.exports = {
  entry: './src/pando.ts',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'Pando',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@root': path.resolve(__dirname, 'src/'),
      '@pando': path.resolve(__dirname, 'src/pando.ts'),
      '@factories': path.resolve(__dirname, 'src/factories/'),
      '@components': path.resolve(__dirname, 'src/components/'),
      '@contracts': path.resolve(__dirname, 'src/contracts/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
      '@locals': path.resolve(__dirname, 'src/locals/'),
      '@build': path.resolve(__dirname, 'build/'),
      "@interfaces": path.resolve(__dirname, 'src/interfaces/ipando.d.ts')
    }
  },
  module: {
    rules: [
      { test: /.tsx?$/, loader: 'ts-loader' }
    ]
  },
  target: 'node', // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()], 
}