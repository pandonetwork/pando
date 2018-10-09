const Pando        = artifacts.require("Pando.sol");
const PandoHistory = artifacts.require("PandoHistory.sol");
const PandoAPI     = artifacts.require("PandoAPI.sol");
const VotingKit    = artifacts.require("VotingKit.sol");



module.exports = function(deployer) {
  deployer.deploy(Pando);
  deployer.link(Pando, PandoHistory);
  deployer.link(Pando, PandoAPI);
  deployer.link(Pando, VotingKit);

  // deployer.deploy(PandoKit);
};
