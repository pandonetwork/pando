pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./PandoApp.sol";
import "./PandoRepository.sol";


contract PandoBranch is PandoApp {

    enum RequestState { Open, Accepted, Rejected, Cancelled }

    struct Request {
        Commit       commit;
        bool         valuated;
        RequestState state;
    }

    string          public name;
    PandoRepository public specimen;
    Commit[]  internal history;
    Request[] internal requests;

    bytes32 constant public SUBMIT_REQUEST_ROLE  = keccak256("SUBMIT_REQUEST_ROLE");
    bytes32 constant public UPDATE_REQUEST_ROLE  = keccak256("UPDATE_REQUEST_ROLE");
    bytes32 constant public CANCEL_REQUEST_ROLE  = keccak256("VALUATE_REQUEST_ROLE");
    bytes32 constant public VALUATE_REQUEST_ROLE = keccak256("VALUATE_REQUEST_ROLE");
    bytes32 constant public HANDLE_REQUEST_ROLE  = keccak256("HANDLE_REQUEST_ROLE");

    event SubmitRequest(uint256 indexed requestId);
    event UpdateRequest(uint256 indexed requestId);
    event CancelRequest(uint256 indexed requestId);
    event ValuateRequest(uint256 indexed requestId, uint256 value);
    event AcceptRequest(uint256 indexed requestId);
    event RejectRequest(uint256 indexed requestId);

    event NewCommit(uint256 indexed commitId);


    function initialize(PandoRepository _specimen, string _name) onlyInit external {
        initialized();
        specimen = _specimen;
        name     = _name;
    }

    function submitRequest(address _author, uint256 _timestamp, bytes32[] _parents, string _tree) auth(SUBMIT_REQUEST_ROLE) external returns (uint256 requestId) {
        return _submitRequest(_author, _timestamp, _parents, _tree);
    }


    /* function submitRequest(address _author, uint256 _timestamp, bytes32[] _parents, string _tree, uint256 _value) auth(SUBMIT_REQUEST_ROLE) external returns (uint256 requestId) {
        requestId = _submitRequest(_author, _timestamp, _parents, _tree);
        require(canValuate(msg.sender, requestId, _value));
        _valuateRequest(requestId, _value);
    }

    function submitRequest(address _author, uint256 _timestamp, bytes32[] _parents, string _tree, uint256 _value, bool _handle) auth(SUBMIT_REQUEST_ROLE) external returns (uint256 requestId) {
        requestId = _submitRequest(_author, _timestamp, _parents, _tree);
        require(canValuate(msg.sender, requestId, _value));
        _valuateRequest(requestId, _value);
    } */

    function updateRequest(uint256 _requestId, uint256 _timestamp, bytes32[] _parents, string _tree) external {
        require(canUpdate(msg.sender, _requestId));
        /* _updateRequest(_timestamp, _parents, _tree); */
    }

    function cancelRequest(uint256 _requestId) external {

    }

    function valuateRequest(uint256 _requestId, uint256 _value) external {
        require(canValuate(msg.sender, _requestId, _value));
        _valuateRequest(_requestId, _value);
    }

    function handleRequest(uint256 _requestId, RequestState _decision) auth(HANDLE_REQUEST_ROLE) external {
        require(canHandle(msg.sender, _requestId, _decision));
        _handleRequest(_requestId, _decision);
    }


    function snapshotHash(uint256 _requestId) public view returns (bytes){
        return hash(requests[_requestId].commit.snapshot);
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

    function canHandle(address _sender, uint256 _requestId, RequestState _decision) public view returns (bool) {
        if((!_isDecisionValid(_decision)))
            return false;
        if(!_isRequestOpen(_requestId))
            return false;
        if(_isRequestValuated(_requestId) && canPerform(_sender, HANDLE_REQUEST_ROLE, arr()))
            return true;
        if(_decision == RequestState.Rejected && canPerform(_sender, HANDLE_REQUEST_ROLE, arr()))
            return true;

        return false;
    }

    /****************************/
    /*      GETTER METHODS      */
    /****************************/

    function getRequest(uint256 _requestId) public view returns (uint256[3] version, address author, uint256 timestamp, bytes32[] parents, string tree, address origin, uint256 block, uint256 value, bool valuated, RequestState state) {
        Request storage request = requests[_requestId];

        version   = request.commit.snapshot.version;
        author    = request.commit.snapshot.author;
        timestamp = request.commit.snapshot.timestamp;
        parents   = request.commit.snapshot.parents;
        tree      = request.commit.snapshot.tree;
        origin    = request.commit.origin;
        block     = request.commit.block;
        value     = request.commit.value;
        valuated  = request.valuated;
        state     = request.state;
    }

    function getCommit(uint256 _commitId) public view returns (uint256[3] version, address author, uint256 timestamp, bytes32[] parents, string tree, address origin, uint256 block, uint256 value) {
        Commit storage commit = history[_commitId];

        version   = commit.snapshot.version;
        author    = commit.snapshot.author;
        timestamp = commit.snapshot.timestamp;
        parents   = commit.snapshot.parents;
        tree      = commit.snapshot.tree;
        origin    = commit.origin;
        block     = commit.block;
        value     = commit.value;
    }

    function getHead() public view returns (uint256[3] version, address author, uint256 timestamp, bytes32[] parents, string tree, address origin, uint256 block, uint256 value) {
        uint256 headId = history.length - 1;
        return getCommit(headId);
    }

    /* function head() public view returns (address author, uint256 timestamp, uint256 block, bytes32[] parents, string tree) {
      Snapshot storage head = heads[heads.length - 1];

      author    = head.author;
      timestamp = head.timestamp;
      block     = head.block;
      parents   = head.parents;
      tree      = head.tree;
    } */

    /******************************/
    /*      INTERNAL METHODS      */
    /******************************/

    function _submitRequest(address _author, uint256 _timestamp, bytes32[] _parents, string _tree) isInitialized internal returns (uint256 requestId)  {
        requestId               = requests.length++;
        Request storage request = requests[requestId];

        request.state  = RequestState.Open;
        request.commit = Commit(Snapshot([uint256(1), uint256(0), uint256(0)], _author, _timestamp, _parents, _tree), msg.sender, block.number - 1, 0);

        emit SubmitRequest(requestId);
    }

    function _valuateRequest(uint256 _requestId, uint256 _value) isInitialized internal {
        requests[_requestId].valuated     = true;
        requests[_requestId].commit.value = _value;
        emit ValuateRequest(_requestId, _value);
    }

    function _handleRequest(uint256 _requestId, RequestState _decision) isInitialized internal {
        requests[_requestId].state = _decision;

        if(_decision == RequestState.Accepted) {
            emit AcceptRequest(_requestId);
            uint256 commitId  = history.length++;
            history[commitId] = requests[_requestId].commit;
            emit NewCommit(commitId);
        } else if (_decision == RequestState.Rejected) {
            emit RejectRequest(_requestId);
        }
    }

    /*****************************/
    /*      UTILITY METHODS      */
    /*****************************/


    function _isRequestOpen(uint256 _requestId) internal view returns (bool) {
        return requests[_requestId].state == RequestState.Open;
    }

    function _isRequestValuated(uint256 _requestId) internal view returns (bool) {
        return requests[_requestId].valuated;
    }

    function _isDecisionValid(RequestState _decision) internal view returns (bool) {
        return _decision == RequestState.Accepted || _decision == RequestState.Rejected;
    }


}
