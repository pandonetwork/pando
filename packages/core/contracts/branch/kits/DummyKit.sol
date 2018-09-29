pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../Branch.sol";
import "./BranchKit.sol";

contract DummyKit is BranchKit{
    address public dummy;

    modifier onlyDummy() {
        require(msg.sender == dummy);
        _;
    }

    function bytesToParameters(bytes _parameters) internal pure returns (address _dummy) {
        uint256 ptr;

        assembly {
            ptr := add(_parameters, 32)
            _dummy := mload(ptr)
        }
    }

    function initialize(Branch _branch, bytes _parameters) onlyInit external {
        initialized();
        branch  = _branch;
        (dummy) = bytesToParameters(_parameters);
    }

    function submitRFC(string _tree, string _message, bytes _parents) isInitialized external {
        _submitRFC(_tree, _message, _parents);
    }

    function valuateRFC(uint256 _rfcId, uint256 _value) isInitialized onlyDummy external {
        _valuateRFC(_rfcId, _value);
    }

    function sortRFC(uint256 _rfcId, RFCSorting _sorting) isInitialized onlyDummy external {
        _sortRFC(_rfcId, _sorting);
    }

    function getParameters() isInitialized external view returns (bytes) {
        return abi.encode(dummy);
    }

    /****** INTERNAL METHODS ******/

    function _submitRFC(string _tree, string _message, bytes _parents) internal {
        uint256 rfcId = branch.submitRFC(msg.sender, _tree, _message, _parents);
        emit SubmitRFC(rfcId);
    }

    function _valuateRFC(uint256 _rfcId, uint256 _value) internal {
        emit ValuateRFC(_rfcId, msg.sender, _value);
        branch.valuateRFC(_rfcId, _value);
    }

    function _sortRFC(uint256 _rfcId, RFCSorting _sorting) internal {
        emit SortRFC(_rfcId, msg.sender, _sorting);
        branch.sortRFC(_rfcId, _sorting);
    }



}
