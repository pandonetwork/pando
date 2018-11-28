pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@pando/organism/contracts/core/Organism.sol";
import "@aragon/os/contracts/apm/Repo.sol";
import "@aragon/os/contracts/lib/ens/ENS.sol";
import "@aragon/os/contracts/lib/ens/PublicResolver.sol";
import "@aragon/os/contracts/apm/APMNamehash.sol";

/* ENS: 0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1 */

contract Colony is AragonApp, APMNamehash {

    bytes32 constant public DEPLOY_ORGANISM_ROLE = keccak256("DEPLOY_ORGANISM_ROLE");

    mapping(uint256 => Organism) public organisms;
    uint256 public organismsLength = 0;

    ENS     public ens;
    address public organismBase;
    address public resolver;
    bytes32 constant public organismAppId = apmNamehash("organism");

    function initialize(ENS _ens) onlyInit public {
        ens = _ens;

        Repo repo = Repo(PublicResolver(ens.resolver(organismAppId)).addr(organismAppId));

        (,organismBase,) = repo.getLatest();
    }

    function deploy() public {

    }
}
