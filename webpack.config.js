var nodeExternals = require('webpack-node-externals')
const path = require('path')

// Need to add modularity in the future: bundle node.js for production but not for developement

module.exports = {
  entry: './src/pando0x.ts',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'Pando0x',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@root': path.resolve(__dirname, 'src/'),
      '@pando0x': path.resolve(__dirname, 'src/pando0x.ts'),
      '@factories': path.resolve(__dirname, 'src/factories/'),
      '@components': path.resolve(__dirname, 'src/components/'),
      '@contracts': path.resolve(__dirname, 'src/contracts/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
      '@locals': path.resolve(__dirname, 'src/locals/'),
      '@build': path.resolve(__dirname, 'build/'),
      "@interfaces": path.resolve(__dirname, 'src/interfaces/ipando0x.d.ts')
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