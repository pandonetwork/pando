pragma solidity ^0.4.24;

import "@aragon/os/contracts/evmscript/EVMScriptRegistry.sol";
import "@aragon/os/contracts/factory/DAOFactory.sol";
import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/acl/ACL.sol";
import "@aragon/os/contracts/lib/minime/MiniMeToken.sol";

/* import "@aragon/id/contracts/IFIFSResolvingRegistrar.sol"; */

/* import "@aragon/apps-voting/contracts/Voting.sol"; */
/* import "@aragon/apps-vault/contracts/Vault.sol"; */
//import "@aragon/apps-vault/contracts/connectors/ETHConnector.sol";
//import "@aragon/apps-vault/contracts/connectors/ERC20Connector.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
/* import "@aragon/apps-finance/contracts/Finance.sol"; */


contract SpecimenKit {
    DAOFactory public factory;

    // ensure alphabetic order
    enum Apps { Finance, TokenManager, Vault, Voting }

    event DeployToken(address token, address indexed cacheOwner);
    event DeployInstance(address dao, address indexed token);
    event InstalledApp(address appProxy, bytes32 appId);
    event NewSpecimen(address dao, address token);

    address constant ANY_ENTITY = address(-1);



    constructor() {
        factory = new DAOFactory(new Kernel(), new ACL(), new EVMScriptRegistryFactory());
    }

    function newSpecimen() external {
        /* Kernel dao        = factory.newDAO(this);
        ACL acl           = ACL(dao.acl());
        acl.createPermission(this, address(dao), dao.APP_MANAGER_ROLE(), this);

        TokenManager tokenManager = TokenManager(dao.newAppInstance('0x1234', new TokenManager())); */


        MiniMeTokenFactory tokenFactory = new MiniMeTokenFactory();
/*
           		MiniMeToken newToken = new MiniMeToken(
                    factory,
                    0,
                    0,
                    _trelloCardId,
                    0,
                    'TTOK',
                    true
                    ); */

        MiniMeToken token         = new MiniMeToken(tokenFactory, MiniMeToken(0), uint(0), 'Native Governance Token', uint8(0), 'NGT', true);

        /*token.changeController(tokenManager);
        tokenManager.initialize(token, false, uint256(0), false); */


        /* acl.createPermission(voting, tokenManager, tokenManager.ASSIGN_ROLE(), voting);
        acl.createPermission(voting, tokenManager, tokenManager.REVOKE_VESTINGS_ROLE(), voting); */
        /* acl.createPermission(this, tokenManager, tokenManager.MINT_ROLE(), this); */



        /* Vault vaultBase = Vault(latestVersionAppBase(appIds[uint8(Apps.Vault)]));
        // inits
        vault.initialize(vaultBase.erc20ConnectorBase(), vaultBase.ethConnectorBase()); // init with trusted connectors
        finance.initialize(IVaultConnector(vault), uint64(-1) - uint64(now)); // yuge period */

        // clean-up
        /* acl.grantPermission(voting, dao, dao.APP_MANAGER_ROLE());
        acl.setPermissionManager(voting, dao, dao.APP_MANAGER_ROLE());
        acl.grantPermission(voting, acl, acl.CREATE_PERMISSIONS_ROLE());
        acl.setPermissionManager(voting, acl, acl.CREATE_PERMISSIONS_ROLE());
        acl.grantPermission(voting, tokenManager, tokenManager.MINT_ROLE());
        acl.setPermissionManager(voting, tokenManager, tokenManager.MINT_ROLE()); */
        // no revokes to save gas as factory can't do anything to orgs (clutters acl representation)

        /* emit NewSpecimen(dao, token); */
    }

}
