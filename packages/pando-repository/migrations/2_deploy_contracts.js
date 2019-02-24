var CounterApp = artifacts.require('CounterApp.sol')

module.exports = function (deployer) {
  deployer.deploy(CounterApp)
}
