pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./PandoKit.sol";

contract DictatorKit is PandoKit {
    bytes32 constant public DICTATOR_ROLE = keccak256("DICTATOR_ROLE");

    function initialize(PandoAPI _api) onlyInit external {
        initialized();
        api = _api;
    }

    function createRFI(Pando.IIndividuation _individuation, Pando.ILineage[] _lineages) isInitialized public {
        uint256 RFIid = api.createRFI(_individuation, _lineages);
        emit CreateRFI(RFIid, msg.sender);
    }

    function mergeRFI(uint256 _RFIid) isInitialized auth(DICTATOR_ROLE) public {
        api.mergeRFI(_RFIid);
        emit MergeRFI(_RFIid, msg.sender);
    }

    function rejectRFI(uint256 _RFIid) isInitialized auth(DICTATOR_ROLE) public {
        api.rejectRFI(_RFIid);
        emit RejectRFI(_RFIid, msg.sender);
    }

    function acceptRFL(uint256 _RFLid, uint256 _value) isInitialized auth(DICTATOR_ROLE) public {
        api.acceptRFL(_RFLid, _value);
        emit RejectRFL(_RFLid, msg.sender);
    }

    function rejectRFL(uint256 _RFLid) isInitialized auth(DICTATOR_ROLE) public {
        api.rejectRFL(_RFLid);
        emit RejectRFL(_RFLid, msg.sender);
    }
}
