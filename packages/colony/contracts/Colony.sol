pragma solidity ^0.4.24;

import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/acl/ACL.sol";
import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/lib/ens/ENS.sol";
import "@aragon/os/contracts/lib/ens/PublicResolver.sol";
import "@aragon/os/contracts/apm/Repo.sol";
import "@aragon/os/contracts/apm/APMNamehash.sol";
import "@pando/organism/contracts/Organism.sol";


/* ENS: 0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1 */

contract Colony is AragonApp, APMNamehash {

    bytes32 constant public DEPLOY_ORGANISM_ROLE = keccak256("DEPLOY_ORGANISM_ROLE");

    address constant ANY_ENTITY = address(-1);

    bytes32 constant public lineageAppId  = apmNamehash("lineage");
    bytes32 constant public genesisAppId  = apmNamehash("genesis");
    bytes32 constant public organismAppId = apmNamehash("organism");

    ENS public ens;

    address public lineageBase;
    address public genesisBase;
    address public organismBase;

    mapping(uint256 => Organism) public organisms;
    uint256 public organismsLength = 0;


    event DeployOrganism(address organism);

    function initialize(ENS _ens) onlyInit public {
        initialized();

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
    }

    function deploy() public {
      Kernel dao = Kernel(kernel());
      ACL    acl = ACL(dao.acl());

      address ANY_ENTITY = address(-1);

      // MiniMeToken
      /* const token = await MiniMeToken.new(ADDR_NULL, ADDR_NULL, 0, 'Native Lineage Token', 0, 'NLT', true) */
      /* // Genesis
      const receipt_2 = await dao.methods['newAppInstance(bytes32,address)']('0x0001', (await Genesis.new()).address, { from: root })
      const genesis   = await Genesis.at(receipt_2.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
      await genesis.initialize()
      // Lineage
      const receipt_3 = await dao.methods['newAppInstance(bytes32,address)']('0x0002', (await Lineage.new()).address, { from: root })
      const lineage   = await Lineage.at(receipt_3.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
      await token.changeController(lineage.address)
      await lineage.initialize(token.address)
      // Organism
      const receipt_4 = await dao.methods['newAppInstance(bytes32,address)']('0x0003', (await Organism.new()).address, { from: root })
      const organism       = await Organism.at(receipt_4.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
      await acl.createPermission(organism.address, genesis.address, await genesis.INDIVIDUATE_ROLE(), root, { from: root })
      await acl.createPermission(organism.address, lineage.address, await lineage.MINT_ROLE(), root, { from: root })
      await acl.createPermission(organism.address, lineage.address, await lineage.BURN_ROLE(), root, { from: root })
      await acl.createPermission(authorized, organism.address, await organism.CREATE_RFI_ROLE(), root, { from: root })
      await acl.createPermission(authorized, organism.address, await organism.MERGE_RFI_ROLE(), root, { from: root })
      await acl.createPermission(authorized, organism.address, await organism.REJECT_RFI_ROLE(), root, { from: root })
      await acl.createPermission(authorized, organism.address, await organism.ACCEPT_RFL_ROLE(), root, { from: root })
      await acl.createPermission(authorized, organism.address, await organism.REJECT_RFL_ROLE(), root, { from: root })
      await organism.initialize(genesis.address, lineage.address, { from: root }) */

      /* MiniMeToken token = new MiniMeToken(address(0), address(0), 0, 'Native Lineage Token', 0, 'NLT', true);
      Lineage lineage   = Lineage(dao.newAppInstance(lineageAppId, lineageBase));
      Genesis genesis   = Genesis(dao.newAppInstance(genesisAppId, genesisBase));
      Organism organism = Organism(dao.newAppInstance(organismAppId, organismBase)); */

      /* acl.createPermission(organism, genesis, genesis.INDIVIDUATE_ROLE());
      acl.createPermission(organism, lineage, lineage.MINT_ROLE());
      acl.createPermission(organism, lineage, lineage.BURN_ROLE());
      acl.createPermission(authorized, organism, organism.CREATE_RFI_ROLE());
      acl.createPermission(authorized, organism, organism.MERGE_RFI_ROLE());
      acl.createPermission(authorized, organism, organism.REJECT_RFI_ROLE());
      acl.createPermission(authorized, organism, organism.ACCEPT_RFL_ROLE());
      acl.createPermission(authorized, organism, organism.REJECT_RFL_ROLE()); */

      /* token.generateTokens(msg.sender, 1);
      token.changeController(lineage);
      lineage.initialize(token);
      genesis.initialize();
      organism.initialize(genesis, lineage); */


      /* organismsLength = organismsLength + 1;
      organisms[organismsLength] = organism; */

      /* emit DeployOrganism(address(organism)); */
    }
}
