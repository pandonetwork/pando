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


contract Colony is AragonApp, APMNamehash {
    bytes32 constant public DEPLOY_ORGANISM_ROLE = keccak256("DEPLOY_ORGANISM_ROLE");

    ENS              public ens;
    ITokenController public tokenManager;
    DemocracyScheme  public scheme;

    mapping(uint256 => Organism) public organisms;
    uint256 public organismsLength = 0;

    event DeployOrganism(address organism);


    /**
   * @notice Initialize Colony app with `_ens` as ENS registry, `_tokenManager` as a token manager and `_scheme` as a governance scheme for all upcoming organisms
   * @param _ens Address of the ENS registry through which to fetch pando apps
   * @param _tokenManager Token manager through which governance tokens are going to be minted for contributors
   * @param _scheme Governance scheme for all upcoming organisms
   */
    function initialize(ENS _ens, ITokenController _tokenManager, DemocracyScheme _scheme) public onlyInit {
        initialized();

        ens = _ens;
        tokenManager = _tokenManager;
        scheme = _scheme;
    }

    /**
   * @notice Deploy a new organism
   */
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

        Pando       pando = Pando(latestVersionAppBase(apps[0]));
        Lineage   lineage = Lineage(dao.newAppInstance(apps[1], latestVersionAppBase(apps[1])));
        Genesis   genesis = Genesis(dao.newAppInstance(apps[2], latestVersionAppBase(apps[2])));
        Organism organism = Organism(dao.newAppInstance(apps[3], latestVersionAppBase(apps[3])));

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

    function latestVersionAppBase(bytes32 appId) public view returns (address base) {
        Repo repo = Repo(PublicResolver(ens.resolver(appId)).addr(appId));
        (, base, ) = repo.getLatest();

        return base;
    }

    function getOrganisms() public view returns (address[]) {
        address[] memory all = new address[](organismsLength);

        for (uint i = 1; i <= organismsLength; i++) {
            all[i - 1] = organisms[i];
        }

        return all;
    }
}
