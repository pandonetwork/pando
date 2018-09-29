pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../Branch.sol";
import "./BranchKit.sol";

contract Dictatorship is BranchKit{
    Branch    public branch;
    bool      public ORIGIN_CAN_CANCEL;
    address[] public dictators;

    mapping(address => bool) public isDictator;

    modifier onlyDictators() {
        require(isDictator[msg.sender]);
        _;
    }

    function bytesToParameters(bytes _parameters) internal pure returns (address[] memory _dictators) {
        uint256 ptr;
        uint256 offset;
        uint256 length;
        address dictator;

        assembly {
            ptr := add(_parameters, 64)
            length := mload(ptr)
        }
        _dictators = new address[](length);

        for (uint i = 0; i < length; i++) {
            assembly {
                ptr := add(ptr, 32)
                dictator:= mload(ptr)
            }
            _dictators[i] = dictator;
        }
    }

    function initialize(Branch _branch, bytes _parameters) onlyInit external {
        initialized();
        branch      = _branch;
        (dictators) = bytesToParameters(_parameters);

        for (uint i = 0 ; i < dictators.length ; i++) {
            isDictator[dictators[i]] = true;
        }
    }

    function submitRFC(string _tree, string _message, bytes _parents) isInitialized external {
        _submitRFC(_tree, _message, _parents);
    }

    function valuateRFC(uint256 _rfcId, uint256 _value) isInitialized onlyDictators external {
        _valuateRFC(_rfcId, _value);
    }

    function sortRFC(uint256 _rfcId, RFCSorting _sorting) isInitialized onlyDictators external {
        _sortRFC(_rfcId, _sorting);
    }

    function getParameters() isInitialized external view returns (bytes) {
        return abi.encode(dictators);
    }

    /****** INTERNAL METHODS ******/

    function _submitRFC(string _tree, string _message, bytes _parents) internal {
        /* emit SubmitRFC(msg.sender, _tree, _message, _parents); */
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
