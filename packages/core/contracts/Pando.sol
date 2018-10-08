pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;


// Une 'origine' produit des individuations en créant des déscendants d'autres individuation. Se sont des individuations - des gestes - qui produisent d'autres gestes par l'entremise de l'origine.

library Pando {
    enum RFLState   { Pending, Accepted, Issued, Rejected, Cancelled }
    enum RFIState   { Pending, Merged, Rejected, Cancelled }
    enum RFISorting { Merge, Reject }

     // merge or reject can be actionned by the kits
     // cancel is called from internal function in case a RFI or a RFL becomes useless due to a related RFI or RFL being rejected

    struct IID {
        address api;
        bytes32 hash;
    }

    struct IIndividuation {
        address origin;
        string  tree;
        string  message;
        string  metadata;
        IID[]   parents;
    }

    // Un commit est un est acte d'individuation, (par les parents), pas un état
    struct Individuation {
        address origin;
        uint256 blockstamp;
        string  tree;
        string  message;
        string  metadata;
        IID[]   parents;
    }

    // Request for individuation
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


    function isPending(RFI _RFI) pure public returns (bool) {
        return _RFI.state == RFIState.Pending;
    }


    function isPending(RFL _RFL) pure public returns (bool) {
        return _RFL.state == RFLState.Pending;
    }

    // rename: is accepted
    function isAccepted(RFL _RFL) pure public returns (bool) {
        return _RFL.state == RFLState.Accepted;
    }

    function hash(Individuation _individuation) pure public returns (bytes32) {
        return keccak256(abi.encodePacked(_individuation.origin, _individuation.blockstamp, _individuation.tree, _individuation.message, _individuation.metadata, _individuation.parents));
    }
}
