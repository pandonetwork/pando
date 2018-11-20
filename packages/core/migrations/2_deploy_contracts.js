const Pando        = artifacts.require("Pando.sol");
const PandoGenesis = artifacts.require("PandoGenesis.sol");
const PandoAPI     = artifacts.require("PandoAPI.sol");
const VotingKit    = artifacts.require("VotingKit.sol");


module.exports = function(deployer) {
  deployer.deploy(Pando);
  deployer.link(Pando, PandoGenesis);
  deployer.link(Pando, PandoAPI);
  deployer.link(Pando, VotingKit);
};
