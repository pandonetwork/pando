pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;


// Une 'origine' produit des individuations en créant des déscendants d'autres individuation. Se sont des individuations - des gestes - qui produisent d'autres gestes par l'entremise de l'origine.

library Pando {
    enum RFAState   { Pending, Valuated, Issued, Rejected, Cancelled }
    enum RFASorting { Reject, Cancel }

    enum RFIState   { Pending, Merged, Rejected, Cancelled }
    enum RFISorting { Merge, Reject, Cancel }

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

    struct IAlliance {
        address  destination;
        uint256  minimum;
        string   metadata;
    }

    // Request for individuation
    struct RFI {
        IIndividuation individuation;
        uint256        blockstamp;
        RFIState       state;
        uint256[]      RFAids;
    }


    struct RFA {
        IAlliance alliance;
        uint256   blockstamp;
        uint256   amount;
        RFAState  state;
        uint256   RFIid;
    }


    function isPending(RFI _RFI) pure public returns (bool) {
        return _RFI.state == RFIState.Pending;
    }


    function isPending(RFA _RFA) pure public returns (bool) {
        return _RFA.state == RFAState.Pending;
    }

    function isValuated(RFA _RFA) pure public returns (bool) {
        return _RFA.state == RFAState.Valuated;
    }

    function hash(Individuation _individuation) pure public returns (bytes32) {
        return keccak256(abi.encodePacked(_individuation.origin, _individuation.blockstamp, _individuation.tree, _individuation.message, _individuation.metadata, _individuation.parents));
    }
}
