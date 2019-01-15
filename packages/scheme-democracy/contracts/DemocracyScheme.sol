pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";
import "@aragon/os/contracts/lib/math/SafeMath64.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";
import "@pando/core/contracts/organism/IOrganism.sol";
import "@pando/core/contracts/scheme/IPandoScheme.sol";


contract DemocracyScheme is IPandoScheme, AragonApp {
    using SafeMath for uint256;
    using SafeMath64 for uint64;

    bytes32 public constant UPDATE_PARAMETERS_ROLE = keccak256("UPDATE_PARAMETERS_ROLE");

    enum VoteState  { Pending, Executed, Cancelled }
    enum VoterState { Absent, Yea, Nay }

    struct RFLBallot {
        VoterState state;
        uint256    value;
    }

    struct RFIVote {
        uint256   RFIid;
        uint256   blockstamp;
        uint256   supply;
        uint256   quorum;
        uint256   required;
        uint256   yea;
        uint256   nay;
        uint256   participation;
        VoteState state;
    }

    struct RFLVote {
        uint256   RFLid;
        uint256   blockstamp;
        uint256   supply;
        uint256   quorum;
        uint256   required;
        uint256   yea;
        uint256   nay;
        uint256   total;
        uint256   participation;
        VoteState state;
    }

    MiniMeToken public token;
    uint256     public required;
    uint256     public quorum;

    mapping(address => mapping(uint256 => RFIVote)) public RFIVotes; // mapping RFIs to related vote
    mapping(address => mapping(uint256 => RFLVote)) public RFLVotes; // mapping RFLs to related vote

    mapping(address => mapping(uint256 => mapping(address => VoterState))) public RFIVotesBallots;
    mapping(address => mapping(uint256 => mapping(address => RFLBallot)))  public RFLVotesBallots;

    event NewRFIVote(IOrganism organism, uint256 id);
    event CastRFIVote(IOrganism organism, uint256 id, address voter, bool supports, uint256 stake);
    event CancelRFIVote(IOrganism organism, uint256 id);
    event ExecuteRFIVote(IOrganism organism, uint256 id);

    event NewRFLVote(IOrganism organism, uint256 id);
    event CastRFLVote(IOrganism organism, uint256 id, address voter, bool supports, uint256 value, uint256 stake);
    event CancelRFLVote(IOrganism organism, uint256 id);
    event ExecuteRFLVote(IOrganism organism, uint256 id);

    modifier RFIVoteExists(IOrganism _organism, uint256 _RFIid) {
        require(RFIVotes[address(_organism)][_RFIid].RFIid > 0, "RFI does not exist");
        _;
    }

    modifier RFLVoteExists(IOrganism _organism, uint256 _RFLid) {
        require(RFLVotes[address(_organism)][_RFLid].RFLid > 0, "RFL does not exist");
        _;
    }

    modifier senderCanVoteOnRFI(IOrganism _organism, uint256 _RFIid) {
        require(canVoteOnRFI(_organism, _RFIid, msg.sender), "sender cannot vote on RFI");
        _;
    }

    modifier senderCanVoteOnRFL(IOrganism _organism, uint256 _RFLid) {
        require(canVoteOnRFL(_organism, _RFLid, msg.sender), "sender cannot vote on RFL");
        _;
    }

    modifier valueIsSuperiorToRFLMinimum(IOrganism _organism, uint256 _RFLid, uint256 _value) {
        require(_value >= _organism.getRFL(_RFLid).lineage.minimum, "value is inferior to RFL minimum");
        _;
    }

    function initialize(MiniMeToken _token, uint256 _quorum, uint256 _required) external onlyInit {
        require(_quorum <= 100 && _required <= _quorum, "initialization parameters out of bound");

        initialized();

        token = _token;
        quorum = _quorum;
        required = _required;
    }

    function createRFI(IOrganism _organism, Pando.IIndividuation _individuation, Pando.ILineage[] _lineages) isInitialized {
        _createRFI(_organism, _individuation, _lineages);
    }

    function mergeRFI(IOrganism _organism, uint256 _RFIid) public isInitialized senderCanVoteOnRFI(_organism, _RFIid) {
        _mergeRFI(_organism, _RFIid);
    }

    function rejectRFI(IOrganism _organism, uint256 _RFIid) public isInitialized senderCanVoteOnRFI(_organism, _RFIid) {
        _rejectRFI(_organism, _RFIid);
    }

    function acceptRFL(IOrganism _organism, uint256 _RFLid, uint256 _value)
        public
        isInitialized
        senderCanVoteOnRFL(_organism, _RFLid)
        valueIsSuperiorToRFLMinimum(_organism, _RFLid, _value)
    {
        _acceptRFL(_organism, _RFLid, _value);
    }

    function rejectRFL(IOrganism _organism, uint256 _RFLid) public isInitialized senderCanVoteOnRFL(_organism, _RFLid) {
        _rejectRFL(_organism, _RFLid);
    }

    /*--------------------*/

    function getRFIVote(IOrganism _organism, uint256 _RFIid) public view RFIVoteExists(_organism, _RFIid) returns (RFIVote) {
        return RFIVotes[address(_organism)][_RFIid];
    }

    function getRFLVote(IOrganism _organism, uint256 _RFLid) public view RFLVoteExists(_organism, _RFLid) returns (RFLVote) {
        return RFLVotes[address(_organism)][_RFLid];
    }

    function getRFIMetadata(IOrganism _organism, uint256 _RFIid) public view RFIVoteExists(_organism, _RFIid) returns (string) {
        return _organism.getRFI(_RFIid).individuation.metadata;
    }

    /* function getRFLDestination(IOrganism _organism, uint256 _RFLid) public view RFLVoteExists(_organism, _RFLid) returns (address) {
        return _organism.getRFL(_RFLid).lineage.destination;
    }

    function getRFLMinimum(IOrganism _organism, uint256 _RFLid) public view RFLVoteExists(_organism, _RFLid) returns (uint256) {
        return _organism.getRFL(_RFLid).lineage.minimum;
    } */

    function getRFL(IOrganism _organism, uint256 _RFLid) public view RFLVoteExists(_organism, _RFLid) returns (Pando.RFL) {
        return _organism.getRFL(_RFLid);
    }

    /*--------------------*/

    function _createRFI(IOrganism _organism, Pando.IIndividuation _individuation, Pando.ILineage[] _lineages) internal {
        uint256 RFIid = _organism.createRFI(_individuation, _lineages);

        Pando.RFI memory RFI = _organism.getRFI(RFIid);

        for (uint256 i = 0; i < RFI.RFLids.length; i++) {
            _newRFLVote(_organism, RFI.RFLids[i]);
        }

        _newRFIVote(_organism, RFIid);

        emit CreateRFI(_organism, RFIid, msg.sender);
    }

    function _mergeRFI(IOrganism _organism, uint256 _RFIid) internal {
        _voteRFI(_organism, _RFIid, true, msg.sender);
        emit MergeRFI(_organism, _RFIid, msg.sender);
    }

    function _rejectRFI(IOrganism _organism, uint256 _RFIid) internal {
        _voteRFI(_organism, _RFIid, false, msg.sender);
        emit RejectRFI(_organism, _RFIid, msg.sender);
    }

    function _newRFIVote(IOrganism _organism, uint256 _RFIid) internal {
        RFIVote storage vote = RFIVotes[address(_organism)][_RFIid];

        vote.RFIid = _RFIid;
        vote.blockstamp = block.number - 1; // avoid double voting in this very block
        vote.supply = token.totalSupplyAt(vote.blockstamp);
        vote.quorum = quorum.mul(vote.supply).div(100);
        vote.required = required.mul(vote.supply).div(100);
        vote.yea = 0;
        vote.nay = 0;
        vote.participation = 0;
        vote.state = VoteState.Pending;

        emit NewRFIVote(_organism, _RFIid);

        if (canVoteOnRFI(_organism, _RFIid, msg.sender)) {
            _voteRFI(_organism, _RFIid, true, msg.sender);
        }
    }

    function _cancelRFIVote(IOrganism _organism, uint256 _RFIid) internal {
        RFIVote   storage vote = RFIVotes[address(_organism)][_RFIid];
        Pando.RFI memory  RFI = _organism.getRFI(_RFIid);

        vote.state = VoteState.Cancelled;

        for (uint256 i = 0; i < RFI.RFLids.length; i++) {
            if (RFLVotes[address(_organism)][RFI.RFLids[i]].state != VoteState.Executed)
                _cancelRFLVote(_organism, RFI.RFLids[i]);
        }

        emit CancelRFIVote(_organism, _RFIid);
    }

    function _voteRFI(IOrganism _organism, uint256 _RFIid, bool _supports, address _voter) internal {
        RFIVote storage vote = RFIVotes[address(_organism)][_RFIid];

        uint256 stake = token.balanceOfAt(_voter, vote.blockstamp);
        VoterState state = RFIVotesBallots[address(_organism)][_RFIid][_voter];

        if (state != VoterState.Absent) {
            vote.participation = vote.participation.sub(stake);
        }

        if (state == VoterState.Yea) {
            vote.yea = vote.yea.sub(stake);
        } else if (state == VoterState.Nay) {
            vote.nay = vote.nay.sub(stake);
        }

        if (_supports) {
            vote.yea = vote.yea.add(stake);
            RFIVotesBallots[address(_organism)][_RFIid][_voter] = VoterState.Yea;
            emit MergeRFI(_organism, vote.RFIid, _voter);

        } else {
            vote.nay = vote.nay.add(stake);
            RFIVotesBallots[address(_organism)][_RFIid][_voter] = VoterState.Nay;
            emit RejectRFI(_organism, vote.RFIid, _voter);
        }

        vote.participation = vote.participation.add(stake);

        emit CastRFIVote(_organism, _RFIid, _voter, _supports, stake);

        if (canExecuteRFIVote(_organism, _RFIid)) {
            _executeRFIVote(_organism, _RFIid);
        }
    }

    function _executeRFIVote(IOrganism _organism, uint256 _RFIid) internal {
        RFIVote storage vote = RFIVotes[address(_organism)][_RFIid];

        if (vote.yea >= vote.required) {
            _organism.mergeRFI(_RFIid);
        } else {
            Pando.RFI memory RFI = _organism.getRFI(_RFIid);

            for (uint256 i = 0; i < RFI.RFLids.length; i++) {
                _cancelRFLVote(_organism, RFI.RFLids[i]);
            }

            _organism.rejectRFI(vote.RFIid);
        }

        vote.state = VoteState.Executed;

        emit ExecuteRFIVote(_organism, _RFIid);
    }

    function _acceptRFL(IOrganism _organism, uint256 _RFLid, uint256 _value) internal {
        _voteRFL(_organism, _RFLid, true, _value, msg.sender);
        emit AcceptRFL(_organism, _RFLid, _value, msg.sender);
    }

    function _rejectRFL(IOrganism _organism, uint256 _RFLid) internal {
        _voteRFL(_organism, _RFLid, false, 0, msg.sender);
        emit RejectRFL(_organism, _RFLid, msg.sender);
    }

    function _newRFLVote(IOrganism _organism, uint256 _RFLid) internal {
        RFLVote storage vote = RFLVotes[address(_organism)][_RFLid];

        vote.RFLid = _RFLid;
        vote.blockstamp = block.number - 1; // avoid double voting in this very block
        vote.supply = token.totalSupplyAt(vote.blockstamp);
        vote.quorum = quorum.mul(vote.supply).div(100);
        vote.required = required.mul(vote.supply).div(100);
        vote.yea = 0;
        vote.nay = 0;
        vote.total = 0;
        vote.participation = 0;
        vote.state = VoteState.Pending;

        emit NewRFLVote(_organism, _RFLid);
    }

    function _cancelRFLVote(IOrganism _organism, uint256 _RFLid) internal {
        RFLVote storage vote = RFLVotes[address(_organism)][_RFLid];

        vote.state = VoteState.Cancelled;

        emit CancelRFLVote(_organism, _RFLid);
    }

    function _voteRFL(IOrganism _organism, uint256 _RFLid, bool _supports, uint256 _value, address _voter) internal {
        RFLVote storage vote = RFLVotes[address(_organism)][_RFLid];

        uint256 stake = token.balanceOfAt(_voter, vote.blockstamp);
        RFLBallot storage ballot = RFLVotesBallots[address(_organism)][_RFLid][_voter];

        if (ballot.state != VoterState.Absent) {
            vote.participation = vote.participation.sub(stake);
        }

        if (ballot.state == VoterState.Yea) {
            vote.yea = vote.yea.sub(stake);
            vote.total = vote.total.sub(stake.mul(ballot.value));
        } else if (ballot.state == VoterState.Nay) {
            vote.nay = vote.nay.sub(stake);
        }

        if (_supports) {
            vote.yea = vote.yea.add(stake);
            vote.total = vote.total.add(stake.mul(_value));
            ballot.state = VoterState.Yea;
            ballot.value = _value;
            emit AcceptRFL(_organism, _RFLid, _value, _voter);

        } else {
            vote.nay = vote.nay.add(stake);
            ballot.state = VoterState.Nay;
            ballot.value = 0;
            emit RejectRFL(_organism, _RFLid, _voter);
        }

        vote.participation = vote.participation.add(stake);

        emit CastRFLVote(_organism, _RFLid, _voter, _supports, _value, stake);

        if (canExecuteRFLVote(_organism, _RFLid)) {
            _executeRFLVote(_organism, _RFLid);
        }
    }

    function _executeRFLVote(IOrganism _organism, uint256 _RFLid) internal {
        RFLVote storage vote = RFLVotes[address(_organism)][_RFLid];

        vote.state = VoteState.Executed;

        if (vote.yea >= vote.required) {
            _organism.acceptRFL(_RFLid, vote.total.div(vote.yea));
        } else {
            _cancelRFIVote(_organism, _organism.getRFL(_RFLid).RFIid);
            _organism.rejectRFL(_RFLid);
        }

        emit ExecuteRFLVote(_organism, _RFLid);
    }

    /*--------------------*/

    function canVoteOnRFI(IOrganism _organism, uint256 _RFIid, address _voter) public view RFIVoteExists(_organism, _RFIid) returns (bool) {
        RFIVote storage vote = RFIVotes[address(_organism)][_RFIid];

        return vote.state == VoteState.Pending && token.balanceOfAt(_voter, vote.blockstamp) > 0;
    }

    function canVoteOnRFL(IOrganism _organism, uint256 _RFLid, address _voter) public view RFLVoteExists(_organism, _RFLid) returns (bool) {
        RFLVote storage vote = RFLVotes[address(_organism)][_RFLid];

        return vote.state == VoteState.Pending && token.balanceOfAt(_voter, vote.blockstamp) > 0;
    }

    function canExecuteRFIVote(IOrganism _organism, uint256 _RFIid) public view RFIVoteExists(_organism, _RFIid) returns (bool) {
        RFIVote storage vote = RFIVotes[address(_organism)][_RFIid];
        Pando.RFI memory RFI = _organism.getRFI(vote.RFIid);

        if (vote.state != VoteState.Pending) {
            return false;
        }

        if (vote.participation >= vote.quorum) {
            if (vote.yea >= vote.required) {
                for (uint256 i = 0; i < RFI.RFLids.length; i++) {
                    Pando.RFL memory RFL = _organism.getRFL(RFI.RFLids[i]);
                    if (RFL.state != Pando.RFLState.Accepted) {
                        return false;
                    }
                }
            }
            return true;
        }

        return false;
    }

    function canExecuteRFLVote(IOrganism _organism, uint256 _RFLid) public view RFLVoteExists(_organism, _RFLid) returns (bool) {
        RFLVote storage vote = RFLVotes[address(_organism)][_RFLid];

        if (vote.state != VoteState.Pending) {
            return false;
        }

        if (vote.participation >= vote.quorum) {
            return true;
        }

        return false;
    }
}
