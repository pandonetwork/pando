pragma solidity ^0.4.24;

import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/acl/ACL.sol";
import "@aragon/os/contracts/apps/AragonApp.sol";
import "@pando/repository/contracts/PandoRepository.sol";
import "./apm/APMFetcher.sol";


contract PandoColony is APMFetcher, AragonApp {
    bytes32 constant public CREATE_REPOSITORY_ROLE = keccak256("CREATE_REPOSITORY_ROLE");

    ENS public ens;
    mapping(uint256 => PandoRepository) public repositories;
    uint256 public repositoriesLength = 0;

    event CreateRepository(address repository);


    /**
    * @notice Initialize Colony app with `_ens` as ENS registry
    * @param _ens Address of the ENS registry to fetch pando apps from
    */
    function initialize(ENS _ens) onlyInit {
        initialized();
        ens = _ens;
    }

    /**
    * @notice Create repository '`_name`'
    */
    function createRepository(string _name, string _description) external auth(CREATE_REPOSITORY_ROLE) {
        Kernel dao = Kernel(kernel());
        ACL acl = ACL(dao.acl());
        bytes32 hash = apmNamehash("pando-repository");

        PandoRepository repository = PandoRepository(dao.newAppInstance(hash, latestVersionAppBase(ens, hash)));
        repositoriesLength = repositoriesLength + 1;
        repositories[repositoriesLength] = repository;

        repository.initialize(_name, _description);
        acl.createPermission(msg.sender, repository, repository.PUSH_ROLE(), msg.sender);
        acl.createPermission(msg.sender, repository, repository.UPDATE_INFORMATIONS_ROLE(), msg.sender);

        emit CreateRepository(address(repository));
    }

    function getRepositories() public view returns (address[]) {
        address[] memory all = new address[](repositoriesLength);

        for (uint i = 1; i <= repositoriesLength; i++) {
            all[i - 1] = repositories[i];
        }

        return all;
    }
}
