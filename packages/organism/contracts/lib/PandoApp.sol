pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";

contract PandoApp is AragonApp {
    enum RFLState   { Pending, Accepted, Issued, Rejected, Cancelled }
    enum RFIState   { Pending, Merged, Rejected, Cancelled }
    enum RFISorting { Merge, Reject }

    struct IID {
        address organism;
        bytes32 hash;
    }

    struct IIndividuation {
        address origin;
        string  tree;
        string  message;
        string  metadata;
        IID[]   parents;
    }

    struct Individuation {
        address origin;
        uint256 blockstamp;
        string  tree;
        string  message;
        string  metadata;
        IID[]   parents;
    }

    struct RFI {
        IIndividuation individuation;
        uint256        blockstamp;
        RFIState       state;
        uint256[]      RFLids;
    }

    struct ILineage {
        address  destination;
        uint256  minimum;
        string   metadata;
    }

    struct RFL {
        ILineage lineage;
        uint256  blockstamp;
        uint256  value;
        RFLState state;
        uint256  RFIid;
    }

    function isPending(RFI _RFI) public pure returns (bool) {
        return _RFI.state == RFIState.Pending;
    }

    function isPending(RFL _RFL) public pure returns (bool) {
        return _RFL.state == RFLState.Pending;
    }

    function isAccepted(RFL _RFL) public pure returns (bool) {
        return _RFL.state == RFLState.Accepted;
    }

    function hash(Individuation _individuation) public pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                _individuation.origin,
                _individuation.blockstamp,
                _individuation.tree,
                _individuation.message,
                _individuation.metadata,
                _individuation.parents)
            );
    }
}
