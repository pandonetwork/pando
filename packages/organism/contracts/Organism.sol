pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@pando/core/contracts/organism/IOrganism.sol";
import "@pando/core/contracts/lib/Pando.sol";
import "./Genesis.sol";
import "./Lineage.sol";


contract Organism is IOrganism, AragonApp {
    bytes32 constant public CREATE_RFI_ROLE = keccak256("CREATE_RFI_ROLE");
    bytes32 constant public MERGE_RFI_ROLE  = keccak256("MERGE_RFI_ROLE");
    bytes32 constant public REJECT_RFI_ROLE = keccak256("REJECT_RFI_ROLE");
    bytes32 constant public ACCEPT_RFL_ROLE = keccak256("ACCEPT_RFL_ROLE");
    bytes32 constant public REJECT_RFL_ROLE = keccak256("REJECT_RFL_ROLE");

    Genesis public genesis;
    Lineage public lineage;
    Pando   public pando;

    // Use a mapping instead of an array to ease app upgrade
    // See https://github.com/aragon/aragon-apps/pull/428
    // See https://youtu.be/sJ7VECqHFAg?t=9m27s
    mapping (uint256 => Pando.RFI) public RFIs;
    mapping (uint256 => Pando.RFL) public RFLs;

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
        require(_RFIid > 0 && _RFIid <= RFIsLength, "RFI does not exist");
        _;
    }

    modifier RFLExists(uint256 _RFLid) {
        require(_RFLid > 0 && _RFLid <= RFLsLength, "RFL does not exist");
        _;
    }

    /*--------------------*/

    function initialize(Pando _pando, Genesis _genesis, Lineage _lineage) external onlyInit {
        initialized();
        pando = _pando;
        genesis = _genesis;
        lineage = _lineage;
    }

    function createRFI(Pando.IIndividuation _individuation, Pando.ILineage[] _lineages)
        public
        isInitialized
        auth(CREATE_RFI_ROLE)
        returns (uint256 RFIid)
    {
        RFIid = _createRFI(_individuation, _lineages);
    }

    function mergeRFI(uint256 _RFIid) public auth(MERGE_RFI_ROLE) {
        require(canMergeRFI(_RFIid), "cannot merge RFI");
        _mergeRFI(_RFIid);
    }

    function rejectRFI(uint256 _RFIid) public auth(REJECT_RFI_ROLE) {
        require(canRejectRFI(_RFIid), "cannot reject RFI");
        _rejectRFI(_RFIid);
    }

    function acceptRFL(uint256 _RFLid, uint256 _value) public auth(ACCEPT_RFL_ROLE) {
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
        Pando.RFI storage RFI = RFIs[_RFIid];
        if (RFI.state != Pando.RFIState.Pending)
            return false;
        for (uint256 i = 0; i < RFI.RFLids.length; i++) {
            Pando.RFL storage RFL = RFLs[RFI.RFLids[i]];
            if (RFL.state != Pando.RFLState.Accepted)
                return false;
        }
        return true;
    }

    function canRejectRFI(uint _RFIid) public view returns (bool) {
        if (_RFIid > RFIsLength)
            return false;
        if (RFIs[_RFIid].state != Pando.RFIState.Pending)
            return false;
        return true;
    }

    function canAcceptRFL(uint256 _RFLid, uint256 _value) public view returns (bool) {
        if (_RFLid > RFLsLength)
            return false;
        if (RFLs[_RFLid].state != Pando.RFLState.Pending)
            return false;
        if (_value < RFLs[_RFLid].lineage.minimum)
            return false;
        return true;
    }

    function canRejectRFL(uint _RFLid) public view returns (bool) {
        if (_RFLid > RFLsLength)
            return false;
        if (RFLs[_RFLid].state != Pando.RFLState.Pending)
            return false;
        return true;
    }

    /*--------------------*/

    /* function getLineageToken() public view returns (address) {
        return address(lineage.token());
    } */


    function getRFI(uint256 _RFIid) public view RFIExists(_RFIid) returns (Pando.RFI) {
        return RFIs[_RFIid];
    }

    function getRFL(uint256 _RFLid) public view RFLExists(_RFLid) returns (Pando.RFL) {
        return RFLs[_RFLid];
    }

    function getIndividuationHash(Pando.Individuation _individuation) public view returns (bytes32) {
        return pando.hash(_individuation);
    }

    function head() public view returns (bytes32) {
        return genesis.head();
    }

    function getHead() public view returns (Pando.Individuation) {
        return genesis.getHead();
    }

    /*--------------------*/

    function _createRFI(Pando.IIndividuation _individuation, Pando.ILineage[] _lineages) internal returns (uint256 RFIid) {
        // msg.sender is gonna be the address of a governance kit built on top of the API
        // Do you we wanna make sure that the transaction is actually initialized by _individuation.origin ?
        // If this is the case then we're gonna need to ask for a proof of identity through a ECDSA signature
        // See https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/cryptography/ECDSA.sol

        RFIsLength = RFIsLength + 1;
        RFIid = RFIsLength;

        Pando.RFI storage RFI = RFIs[RFIid];

        RFI.individuation.metadata = _individuation.metadata;
        RFI.blockstamp = block.number;
        RFI.state = Pando.RFIState.Pending;

        for (uint256 j = 0; j < _lineages.length; j++) {
            uint256 RFLid = _createRFL(_lineages[j], RFIid);
            uint256 index = RFI.RFLids.length++;
            RFI.RFLids[index] = RFLid;
        }

        emit CreateRFI(RFIid);
    }

    function _mergeRFI(uint256 _RFIid) internal {
        Pando.RFI storage RFI = RFIs[_RFIid];

        RFI.state = Pando.RFIState.Merged;

        genesis.individuate(RFI.individuation);

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
        RFLsLength = RFLsLength + 1;
        RFLid = RFLsLength;

        Pando.RFL storage RFL = RFLs[RFLid];

        RFL.lineage.destination = _lineage.destination;
        RFL.lineage.minimum = _lineage.minimum;
        RFL.lineage.metadata = _lineage.metadata;
        RFL.blockstamp = block.number;
        RFL.value = 0;
        RFL.state = Pando.RFLState.Pending;
        RFL.RFIid = _RFIid;

        emit CreateRFL(RFLid);
    }

    function _acceptRFL(uint256 _RFLid, uint256 _value) internal {
        Pando.RFL storage rfl = RFLs[_RFLid];

        rfl.state = Pando.RFLState.Accepted;
        rfl.value = _value;

        emit AcceptRFL(_RFLid, _value);
    }

    function _rejectRFL(uint256 _RFLid) internal {
        Pando.RFL storage rfl = RFLs[_RFLid];

        rfl.state = Pando.RFLState.Rejected;

        _cancelRFI(rfl.RFIid);

        emit RejectRFL(_RFLid);
    }

    function _cancelRFL(uint256 _RFLid) internal {
        Pando.RFL storage rfl = RFLs[_RFLid];

        rfl.state = Pando.RFLState.Cancelled;

        emit CancelRFL(_RFLid);
    }

    function _issueRFL(uint256 _RFLid) internal {
        Pando.RFL storage rfl = RFLs[_RFLid];

        rfl.state = Pando.RFLState.Issued;

        lineage.mint(rfl.lineage.destination, rfl.value);

        emit IssueRFL(_RFLid, rfl.lineage.destination, rfl.value);
    }
}
