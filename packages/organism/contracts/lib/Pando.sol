pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

/* import "@aragon/os/contracts/apps/AragonApp.sol"; */

contract Pando {
    enum RFLState   { Pending, Accepted, Issued, Rejected, Cancelled }
    enum RFIState   { Pending, Merged, Rejected, Cancelled }
    enum RFISorting { Merge, Reject }

    struct IID {
        address organism;
        bytes32 hash;
    }

    struct IIndividuation {
        string  metadata;
    }

    struct Individuation {
        uint256 blockstamp;
        string  metadata;
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

    constructor() public {}

    function hash(Individuation _individuation) public pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                _individuation.blockstamp,
                _individuation.metadata)
            );
    }
}
