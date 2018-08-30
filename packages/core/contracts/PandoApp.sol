pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";


contract PandoApp is AragonApp {
    /**
    * @notice Structure identifying and describing a snapshot
    * @param origin The address the snapshot origins from: it can be a wallet address, a branch address or a DAO address, etc.
    */
    struct Snapshot {
        uint256[3] version;
        address    author;
        uint256    timestamp;
        bytes32[]  parents;
        string     tree;
    }

    struct Commit {
        Snapshot snapshot;
        address  origin;
        uint256  block;
        uint256  value;
    }

    function hash(Snapshot _snapshot) pure internal returns (bytes32) {
        return keccak256(abi.encodePacked(_snapshot.author, _snapshot.timestamp, _snapshot.parents, _snapshot.tree));
    }

    function cid(Snapshot _snapshot) pure internal returns (bytes32) {
        return keccak256(abi.encodePacked(_snapshot.author, _snapshot.timestamp, _snapshot.parents, _snapshot.tree));
    }
}
