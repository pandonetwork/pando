pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../lib/Pando.sol";


contract IOrganism {
    event CreateRFI(uint256 indexed id);
    event MergeRFI(uint256 indexed id);
    event RejectRFI(uint256 indexed id);
    event CancelRFI(uint256 indexed id);

    event CreateRFL(uint256 indexed id);
    event AcceptRFL(uint256 indexed id, uint256 value);
    event RejectRFL(uint256 indexed id);
    event CancelRFL(uint256 indexed id);
    event IssueRFL(uint256 indexed id, address destination, uint256 value);

    function createRFI(Pando.IIndividuation _individuation, Pando.ILineage[] _lineages) public returns (uint256 RFIid);
    function mergeRFI(uint256 _RFIid) public;
    function rejectRFI(uint256 _RFIid) public;
    function acceptRFL(uint256 _RFLid, uint256 _value) public;
    function rejectRFL(uint256 _RFLid) public;

    /*--------------------*/

    function canMergeRFI(uint256 _RFIid) public view returns (bool);
    function canRejectRFI(uint _RFIid) public view returns (bool);
    function canAcceptRFL(uint256 _RFLid, uint256 _value) public view returns (bool);
    function canRejectRFL(uint _RFLid) public view returns (bool);

    /*--------------------*/

    function getRFI(uint256 _RFIid) public view returns (Pando.RFI);
    function getRFL(uint256 _RFLid) public view returns (Pando.RFL);
    function getIndividuationHash(Pando.Individuation _individuation) public view returns (bytes32);
    function head() public view returns (bytes32);
    function getHead() public view returns (Pando.Individuation);
}
