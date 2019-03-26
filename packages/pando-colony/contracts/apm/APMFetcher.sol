pragma solidity ^0.4.24;

import "@aragon/os/contracts/lib/ens/ENS.sol";
import "@aragon/os/contracts/lib/ens/PublicResolver.sol";
import "@aragon/os/contracts/apm/Repo.sol";


contract APMNamehash {
    bytes32 constant public ETH_NODE = keccak256(bytes32(0), keccak256("eth"));
    bytes32 constant public APM_NODE = keccak256(ETH_NODE, keccak256("aragonpm"));
    bytes32 constant public OPEN_NODE = keccak256(APM_NODE, keccak256("open"));

    function apmNamehash(string name, bool open) internal pure returns (bytes32) {
        if (open) {
            return keccak256(OPEN_NODE, keccak256(name));
        } else {
            return keccak256(APM_NODE, keccak256(name));
        }
    }
}


contract APMFetcher is APMNamehash {
    function latestVersionAppBase(ENS ens, bytes32 appId) public view returns (address base) {
        Repo repo = Repo(PublicResolver(ens.resolver(appId)).addr(appId));
        (, base, ) = repo.getLatest();

        return base;
    }
}
