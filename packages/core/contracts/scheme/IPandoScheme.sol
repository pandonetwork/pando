pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../lib/Pando.sol";
import "../organism/IOrganism.sol";


contract IPandoScheme {
    event CreateRFI(IOrganism organism, uint256 indexed id, address sender);
    event MergeRFI(IOrganism organism, uint256 indexed id, address sender);
    event RejectRFI(IOrganism organism, uint256 indexed id, address sender);
    event CreateRFL(IOrganism organism, uint256 indexed id, address sender);
    event AcceptRFL(IOrganism organism, uint256 indexed id, uint256 value, address sender);
    event RejectRFL(IOrganism organism, uint256 indexed id, address sender);

    function createRFI(IOrganism _organism, Pando.IIndividuation _individuation, Pando.ILineage[] _lineages) public;
    function mergeRFI(IOrganism _organism, uint256 _RFIid) public;
    function rejectRFI(IOrganism _organism, uint256 _RFIid) public;
    function acceptRFL(IOrganism _organism, uint256 _RFLid, uint256 _value) public;
    function rejectRFL(IOrganism _organism, uint256 _RFLid) public;
}
