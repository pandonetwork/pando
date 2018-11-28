@pando/colony
  -> smart contract & front-end
  -> should receive message from organisms when lineage is minted to figure out whether or not to mint organisation token.

@pando/organism
  -> smart contracts only
  -> deploy to apm to avoid gas costs in colony 
  -> onlyScheme modifiers on all functions
  -> forward to scheme if msg.sender != address(scheme)

@pando/schemes
  -> decision machines
  |
  -> dictator
    |
    -> frontend
    -> contracts
    -> must be able to handle more than one repo thanks to the address so the votes should be a double mapping organism_address => RFIid => ballots
  -> democracy
    |
    -> frontend
    -> contracts

@pando/dao
  a dao kit you can call to deploy a new DAO
