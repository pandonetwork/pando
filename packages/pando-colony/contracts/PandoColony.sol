pragma solidity ^0.4.24;

import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/acl/ACL.sol";
import "@aragon/os/contracts/apps/AragonApp.sol";
import "@pando/repository/contracts/PandoRepository.sol";
import "./apm/APMFetcher.sol";


contract PandoColony is APMFetcher, AragonApp {
    bytes32 constant public CREATE_REPOSITORY_ROLE = keccak256("CREATE_REPOSITORY_ROLE");

    ENS public ens;
    bool public devchain;
    mapping(uint256 => PandoRepository) public repositories;
    uint256 public repositoriesLength = 0;

    event CreateRepository(address repository);

    /***** external functions *****/

    /**
    * @notice Initialize Colony app with `_ens` as a ENS registry
    * @param _ens Address of the ENS registry to fetch pando apps address from
    * @param _devchain Whether the app is deployed on devchain or not
    */
    function initialize(ENS _ens, bool _devchain) external onlyInit {
        initialized();
        ens = _ens;
        devchain = _devchain;
    }

    /**
    * @notice Create repository '`_name`'
    * @param _name Name of the repository
    * @param _description Description of the repository
    */
    function createRepository(string _name, string _description) external auth(CREATE_REPOSITORY_ROLE) {
        _createRepository(_name, _description);
    }

    /***** internal functions *****/

    function _createRepository(string _name, string _description) internal {
        Kernel dao = Kernel(kernel());
        ACL acl = ACL(dao.acl());
        bytes32 hash = apmNamehash("pando-repository", !devchain);

        PandoRepository repository = PandoRepository(dao.newAppInstance(hash, latestVersionAppBase(ens, hash)));
        repositoriesLength = repositoriesLength + 1;
        repositories[repositoriesLength] = repository;

        repository.initialize(_name, _description);
        acl.createPermission(msg.sender, repository, repository.PUSH_ROLE(), msg.sender);
        acl.createPermission(address(-1), repository, repository.OPEN_PR_ROLE(), msg.sender);
        acl.createPermission(msg.sender, repository, repository.SORT_PR_ROLE(), msg.sender);
        acl.createPermission(msg.sender, repository, repository.UPDATE_INFORMATIONS_ROLE(), msg.sender);

        emit CreateRepository(address(repository));
    }
}
