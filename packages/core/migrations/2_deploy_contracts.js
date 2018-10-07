const Pando    = artifacts.require("Pando.sol");
const PandoAPI = artifacts.require("PandoAPI.sol");
const PandoHistory = artifacts.require("PandoHistory.sol");


module.exports = function(deployer) {
  deployer.deploy(Pando);
  deployer.link(Pando, PandoAPI);
  deployer.link(Pando, PandoHistory);

  // deployer.deploy(PandoKit);
};
