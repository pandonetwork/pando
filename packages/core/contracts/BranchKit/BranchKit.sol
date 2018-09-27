pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../PandoApp.sol";
import "../Branch.sol";



contract BranchKit is PandoApp {

    event HandleRFC (uint256 rfcId);
    event ValuateRFC(uint256 rfcId, address sender, uint256 value);
    event SortRFC   (uint256 rfcId, address sender, RFCSorting sorting);

    function initialize(Branch _branch) external;
    function handleRFC(uint256 _rfcId) external;
    function valuateRFC(uint256 _rfcId, uint256 _value) external;
    function sortRFC(uint256 _rfcId, RFCSorting _sorting) external;
    /* function valuateAndSortRFC(uint256 _rfcId, uint256 _value, RFCSorting _sorting) external; */
}
