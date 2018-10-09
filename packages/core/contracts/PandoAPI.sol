pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "./Pando.sol";
import "./PandoHistory.sol";
import "./PandoLineage.sol";


// Public function are abstract
// actual implementations refers to internal methods like _sort _ accept, etc. which actually enforces state machine checks
// The pando interface version is tied to the library which can be deployed only once;
// If I send for instance a accept RFL to a voting app the app must be aware of the internal logic like: to execute it it need to know that RFL are accepted.
// So the voting app needs to have access to the internal state of the Kit. The best idea is to actually turn kit into decision engine which can be aware of the state of the kit.

// Pando app: three smart contracts on top of which one can build actual apps thorugh the exposed API of the PandoEngine contract. The PandoEngine is the source of thrust storing state and enforcing basic stuff about how that state can be modified

// The PandoLineage and PandoHistory permissions are set one for all and can't be modified. Only the PandoEngine can access it. This is set at DAO deployement and cannot be changed.

// This apps built on top of the pandoengine contract are supposed to propose governance and stuff and map between the state of the engine and the apps (for instance map a RFI id with a vote ID). They fetch data from the Engine and transact to the engine (Necessity to extend the sandboxing policy)

// For instance a dictator kit will have an auth(DICTATOR_ROLE) for function call

// It's this kit which are actually work as app in the AragonFrontEnd

// It's up to the kit to define more fine-grained stuff - such as the requirement for staking and all - on top of PandoEngine API. Thes kits you wanna be used by tge must just enfoce a minimum API to provide CLI interoperability with different KITs

// All the apps need to rely on the same version of the pando library defining shared data structures and helpers function on top of these datastructures;

// The kits have no direct access neither to the lineage token nor to the history graph - thanks to the ACL and role enforcement. The only way for kits to update token and history is to go trhough the PandoEngine API.


contract PandoAPI is AragonApp {
    using Pando for Pando.Individuation;
    using Pando for Pando.RFI;
    using Pando for Pando.RFL;

    bytes32 constant public CREATE_RFI_ROLE = keccak256("CREATE_RFI_ROLE");
    bytes32 constant public MERGE_RFI_ROLE  = keccak256("MERGE_RFI_ROLE");
    bytes32 constant public REJECT_RFI_ROLE = keccak256("REJECT_RFI_ROLE");
    bytes32 constant public ACCEPT_RFL_ROLE = keccak256("ACCEPT_RFL_ROLE");
    bytes32 constant public REJECT_RFL_ROLE = keccak256("REJECT_RFL_ROLE");

    event CreateRFI(uint256 id);
    event MergeRFI(uint256 id);
    event RejectRFI(uint256 id);
    event CancelRFI(uint256 id);

    event CreateRFL(uint256 id);
    event AcceptRFL(uint256 id, uint256 value);
    event RejectRFL(uint256 id);
    event CancelRFL(uint256 id);
    event MintRFL(uint256 id, address destination, uint256 value); // ISSUE RFL PLUTOT

    // ADD MODIFIER FOR RFIExist(_RFIid) and RFLExists(_RFLid)

    PandoHistory public history;
    PandoLineage public lineage;

    // Use a mapping instead of an array to ease app upgrade
    // See https://github.com/aragon/aragon-apps/pull/428
    // See https://youtu.be/sJ7VECqHFAg?t=9m27s
    mapping (uint256 => Pando.RFI) public RFIs;
    mapping (uint256 => Pando.RFL) public RFLs;

    uint256 public RFIsLength = 0;
    uint256 public RFLsLength = 0;

    /*
    * @group
    *
    * transactions
    * public or external
    */

    function initialize(PandoHistory _history, PandoLineage _lineage) onlyInit external {
        initialized();
        history = _history;
        lineage = _lineage;
    }

    function createRFI(Pando.IIndividuation _individuation, Pando.ILineage[] _lineages) isInitialized auth(CREATE_RFI_ROLE) public returns (uint256 RFIid)  {
        RFIid = _createRFI(_individuation, _lineages);
    }


    function mergeRFI(uint256 _RFIid) isInitialized auth(MERGE_RFI_ROLE) public {
        require(_RFIid <= RFIsLength && RFIs[_RFIid].isPending());

        Pando.RFI storage RFI = RFIs[_RFIid];


        for(uint256 i = 0; i < RFI.RFLids.length; i++) {
            require(RFLs[RFI.RFLids[i]].isAccepted());
        }

        _mergeRFI(_RFIid);
    }

    function rejectRFI(uint256 _RFIid) isInitialized auth(REJECT_RFI_ROLE) public {
        require(_RFIid <= RFIsLength && RFIs[_RFIid].isPending());

        _rejectRFI(_RFIid);
    }

    function acceptRFL(uint256 _RFLid, uint256 _value) isInitialized auth(ACCEPT_RFL_ROLE) public {
        require(_RFLid <= RFLsLength);

        Pando.RFL storage RFL = RFLs[_RFLid];

        require(RFL.isPending());
        require(_value >= RFL.lineage.minimum);

        _acceptRFL(_RFLid, _value);
    }

    function rejectRFL(uint256 _RFLid) isInitialized auth(REJECT_RFL_ROLE) public {
        require(_RFLid <= RFLsLength);

        Pando.RFL storage RFL = RFLs[_RFLid];

        require(RFL.isPending());

        _rejectRFL(_RFLid);
    }

    /*
    * @group
    *
    * getters
    * public or external
    */

    function getRFI(uint256 _RFIid) public view returns (Pando.RFI) {
        require(_RFIid <= RFIsLength);


        return RFIs[_RFIid];
    }

    function getRFL(uint256 _RFLid) public view returns (Pando.RFL) {
        require(_RFLid <= RFLsLength);


        return RFLs[_RFLid];
    }

    function head() public view returns (bytes32) {
        return history.head();
    }

    function getHead() isInitialized public view returns (Pando.Individuation) {
        return history.getHead();
    }

    function getIndividuationHash(Pando.Individuation _individuation) public pure returns (bytes32) {
        return _individuation.hash();
    }

    function getLineageToken() public view returns (address) {
        return address(lineage.token());
    }

    /*
    * @group
    *
    * transactions
    * internal
    */

    function _createRFI(Pando.IIndividuation _individuation, Pando.ILineage[] _lineages) internal returns (uint256 RFIid)  {
        // msg.sender is gonna be the address of a kit contract built on top of the API
        // Do you we wanna to make sure that the transaction is actually initialized by _individuation.origin ?
        // If this is the case then we're gonna need to ask for a proof of identity through a ECDSA signature
        // See https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/cryptography/ECDSA.sol

        RFIsLength = RFIsLength + 1;
        RFIid      = RFIsLength;

        Pando.RFI storage RFI = RFIs[RFIid];

        RFI.blockstamp = block.number;
        RFI.state      = Pando.RFIState.Pending;

        RFI.individuation.origin     = _individuation.origin;
        RFI.individuation.tree       = _individuation.tree;
        RFI.individuation.message    = _individuation.message;
        RFI.individuation.metadata   = _individuation.metadata;

        // solc 4.0.24 cannot directly convert dynamic struct array from memory to storage
        RFI.individuation.parents.length = _individuation.parents.length;
        for (uint256 i = 0; i < _individuation.parents.length; i++) {
            RFI.individuation.parents[i] = _individuation.parents[i];
        }

        for(uint256 j = 0; j < _lineages.length; j++) {
            uint256 RFLid = _createRFL(_lineages[j], RFIid);
            uint256 index = RFI.RFLids.length++;
            RFI.RFLids[index] = RFLid;
        }

        emit CreateRFI(RFIid);
    }

    function _mergeRFI(uint256 _RFIid) internal {
        Pando.RFI storage RFI = RFIs[_RFIid];

        RFI.state = Pando.RFIState.Merged;

        history.individuate(RFI.individuation);

        for (uint256 i = 0; i < RFI.RFLids.length; i++) {
            _issueRFL(RFI.RFLids[i]);
        }

        emit MergeRFI(_RFIid);
    }

    function _rejectRFI(uint256 _RFIid) internal {
        Pando.RFI storage RFI = RFIs[_RFIid];

        RFI.state = Pando.RFIState.Rejected;

        for (uint256 j = 0; j < RFI.RFLids.length; j++) {
            _cancelRFL(RFI.RFLids[j]);
        }

        emit RejectRFI(_RFIid);
    }

    function _cancelRFI(uint256 _RFIid) internal {
        Pando.RFI storage RFI = RFIs[_RFIid];

        RFI.state = Pando.RFIState.Cancelled;

        for (uint256 i = 0; i < RFI.RFLids.length; i++) {
            Pando.RFL storage RFL = RFLs[RFI.RFLids[i]];

            if (RFL.state != Pando.RFLState.Rejected)
                _cancelRFL(RFI.RFLids[i]);
        }

        emit CancelRFI(_RFIid);
    }

    function _createRFL(Pando.ILineage _lineage, uint256 _RFIid) internal returns (uint256 RFLid) {
        require(RFIs[_RFIid].individuation.origin != address(0));

        RFLsLength            = RFLsLength + 1;
        RFLid                 = RFLsLength;
        Pando.RFL storage RFL = RFLs[RFLid];

        RFL.lineage.destination = _lineage.destination;
        RFL.lineage.minimum     = _lineage.minimum;
        RFL.lineage.metadata    = _lineage.metadata;

        RFL.blockstamp = block.number;
        RFL.value     = 0;
        RFL.state      = Pando.RFLState.Pending;
        RFL.RFIid      = _RFIid;

        emit CreateRFL(RFLid);
    }

    function _acceptRFL(uint256 _RFLid, uint256 _value) internal {
        Pando.RFL storage RFL = RFLs[_RFLid];

        RFL.state  = Pando.RFLState.Accepted;
        RFL.value = _value;

        emit AcceptRFL(_RFLid, _value);
    }

    function _rejectRFL(uint256 _RFLid) internal {
        Pando.RFL storage RFL = RFLs[_RFLid];

        RFL.state = Pando.RFLState.Rejected;
        _cancelRFI(RFL.RFIid);

        emit RejectRFL(_RFLid);
    }

    function _cancelRFL(uint256 _RFLid) internal {
        Pando.RFL storage RFL = RFLs[_RFLid];

        RFL.state = Pando.RFLState.Cancelled;

        emit CancelRFL(_RFLid);
    }

    function _issueRFL(uint256 _RFLid) internal {
        Pando.RFL storage RFL = RFLs[_RFLid];

        RFL.state = Pando.RFLState.Issued;
        lineage.mint(RFL.lineage.destination, RFL.value);

        emit MintRFL(_RFLid, RFL.lineage.destination, RFL.value);
    }
}
