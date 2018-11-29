pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/kernel/Kernel.sol";

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

    ENS public ens;

    address public lineageBase;
    address public genesisBase;
    address public organismBase;

    address public resolver;
    bytes32 constant public lineageAppId  = apmNamehash("lineage");
    bytes32 constant public genesisAppId  = apmNamehash("genesis");
    bytes32 constant public organismAppId = apmNamehash("organism");

    event DeployOrganism(address organism);

    function initialize(ENS _ens) onlyInit public {
        ens = _ens;

        PublicResolver resolver_1 = PublicResolver(ens.resolver(lineageAppId));
        PublicResolver resolver_2 = PublicResolver(ens.resolver(genesisAppId));
        PublicResolver resolver_3 = PublicResolver(ens.resolver(organismAppId));

        Repo repo_1 = Repo(resolver_1.addr(lineageAppId));
        Repo repo_2 = Repo(resolver_2.addr(genesisAppId));
        Repo repo_3 = Repo(resolver_3.addr(organismAppId));

        (,lineageBase,)  = repo_1.getLatest();
        (,genesisBase,)  = repo_2.getLatest();
        (,organismBase,) = repo_3.getLatest();




        /* Repo repo = Repo(PublicResolver(ens.resolver(organismAppId)).addr(organismAppId));

        (,organismBase,) = repo.getLatest(); */
    }

    function deploy() public {

      Kernel dao = Kernel(kernel());

      Lineage lineage   = Lineage(dao.newAppInstance(lineageAppId, lineageBase));
      Genesis genesis   = Genesis(dao.newAppInstance(genesisAppId, genesisBase));
      Organism organism = Organism(dao.newAppInstance(organismAppId, organismBase));



      emit DeployOrganism(address(organism));
    }
}
