pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../apps/PandoApp.sol";
import "../specimen/Specimen.sol";
import "./kits/BranchKit.sol";


contract Branch is PandoApp {
    Specimen  public specimen;
    BranchKit public kit;
    string    public name;
    bytes32   public head;

    RFC[] internal rfcs;
    mapping(bytes32 => Commit) public commits;


    /* bytes32 constant public SUBMIT_RFC_ROLE  = keccak256("SUBMIT_RFC_ROLE");
    bytes32 constant public UPDATE_RFC_ROLE  = keccak256("UPDATE_RFC_ROLE");
    bytes32 constant public CANCEL_RFC_ROLE  = keccak256("VALUATE_RFC_ROLE");
    bytes32 constant public VALUATE_RFC_ROLE = keccak256("VALUATE_RFC_ROLE");
    bytes32 constant public SORT_RFC_ROLE    = keccak256("HANDLE_RFC_ROLE"); */


    event SubmitRFC (uint256 indexed rfcId);
    event UpdateRFC (uint256 indexed rfcId);
    event ValuateRFC(uint256 indexed rfcId, uint256 value);
    event MergeRFC  (uint256 indexed rfcId);
    event RejectRFC (uint256 indexed rfcId);
    event CancelRFC (uint256 indexed rfcId);

    event MergeCommit(bytes32 hash);


    modifier onlyKit() {
        require(msg.sender == address(kit));
        _;
    }

    modifier isOpen(uint256 _rfcId) {
        require(rfcs[_rfcId].status == RFCStatus.Open);
        _;
    }

    /* modifier isValuated(uint256 _rfcId) {

    } */


    /******************************/
    /*      EXTERNAL METHODS      */
    /******************************/

    function initialize(Specimen _specimen, BranchKit _kit, string _name) onlyInit external {
        initialized();
        specimen = _specimen;
        kit      = _kit;
        name     = _name;
    }

    function submitRFC(address _origin, string _tree, string _message, bytes _parents) isInitialized onlyKit external returns (uint256 rfcId) {
        return _submitRFC(_origin, _tree, _message, _parents);
    }


    function updateRFC(string _tree, string _message, bytes _parents) isInitialized onlyKit external {

    }

    function valuateRFC(uint256 _rfcId, uint256 _value) isInitialized onlyKit isOpen(_rfcId) external {
        _valuateRFC(_rfcId, _value);
    }

    function sortRFC(uint256 _rfcId, RFCSorting _sorting) isInitialized onlyKit isOpen(_rfcId) external {
        /* require(canSort(msg.sender, _rfcId, _sorting)); */
        _sortRFC(_rfcId, _sorting);
    }

    /*******************************fc
    /*      ACCESS CONTROL METHODS      */
    /************************************/


    /* function canUpdate(address _sender, uint256 _rfcId) public view returns (bool) {
        return _isRFCOpen(_rfcId) && rfcs[_rfcId].commit.origin == _sender;
    }

    function canValuate(address _sender, uint256 _rfcId, uint256 _value) public view returns (bool) {
        return _isRFCOpen(_rfcId) && (_value == 0 || canPerform(_sender, VALUATE_RFC_ROLE, arr()));
    }

    function canSort(address _sender, uint256 _rfcId, RFCSorting _action) public view returns (bool) {
        if(!_isRFCOpen(_rfcId))
            return false;
        if(_isRFCValuated(_rfcId) && canPerform(_sender, SORT_RFC_ROLE, arr()))
            return true;
        if(_action == RFCSorting.Reject && canPerform(_sender, SORT_RFC_ROLE, arr()))
            return true;

        return false;
    } */

    /****************************/
    /*      GETTER METHODS      */
    /****************************/

    function getRFC(uint256 _rfcId) public view returns (address origin, uint256 block, string tree, string message, bytes parents, uint256 value, RFCState state, RFCStatus status) {
        RFC storage rfc = rfcs[_rfcId];

        origin  = rfc.commit.origin;
        block   = rfc.commit.block;
        tree    = rfc.commit.tree;
        message = rfc.commit.message;
        parents = rfc.commit.parents;
        value   = rfc.commit.value;
        state   = rfc.state;
        status  = rfc.status;
    }

    function getCommit(bytes32 _hash) public view returns (address origin, uint256 block, string tree, string message, bytes parents, uint256 value) {
        Commit storage commit = commits[_hash];

        origin  = commit.origin;
        block   = commit.block;
        tree    = commit.tree;
        message = commit.message;
        parents = commit.parents;
        value   = commit.value;
    }

    function getHead() public view returns (address origin, uint256 block, string tree, string message, bytes parents, uint256 value) {
        return getCommit(head);
    }

    /******************************/
    /*      INTERNAL METHODS      */
    /******************************/

    function _submitRFC(address _origin, string _tree, string _message, bytes _parents) isInitialized internal returns (uint256 rfcId)  {
        rfcId           = rfcs.length++;
        RFC storage rfc = rfcs[rfcId];

        rfc.status = RFCStatus.Open;
        rfc.state  = RFCState.Pending;
        rfc.commit = Commit(_origin, 0, _tree, _message, _parents, 0);

        emit SubmitRFC(rfcId);
    }

    function _valuateRFC(uint256 _rfcId, uint256 _value) isInitialized internal {
        rfcs[_rfcId].state        = RFCState.Valuated;
        rfcs[_rfcId].commit.value = _value;
        emit ValuateRFC(_rfcId, _value);
    }

    function _sortRFC(uint256 _rfcId, RFCSorting _action) isInitialized internal {
        rfcs[_rfcId].state = RFCState.Sorted;

        if(_action == RFCSorting.Merge) {
            rfcs[_rfcId].status       = RFCStatus.Merged;
            rfcs[_rfcId].commit.block = block.number - 1;

            bytes32 commitHash  = PandoApp.hash(rfcs[_rfcId].commit);
            commits[commitHash] = rfcs[_rfcId].commit;
            head                = commitHash;

            specimen.issueReward(rfcs[_rfcId].commit.origin, rfcs[_rfcId].commit.value);

            emit MergeRFC(_rfcId);
        } else if (_action == RFCSorting.Reject) {
            rfcs[_rfcId].status = RFCStatus.Rejected;
            emit RejectRFC(_rfcId);
        }
    }

    /*****************************/
    /*      UTILITY METHODS      */
    /*****************************/

    function _isRFCOpen(uint256 _rfcId) internal view returns (bool) {
        return rfcs[_rfcId].status == RFCStatus.Open;
    }

    function _isRFCValuated(uint256 _rfcId) internal view returns (bool) {
        return rfcs[_rfcId].state == RFCState.Valuated || rfcs[_rfcId].state == RFCState.Sorted;
    }

}
