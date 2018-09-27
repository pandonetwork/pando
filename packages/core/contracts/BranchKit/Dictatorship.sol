pragma solidity ^0.4.24;

/* import "@aragon/os/contracts/apps/AragonApp.sol"; */

import "../Branch.sol";
import "./BranchKit.sol";

contract Dictatorship is BranchKit{

    bytes32 constant public VALUATE_RFC_ROLE = keccak256("VALUATE_RFC_ROLE");
    bytes32 constant public SORT_RFC_ROLE    = keccak256("SORT_RFC_ROLE");

    Branch public branch;

    modifier onlyBranch() {
       require(msg.sender == address(branch));
       _;
   }

    function initialize(Branch _branch) onlyInit external {
        initialized();
        branch = _branch;
    }

    function handleRFC(uint256 _rfcId) onlyBranch external {
        _handleRFC(_rfcId);
    }

    function valuateRFC(uint256 _rfcId, uint256 _value) external {
        require(canValuateRFC(msg.sender, _rfcId, _value));
        _valuateRFC(_rfcId, _value);
    }

    function sortRFC(uint256 _rfcId, RFCSorting _sorting) external {
        require(canSortRFC(msg.sender, _rfcId, _sorting));
        _sortRFC(_rfcId, _sorting);
    }

    /************************************/
    /*      ACCESS CONTROL METHODS      */
    /************************************/

    function canValuateRFC(address _sender, uint256 _rfcId, uint256 _value) public view returns (bool) {
        return canPerform(_sender, VALUATE_RFC_ROLE, arr());
    }

    function canSortRFC(address _sender, uint256 _rfcId, RFCSorting _sorting) public view returns (bool) {
        return canPerform(_sender, SORT_RFC_ROLE, arr());
    }

    /******************************/
    /*      INTERNAL METHODS      */
    /******************************/

    function _handleRFC(uint256 _rfcId) internal {
        emit HandleRFC(_rfcId);
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
