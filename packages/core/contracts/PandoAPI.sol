pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "./Pando.sol";
import "./PandoHistory.sol";
import "./PandoLineage.sol";


// Public function are abstract
// actual implementations refers to internal methods like _sort _ valuate, etc. which actually enforces state machine checks
// The pando interface version is tied to the library which can be deployed only once;
// If I send for instance a valuate RFA to a voting app the app must be aware of the internal logic like: to execute it it need to know that RFA are accepted.
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
    using Pando for Pando.RFA;

    bytes32 constant public CREATE_RFI_ROLE  = keccak256("CREATE_RFI_ROLE");
    bytes32 constant public SORT_RFI_ROLE    = keccak256("SORT_RFI_ROLE");
    bytes32 constant public CREATE_RFL_ROLE  = keccak256("CREATE_RFL_ROLE");
    bytes32 constant public VALUATE_RFL_ROLE = keccak256("VALUATE_RFL_ROLE");
    bytes32 constant public SORT_RFL_ROLE    = keccak256("SORT_RFL_ROLE");

    event CreateRFI(uint256 id);
    event CreateRFA(uint256 id);
    event SortRFI(uint256 id, Pando.RFISorting sorting);
    event SortRFL(uint256 id, Pando.RFASorting sorting);
    event CancelRFI(uint256 id);
    event CancelRFL(uint256 id);
    event ValuateRFL(uint256 id, uint256 amount);
    event MintRFL(uint256 id, address destination, uint256 amount);

    PandoHistory public history;
    PandoLineage public lineage;

    // Use a mapping instead of an array to ease app upgrade
    // See https://github.com/aragon/aragon-apps/pull/428
    // See https://youtu.be/sJ7VECqHFAg?t=9m27s
    mapping (uint256 => Pando.RFI) internal RFIs;
    mapping (uint256 => Pando.RFA) internal RFAs;

    uint256 public RFIsLength = 0;
    uint256 public RFAsLength = 0;

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

    function createRFI(Pando.IIndividuation _individuation, Pando.IAlliance[] _alliances) isInitialized auth(CREATE_RFI_ROLE) public returns (uint256 RFIid)  {
        RFIid = _createRFI(_individuation, _alliances);
    }

    function sortRFI(uint256 _RFIid, Pando.RFISorting _sorting) isInitialized auth(CREATE_RFI_ROLE) public {
        Pando.RFI storage RFI = RFIs[_RFIid];

        if (_sorting == Pando.RFISorting.Merge) {
            for(uint256 i = 0; i < RFI.RFAids.length; i++) {
                require(RFAs[RFI.RFAids[i]].isValuated());
            }
        }

        _sortRFI(_RFIid, _sorting);
    }

    function sortRFA(uint256 _id, Pando.RFASorting _sorting) isInitialized auth(SORT_RFL_ROLE) public {
        Pando.RFA storage RFA = RFAs[_id];

        require(RFA.isValuated()); // No: on peut acncel avant

        /* if(_sorting == Pando.RFASorting.Accept) {
            RFA.state = Pando.RFAState.Accepted;
        }  */


        if(_sorting == Pando.RFASorting.Reject) {
            Pando.RFI storage RFI = RFIs[RFA.RFIid];

            RFA.state = Pando.RFAState.Rejected;
            RFI.state = Pando.RFIState.Cancelled;
        }
    }

    function valuateRFA(uint256 _RFAid, uint256 _amount) isInitialized auth(VALUATE_RFL_ROLE) public {
        require(RFAs[_RFAid].isPending());
        require(_amount >= RFAs[_RFAid].alliance.minimum);

        _valuateRFA(_RFAid, _amount);
    }

    /*
    * @group
    *
    * getters
    * public or external
    */

    function getRFI(uint256 _RFIid) public view returns (Pando.RFI) {
        return RFIs[_RFIid];
    }

    function getRFA(uint256 _RFAid) public view returns (Pando.RFA) {
        return RFAs[_RFAid];
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

    /*
    * @group
    *
    * transactions
    * internal
    */

    function _createRFI(Pando.IIndividuation _individuation, Pando.IAlliance[] _alliances) internal returns (uint256 RFIid)  {
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

        for(uint256 j = 0; j < _alliances.length; j++) {
            uint256 RFAid = _createRFA(_alliances[j], RFIid);
            uint256 index = RFI.RFAids.length++;
            RFI.RFAids[index] = RFAid;
        }

        emit CreateRFI(RFIid);
    }

    function _createRFA(Pando.IAlliance _alliance, uint256 _RFIid) internal returns (uint256 RFAid) {
        require(RFIs[_RFIid].individuation.origin != address(0));

        RFAsLength            = RFAsLength + 1;
        RFAid                 = RFAsLength;
        Pando.RFA storage RFA = RFAs[RFAid];

        RFA.alliance.destination = _alliance.destination;
        RFA.alliance.minimum     = _alliance.minimum;
        RFA.alliance.metadata    = _alliance.metadata;

        RFA.blockstamp = block.number;
        RFA.amount     = 0;
        RFA.state      = Pando.RFAState.Pending;
        RFA.RFIid      = _RFIid;

        emit CreateRFA(RFAid);
    }

    function _sortRFI(uint256 _RFIid, Pando.RFISorting _sorting) internal {
        Pando.RFI storage RFI = RFIs[_RFIid];

        if (_sorting == Pando.RFISorting.Merge) {
            RFI.state = Pando.RFIState.Merged;

            history.individuate(RFI.individuation);

            for (uint256 i = 0; i < RFI.RFAids.length; i++) {
                _mintRFA(RFI.RFAids[i]);
            }
        } else if (_sorting == Pando.RFISorting.Reject) {
            RFI.state = Pando.RFIState.Rejected;

            for (uint256 j = 0; j < RFI.RFAids.length; j++) {
                _cancelRFA(RFI.RFAids[j]);
            }
        } else {
            revert("Unknown sorting for RFI");
        }

        emit SortRFI(_RFIid, _sorting);
    }

    function _valuateRFA(uint256 _RFAid, uint256 _amount) internal {
        Pando.RFA storage RFA = RFAs[_RFAid];

        RFA.state  = Pando.RFAState.Valuated;
        RFA.amount = _amount;

        emit ValuateRFL(_RFAid, _amount);
    }

    function _cancelRFA(uint256 _RFAid) internal {
        Pando.RFA storage RFA = RFAs[_RFAid];

        RFA.state = Pando.RFAState.Cancelled;

        emit CancelRFL(_RFAid);
    }

    function _mintRFA(uint256 _RFAid) internal {
        Pando.RFA storage RFA = RFAs[_RFAid];

        RFA.state = Pando.RFAState.Issued;
        lineage.mint(RFA.alliance.destination, RFA.amount);

        emit MintRFL(_RFAid, RFA.alliance.destination, RFA.amount);
    }
}
