pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";


contract PandoApp is AragonApp {

    /**
    * @notice Commit.
    * @param origin Address the commit origins from: can be a wallet address, a branch address, a DAO address, etc.
    * @param origin Address the commit origins from: can be a wallet address, a branch address, a DAO address, etc.
    */

    struct Commit {
        address  origin;
        uint256  block;
        string   tree;
        string   message;
        bytes    parents;
        uint256  value;
    }


    /**
    * @notice Structure describing a Commit IDentifier.
    * @param version Version of the identified commit datastructure.
    * @param branch
    */
    struct CID {
        address    branch;
        bytes32    hash;
    }

    function hash(Commit _commit) pure internal returns (bytes32) {
        return keccak256(abi.encodePacked(_commit.origin, _commit.block, _commit.tree, _commit.message, _commit.parents, _commit.value));
    }

    /* function bytesToParent(bytes _parents) pure internal returns (CID[]) {

        parents[0] = CID(address(0x0), bytes32(0x0));

    } */
}
