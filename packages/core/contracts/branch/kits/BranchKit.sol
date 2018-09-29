pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../../apps/PandoApp.sol";
import "../Branch.sol";


contract BranchKit is PandoApp {
    Branch public branch;
    /* event SubmitRFC(address origin, string tree, string message, bytes parents); */
    event SubmitRFC(uint256 rfcId);
    event ValuateRFC(uint256 rfcId, address sender, uint256 value);
    event SortRFC(uint256 rfcId, address sender, RFCSorting sorting);

    function initialize(Branch _branch, bytes _parameters) external;
    function submitRFC(string _tree, string _message, bytes _parents) external;
    function valuateRFC(uint256 _rfcId, uint256 _value) external;
    function sortRFC (uint256 _rfcId, RFCSorting _sorting) external;
}
