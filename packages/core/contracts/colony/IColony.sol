pragma solidity ^0.4.24;

import "@aragon/os/contracts/lib/ens/ENS.sol";
import "@aragon/apps-shared-minime/contracts/ITokenController.sol";
import "../scheme/IPandoScheme.sol";


contract IColony {
    bytes32 constant public DEPLOY_ORGANISM_ROLE = keccak256("DEPLOY_ORGANISM_ROLE");

    event DeployOrganism(address organism);

    function initialize(ENS _ens, ITokenController _tokenManager, IPandoScheme _scheme) public;
    function deploy() public;

}
