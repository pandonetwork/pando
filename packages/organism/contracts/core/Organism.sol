pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

/* import "@aragon/apps-shared-minime/contracts/ITokenController.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol"; */
import "../lib/PandoApp.sol";
import "./Genesis.sol";
import "./Lineage.sol";


contract Organism is PandoApp {
    bytes32 constant public CREATE_RFI_ROLE  = keccak256("CREATE_RFI_ROLE");
    bytes32 constant public MERGE_RFI_ROLE   = keccak256("MERGE_RFI_ROLE");
    bytes32 constant public REJECT_RFI_ROLE  = keccak256("REJECT_RFI_ROLE");
    bytes32 constant public ACCEPT_RFL_ROLE  = keccak256("ACCEPT_RFL_ROLE");
    bytes32 constant public REJECT_RFL_ROLE  = keccak256("REJECT_RFL_ROLE");
    bytes32 constant public INDIVIDUATE_ROLE = keccak256("INDIVIDUATE_ROLE");

    Genesis public genesis;
    Lineage public lineage;

    // Use a mapping instead of an array to ease app upgrade
    // See https://github.com/aragon/aragon-apps/pull/428
    // See https://youtu.be/sJ7VECqHFAg?t=9m27s
    mapping (uint256 => RFI) public RFIs;
    mapping (uint256 => RFL) public RFLs;

    uint256 public RFIsLength = 0;
    uint256 public RFLsLength = 0;


    event CreateRFI(uint256 indexed id);
    event MergeRFI(uint256 indexed id);
    event RejectRFI(uint256 indexed id);
    event CancelRFI(uint256 indexed id);

    event CreateRFL(uint256 indexed id);
    event AcceptRFL(uint256 indexed id, uint256 value);
    event RejectRFL(uint256 indexed id);
    event CancelRFL(uint256 indexed id);
    event IssueRFL(uint256 indexed id, address destination, uint256 value);

    modifier RFIExists(uint256 _RFIid) {
        require(_RFIid <= RFIsLength, "RFI does not exist");
        _;
    }

    modifier RFLExists(uint256 _RFLid) {
        require(_RFLid <= RFLsLength, "RFL does not exist");
        _;
    }

    /*--------------------*/

    function initialize(Genesis _genesis, Lineage _lineage) external onlyInit {
        initialized();
        genesis = _genesis;
        lineage = _lineage;
    }

    function createRFI(IIndividuation _individuation, ILineage[] _lineages)
        public
        isInitialized
        auth(CREATE_RFI_ROLE)
        returns (uint256 RFIid)
    {
        RFIid = _createRFI(_individuation, _lineages);
    }

    function mergeRFI(uint256 _RFIid) public isInitialized auth(MERGE_RFI_ROLE) {
        require(canMergeRFI(_RFIid), "cannot merge RFI");
        _mergeRFI(_RFIid);
    }

    function rejectRFI(uint256 _RFIid) public isInitialized auth(REJECT_RFI_ROLE) {
        require(canRejectRFI(_RFIid), "cannot reject RFI");
        _rejectRFI(_RFIid);
    }

    function acceptRFL(uint256 _RFLid, uint256 _value) public isInitialized auth(ACCEPT_RFL_ROLE) {
        require(canAcceptRFL(_RFLid, _value), "cannot accept RFL");
        _acceptRFL(_RFLid, _value);
    }

    function rejectRFL(uint256 _RFLid) public isInitialized auth(REJECT_RFL_ROLE) {
        require(canRejectRFL(_RFLid), "cannot reject RFL");
        _rejectRFL(_RFLid);
    }

    /*--------------------*/

    function canMergeRFI(uint256 _RFIid) public view returns (bool) {
        if (_RFIid > RFIsLength)
            return false;
        RFI storage RFI_ = RFIs[_RFIid];
        if (RFI_.state != RFIState.Pending)
            return false;
        for (uint256 i = 0; i < RFI_.RFLids.length; i++) {
            RFL storage rfl = RFLs[RFI_.RFLids[i]];
            if (rfl.state != RFLState.Accepted)
                return false;
        }
        return true;
    }

    function canRejectRFI(uint _RFIid) public view returns (bool) {
        if (_RFIid > RFIsLength)
            return false;
        if (RFIs[_RFIid].state != RFIState.Pending)
            return false;
        return true;
    }

    function canAcceptRFL(uint256 _RFLid, uint256 _value) public view returns (bool) {
        if (_RFLid > RFLsLength)
            return false;
        if (RFLs[_RFLid].state != RFLState.Pending)
            return false;
        if (_value < RFLs[_RFLid].lineage.minimum)
            return false;
        return true;
    }

    function canRejectRFL(uint _RFLid) public view returns (bool) {
        if (_RFLid > RFLsLength)
            return false;
        if (RFLs[_RFLid].state != RFLState.Pending)
            return false;
        return true;
    }

    /*--------------------*/

    function getLineageToken() public view returns (address) {
        return address(lineage);
    }


    function getRFI(uint256 _RFIid) public view RFIExists(_RFIid) returns (RFI) {
        return RFIs[_RFIid];
    }

    function getRFL(uint256 _RFLid) public view RFLExists(_RFLid) returns (RFL) {
        return RFLs[_RFLid];
    }

    function getIndividuationHash(Individuation _individuation) public pure returns (bytes32) {
        return hash(_individuation);
    }

    function head() public view returns (bytes32) {
        return genesis.head();
    }

    function getHead() public view returns (PandoApp.Individuation) {
        return genesis.getHead();
    }

    /*--------------------*/

    function _createRFI(IIndividuation _individuation, ILineage[] _lineages) internal returns (uint256 RFIid) {
        // msg.sender is gonna be the address of a governance kit built on top of the API
        // Do you we wanna make sure that the transaction is actually initialized by _individuation.origin ?
        // If this is the case then we're gonna need to ask for a proof of identity through a ECDSA signature
        // See https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/cryptography/ECDSA.sol

        RFIsLength = RFIsLength + 1;
        RFIid = RFIsLength;

        RFI storage rfi = RFIs[RFIid];

        rfi.individuation.origin = _individuation.origin;
        rfi.individuation.tree = _individuation.tree;
        rfi.individuation.message = _individuation.message;
        rfi.individuation.metadata = _individuation.metadata;
        rfi.blockstamp = block.number;
        rfi.state = RFIState.Pending;

        // solc 4.0.24 cannot directly convert dynamic struct array from memory to storage
        rfi.individuation.parents.length = _individuation.parents.length;
        for (uint256 i = 0; i < _individuation.parents.length; i++) {
            rfi.individuation.parents[i] = _individuation.parents[i];
        }

        for (uint256 j = 0; j < _lineages.length; j++) {
            uint256 RFLid = _createRFL(_lineages[j], RFIid);
            uint256 index = rfi.RFLids.length++;
            rfi.RFLids[index] = RFLid;
        }

        emit CreateRFI(RFIid);
    }

    function _mergeRFI(uint256 _RFIid) internal {
        RFI storage rfi = RFIs[_RFIid];

        rfi.state = RFIState.Merged;

        genesis.individuate(rfi.individuation);

        for (uint256 i = 0; i < rfi.RFLids.length; i++) {
            _issueRFL(rfi.RFLids[i]);
        }

        emit MergeRFI(_RFIid);
    }

    function _rejectRFI(uint256 _RFIid) internal {
        RFI storage rfi = RFIs[_RFIid];

        rfi.state = RFIState.Rejected;

        for (uint256 j = 0; j < rfi.RFLids.length; j++) {
            _cancelRFL(rfi.RFLids[j]);
        }

        emit RejectRFI(_RFIid);
    }

    function _cancelRFI(uint256 _RFIid) internal {
        RFI storage rfi = RFIs[_RFIid];

        rfi.state = RFIState.Cancelled;

        for (uint256 i = 0; i < rfi.RFLids.length; i++) {
            RFL storage rfl = RFLs[rfi.RFLids[i]];

            if (rfl.state != RFLState.Rejected)
                _cancelRFL(rfi.RFLids[i]);
        }

        emit CancelRFI(_RFIid);
    }

    function _createRFL(ILineage _lineage, uint256 _RFIid) internal returns (uint256 RFLid) {
        RFLsLength = RFLsLength + 1;
        RFLid = RFLsLength;

        RFL storage rfl = RFLs[RFLid];

        rfl.lineage.destination = _lineage.destination;
        rfl.lineage.minimum = _lineage.minimum;
        rfl.lineage.metadata = _lineage.metadata;
        rfl.blockstamp = block.number;
        rfl.value = 0;
        rfl.state = RFLState.Pending;
        rfl.RFIid = _RFIid;

        emit CreateRFL(RFLid);
    }

    function _acceptRFL(uint256 _RFLid, uint256 _value) internal {
        RFL storage rfl = RFLs[_RFLid];

        rfl.state = RFLState.Accepted;
        rfl.value = _value;

        emit AcceptRFL(_RFLid, _value);
    }

    function _rejectRFL(uint256 _RFLid) internal {
        RFL storage rfl = RFLs[_RFLid];

        rfl.state = RFLState.Rejected;

        _cancelRFI(rfl.RFIid);

        emit RejectRFL(_RFLid);
    }

    function _cancelRFL(uint256 _RFLid) internal {
        RFL storage rfl = RFLs[_RFLid];

        rfl.state = RFLState.Cancelled;

        emit CancelRFL(_RFLid);
    }

    function _issueRFL(uint256 _RFLid) internal {
        RFL storage rfl = RFLs[_RFLid];

        rfl.state = RFLState.Issued;

        lineage.mint(rfl.lineage.destination, rfl.value);

        emit IssueRFL(_RFLid, rfl.lineage.destination, rfl.value);
    }
}
