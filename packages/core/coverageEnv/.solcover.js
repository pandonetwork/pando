module.exports = {
  norpc: true,
  compileCommand: '../node_modules/.bin/truffle compile',
  testCommand:
    'node --max-old-space-size=4096 ../node_modules/.bin/truffle test --network coverage',
  skipFiles: ['misc/Migrations.sol', 'utils/Strings.sol'],
  copyPackages: ['@aragon']
}
