// const Pando        = artifacts.require("Pando.sol");
// const PandoGenesis = artifacts.require("PandoGenesis.sol");
// const PandoAPI     = artifacts.require("PandoAPI.sol");
// const VotingKit    = artifacts.require("VotingKit.sol");
//
//
// module.exports = function(deployer) {
//   deployer.deploy(Pando);
//   deployer.link(Pando, PandoGenesis);
//   deployer.link(Pando, PandoAPI);
//   deployer.link(Pando, VotingKit);
// };

const Organism = artifacts.require("Organism.sol");
const Lineage  = artifacts.require("Lineage");


module.exports = async (deployer) => {
  await deployer.deploy(Organism);
  await deployer.deploy(Lineage);

  let organism = await Organism.deployed()

  return organism.address
}
