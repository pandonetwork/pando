pragma solidity ^0.4.24;

import "@aragon/os/contracts/factory/DAOFactory.sol";
import "@aragon/os/contracts/apm/Repo.sol";
import "@aragon/os/contracts/lib/ens/ENS.sol";
import "@aragon/os/contracts/lib/ens/PublicResolver.sol";
import "@aragon/os/contracts/apm/APMNamehash.sol";

import "@aragon/apps-voting/contracts/Voting.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";

contract KitBase is APMNamehash {
    ENS public ens;
    DAOFactory public fac;

    event DeployInstance(address dao);
    event InstalledApp(address appProxy, bytes32 appId);

    function KitBase(DAOFactory _fac, ENS _ens) {
        ens = _ens;

        // If no factory is passed, get it from on-chain bare-kit
        if (address(_fac) == address(0)) {
            bytes32 bareKit = apmNamehash("bare-kit");
            fac = KitBase(latestVersionAppBase(bareKit)).fac();
        } else {
            fac = _fac;
        }
    }

    function latestVersionAppBase(bytes32 appId) public view returns (address base) {
        Repo repo = Repo(PublicResolver(ens.resolver(appId)).addr(appId));
        (,base,) = repo.getLatest();

        return base;
    }
}

contract DemocracyKit is KitBase {
    MiniMeTokenFactory tokenFactory;

    uint256 constant PCT = 10 ** 16;
    address constant ANY_ENTITY = address(-1);

    constructor (ENS ens) KitBase(DAOFactory(0), ens) {
        tokenFactory = new MiniMeTokenFactory();
    }

    function newInstance() {
        Kernel dao = fac.newDAO(this);
        ACL acl = ACL(dao.acl());
        acl.createPermission(this, dao, dao.APP_MANAGER_ROLE(), this);

        address root = msg.sender;

        bytes32 colonyAppId = apmNamehash("colony");
        bytes32 votingAppId = apmNamehash("voting");
        bytes32 tokenManagerAppId = apmNamehash("token-manager");

        /* Voting voting = Voting(dao.newAppInstance(votingAppId, latestVersionAppBase(votingAppId)));
        TokenManager tokenManager = TokenManager(dao.newAppInstance(tokenManagerAppId, latestVersionAppBase(tokenManagerAppId)));

        MiniMeToken token = tokenFactory.createCloneToken(MiniMeToken(0), 0, "App token", 0, "APP", true);
        token.changeController(tokenManager); */

        /* address root = msg.sender;
        bytes32 appId = apmNamehash("apiary");
        bytes32 votingAppId = apmNamehash("voting");
        bytes32 tokenManagerAppId = apmNamehash("token-manager");

        Voting voting = Voting(dao.newAppInstance(votingAppId, latestVersionAppBase(votingAppId)));
        TokenManager tokenManager = TokenManager(dao.newAppInstance(tokenManagerAppId, latestVersionAppBase(tokenManagerAppId)));

        MiniMeToken token = tokenFactory.createCloneToken(MiniMeToken(0), 0, "App token", 0, "APP", true);
        token.changeController(tokenManager);

        // Initialize apps

        tokenManager.initialize(token, true, 0);
        voting.initialize(token, uint64(50 * PCT), uint64(20 * PCT), 1 days);

        acl.createPermission(this, tokenManager, tokenManager.MINT_ROLE(), this);
        tokenManager.mint(root, 1); // Give one token to root

        acl.createPermission(ANY_ENTITY, voting, voting.CREATE_VOTES_ROLE(), root);

        acl.grantPermission(voting, tokenManager, tokenManager.MINT_ROLE());

        // Clean up permissions
        acl.grantPermission(root, dao, dao.APP_MANAGER_ROLE());
        acl.revokePermission(this, dao, dao.APP_MANAGER_ROLE());
        acl.setPermissionManager(root, dao, dao.APP_MANAGER_ROLE());

        acl.grantPermission(root, acl, acl.CREATE_PERMISSIONS_ROLE());
        acl.revokePermission(this, acl, acl.CREATE_PERMISSIONS_ROLE());
        acl.setPermissionManager(root, acl, acl.CREATE_PERMISSIONS_ROLE()); */

        emit DeployInstance(dao);
    }
}
