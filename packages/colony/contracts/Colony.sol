pragma solidity ^0.4.24;

import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/acl/ACL.sol";
import "@aragon/os/contracts/apps/AragonApp.sol";

import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";
import "@aragon/apps-shared-minime/contracts/ITokenController.sol";

import "@aragon/os/contracts/lib/ens/ENS.sol";
import "@aragon/os/contracts/lib/ens/PublicResolver.sol";
import "@aragon/os/contracts/apm/Repo.sol";
import "@aragon/os/contracts/apm/APMNamehash.sol";

import "@pando/core/contracts/lib/Pando.sol";
import "@pando/organism/contracts/Organism.sol";
import "@pando/organism/contracts/Lineage.sol";
import "@pando/organism/contracts/Genesis.sol";
import "@pando/scheme-democracy/contracts/DemocracyScheme.sol";



/* ENS: 0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1 */

contract Colony is AragonApp, APMNamehash {
    bytes32 constant public DEPLOY_ORGANISM_ROLE = keccak256("DEPLOY_ORGANISM_ROLE");

    ENS public ens;
    ITokenController public tokenManager;
    DemocracyScheme public scheme;

    mapping(uint256 => Organism) public organisms;
    uint256 public organismsLength = 0;


    event DeployOrganism(address organism);

    function initialize(ENS _ens, ITokenController _tokenManager, DemocracyScheme _scheme) onlyInit public {
        initialized();

        ens = _ens;
        tokenManager = _tokenManager;
        scheme = _scheme;
    }

    function latestVersionAppBase(bytes32 appId) public view returns (address base) {
        Repo repo = Repo(PublicResolver(ens.resolver(appId)).addr(appId));
        (, base, ) = repo.getLatest();

        return base;
    }


    function deploy() public auth(DEPLOY_ORGANISM_ROLE) {
      Kernel dao = Kernel(kernel());
      ACL    acl = ACL(dao.acl());

      bytes32[4] memory apps = [
          apmNamehash("pando"),   // 0
          apmNamehash("lineage"), // 1
          apmNamehash("genesis"), // 2
          apmNamehash("organism") // 3
      ];

      organismsLength = organismsLength + 1;

      Pando pando       = Pando(latestVersionAppBase(apps[0]));
      Lineage lineage   = Lineage(dao.newAppInstance(keccak256(abi.encodePacked(apps[1], organismsLength)), latestVersionAppBase(apps[1])));
      Genesis genesis   = Genesis(dao.newAppInstance(keccak256(abi.encodePacked(apps[2], organismsLength)), latestVersionAppBase(apps[2])));
      Organism organism = Organism(dao.newAppInstance(keccak256(abi.encodePacked(apps[3], organismsLength)), latestVersionAppBase(apps[3])));

      organisms[organismsLength] = organism;

      lineage.initialize();
      genesis.initialize(pando);
      organism.initialize(pando, genesis, lineage);

      acl.createPermission(organism, lineage, lineage.MINT_ROLE(), msg.sender);
      acl.createPermission(organism, genesis, genesis.INDIVIDUATE_ROLE(), msg.sender);

      acl.createPermission(scheme, organism, organism.CREATE_RFI_ROLE(), msg.sender);
      acl.createPermission(scheme, organism, organism.MERGE_RFI_ROLE(), msg.sender);
      acl.createPermission(scheme, organism, organism.REJECT_RFI_ROLE(), msg.sender);
      acl.createPermission(scheme, organism, organism.ACCEPT_RFL_ROLE(), msg.sender);
      acl.createPermission(scheme, organism, organism.REJECT_RFL_ROLE(), msg.sender);

      emit DeployOrganism(address(organism));
    }
}
