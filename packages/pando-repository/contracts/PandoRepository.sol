pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";


contract PandoRepository is AragonApp {
    bytes32 constant public PUSH_ROLE = keccak256("PUSH_ROLE");
    bytes32 constant public OPEN_MR_ROLE = keccak256("OPEN_MR_ROLE");
    bytes32 constant public SORT_MR_ROLE = keccak256("SORT_MR_ROLE");
    bytes32 constant public OPEN_LR_ROLE = keccak256("OPEN_LR_ROLE");
    bytes32 constant public SORT_LR_ROLE = keccak256("SORT_LR_ROLE");
    bytes32 constant public UPDATE_INFORMATIONS_ROLE = keccak256("UPDATE_INFORMATIONS_ROLE");

    enum MRState { Pending, Merged, Rejected, Cancelled }
    enum LRState { Pending, Issued, Rejected, Cancelled }

    struct MR {
      MRState state;
      address author;
      string  ref;
      string  cid;
    }

    struct LR {
      LRState state;
      address receiver;
      uint256 value;
    }

    string public name;
    string public description;
    mapping (string => string) refs;

    event UpdateRef(string ref, string hash);
    event UpdateInformations(string name, string description);

    /***** external functions *****/

    function initialize(string _name, string _description) external onlyInit {
        initialized();

        _updateInformations(_name, _description);
    }

    function push(string _ref, string _cid) external auth(PUSH_ROLE) {
        _push(_ref, _cid);
    }

    function updateInformations(string _name, string _description) external auth(UPDATE_INFORMATIONS_ROLE) {
        _updateInformations(_name, _description);
    }

    /***** public functions *****/

    function ref(string _ref) public view returns (string cid) {
        cid = refs[_ref];
    }

    /***** private functions *****/

    function _push(string _ref, string _cid) internal {
        refs[_ref] = _cid;

        emit UpdateRef(_ref, _cid);
    }

    function _updateInformations(string _name, string _description) internal {
        name = _name;
        description = _description;

        emit UpdateInformations(_name, _description);
    }


}
