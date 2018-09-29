pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";


contract PandoApp is AragonApp {

    enum RFCState   { Pending, Valuated, Sorted }
    enum RFCStatus  { Open, Merged, Rejected, Cancelled }
    enum RFCSorting { Merge, Reject, Cancel }

    struct Commit {
        address  origin;
        uint256  block;
        string   tree;
        string   message;
        bytes    parents;
        uint256  value;
    }

    struct RFC {
        Commit    commit;
        RFCState  state;
        RFCStatus status;
    }

    function hash(Commit _commit) pure internal returns (bytes32) {
        return keccak256(abi.encodePacked(_commit.origin, _commit.block, _commit.tree, _commit.message, _commit.parents, _commit.value));
    }
}
