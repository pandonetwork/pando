pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "../Pando.sol";
import "../PandoAPI.sol";

contract PandoKit is AragonApp {
    PandoAPI public api;

    event CreateRFI(uint256 id, address sender);
    event MergeRFI(uint256 id, address sender);
    event RejectRFI(uint256 id, address sender);

    event CreateRFL(uint256 id, address sender);
    event AcceptRFL(uint256 id, uint256 value, address sender);
    event RejectRFL(uint256 id, address sender);

    function createRFI(Pando.IIndividuation _individuation, Pando.ILineage[] _lineages) public;
    function mergeRFI(uint256 _RFIid) public;
    function rejectRFI(uint256 _RFIid) public;
    function acceptRFL(uint256 _RFLid, uint256 _value) public;
    function rejectRFL(uint256 _RFLid) public;
}
