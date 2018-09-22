pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./PandoApp.sol";
import "./Specimen.sol";


contract Branch is PandoApp {

    enum RequestState  { Pending, Valuated, Handled }
    enum RequestStatus { Open, Merged, Rejected, Cancelled }
    enum RequestAction { Merge, Reject, Cancel }

    struct Request {
        Commit        commit;
        RequestState  state;
        RequestStatus status;
    }

    Specimen public specimen;
    string   public name;
    bytes32  public head;

    Request[] internal requests;
    mapping(bytes32 => Commit) internal commits;

    bytes32 constant public SUBMIT_REQUEST_ROLE  = keccak256("SUBMIT_REQUEST_ROLE");
    bytes32 constant public UPDATE_REQUEST_ROLE  = keccak256("UPDATE_REQUEST_ROLE");
    bytes32 constant public CANCEL_REQUEST_ROLE  = keccak256("VALUATE_REQUEST_ROLE");
    bytes32 constant public VALUATE_REQUEST_ROLE = keccak256("VALUATE_REQUEST_ROLE");
    bytes32 constant public HANDLE_REQUEST_ROLE  = keccak256("HANDLE_REQUEST_ROLE");


    // Governance hooks
    /* uint256 RFC_STAKE = 0;
    bool    ORIGIN_CAN_CANCEL = true; */


    event SubmitRequest(uint256 indexed requestId);
    event UpdateRequest(uint256 indexed requestId);
    event ValuateRequest(uint256 indexed requestId, uint256 value);
    event MergeRequest(uint256 indexed requestId);
    event RejectRequest(uint256 indexed requestId);
    event CancelRequest(uint256 indexed requestId);

    event MergeCommit(bytes32 hash);

    function initialize(Specimen _specimen, string _name) onlyInit external {
        initialized();
        specimen = _specimen;
        name     = _name;
    }

    function submitRequest(string _tree, string _message, bytes _parents) auth(SUBMIT_REQUEST_ROLE) external returns (uint256 requestId) {
        return _submitRequest(_tree, _message, _parents);
    }


    /* function submitRequest(address _author, uint256 _timestamp, bytes[] _parents, string _tree, uint256 _value) auth(SUBMIT_REQUEST_ROLE) external returns (uint256 requestId) {
        requestId = _submitRequest(_author, _timestamp, _parents, _tree);
        require(canValuate(msg.sender, requestId, _value));
        _valuateRequest(requestId, _value);
    } */

    /* function submitRequest(address _author, uint256 _timestamp, bytes[] _parents, string _tree, uint256 _value, bool _handle) auth(SUBMIT_REQUEST_ROLE) external returns (uint256 requestId) {
        requestId = _submitRequest(_author, _timestamp, _parents, _tree);
        require(canValuate(msg.sender, requestId, _value));
        _valuateRequest(requestId, _value);
    } */

    /* function updateRequest(uint256 _requestId, uint256 _timestamp, bytes32[] _parents, string _tree) external {
        require(canUpdate(msg.sender, _requestId));
    } */

    function valuateRequest(uint256 _requestId, uint256 _value) external {
        require(canValuate(msg.sender, _requestId, _value));
        _valuateRequest(_requestId, _value);
    }

    function handleRequest(uint256 _requestId, RequestAction _action) auth(HANDLE_REQUEST_ROLE) external {
        require(canHandle(msg.sender, _requestId, _action));
        _handleRequest(_requestId, _action);
    }

    /************************************/
    /*      ACCESS CONTROL METHODS      */
    /************************************/


    function canUpdate(address _sender, uint256 _requestId) public view returns (bool) {
        return _isRequestOpen(_requestId) && requests[_requestId].commit.origin == _sender;
    }

    function canCancel(address _sender, uint256 _requestId) public view returns (bool) {
        return _isRequestOpen(_requestId) && requests[_requestId].commit.origin == _sender;
    }

    function canValuate(address _sender, uint256 _requestId, uint256 _value) public view returns (bool) {
        return _isRequestOpen(_requestId) && (_value == 0 || canPerform(_sender, VALUATE_REQUEST_ROLE, arr()));
    }

    function canHandle(address _sender, uint256 _requestId, RequestAction _action) public view returns (bool) {
        if(!_isRequestOpen(_requestId))
            return false;
        if(_isRequestValuated(_requestId) && canPerform(_sender, HANDLE_REQUEST_ROLE, arr()))
            return true;
        if(_action == RequestAction.Reject && canPerform(_sender, HANDLE_REQUEST_ROLE, arr()))
            return true;
        if(_action == RequestAction.Cancel && canPerform(_sender, HANDLE_REQUEST_ROLE, arr()))
            return true;

        return false;
    }

    /****************************/
    /*      GETTER METHODS      */
    /****************************/

    function getRequest(uint256 _requestId) public view returns (address origin, uint256 block, string tree, string message, bytes parents, uint256 value, RequestState state, RequestStatus status) {
        Request storage request = requests[_requestId];

        origin  = request.commit.origin;
        block   = request.commit.block;
        tree    = request.commit.tree;
        message = request.commit.message;
        parents = request.commit.parents;
        value   = request.commit.value;
        state   = request.state;
        status  = request.status;
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

    function _submitRequest(string _tree, string _message, bytes _parents) isInitialized internal returns (uint256 requestId)  {
        requestId               = requests.length++;
        Request storage request = requests[requestId];

        request.status = RequestStatus.Open;
        request.state  = RequestState.Pending;
        request.commit = Commit(msg.sender, 0, _tree, _message, _parents, 0);

        emit SubmitRequest(requestId);
    }

    function _valuateRequest(uint256 _requestId, uint256 _value) isInitialized internal {
        requests[_requestId].state        = RequestState.Valuated;
        requests[_requestId].commit.value = _value;
        emit ValuateRequest(_requestId, _value);
    }

    function _handleRequest(uint256 _requestId, RequestAction _action) isInitialized internal {
        requests[_requestId].state = RequestState.Handled;

        if(_action == RequestAction.Merge) {
            requests[_requestId].status       = RequestStatus.Merged;
            requests[_requestId].commit.block = block.number - 1;

            bytes32 commitHash  = PandoApp.hash(requests[_requestId].commit);
            commits[commitHash] = requests[_requestId].commit;
            head                = commitHash;

            emit MergeRequest(_requestId);
        } else if (_action == RequestAction.Reject) {
            requests[_requestId].status = RequestStatus.Rejected;
            emit RejectRequest(_requestId);
        } else if (_action == RequestAction.Cancel) {
            requests[_requestId].status = RequestStatus.Cancelled;
            emit CancelRequest(_requestId);
        }
    }

    /*****************************/
    /*      UTILITY METHODS      */
    /*****************************/

    function _isRequestOpen(uint256 _requestId) internal view returns (bool) {
        return requests[_requestId].status == RequestStatus.Open;
    }

    function _isRequestValuated(uint256 _requestId) internal view returns (bool) {
        return requests[_requestId].state == RequestState.Valuated || requests[_requestId].state == RequestState.Handled;
    }

}
