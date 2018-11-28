const Organism = artifacts.require("Organism.sol");
const Lineage  = artifacts.require("Lineage");

const deployer = this.deployer

module.exports = async (callback) => {
  let organism = await Organism.new()
  let lineage  = await Lineage.new()


  console.log('Organism: ' + organism.address)

  callback()
}
