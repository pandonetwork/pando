pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/lib/math/SafeMath.sol";
import "@aragon/os/contracts/lib/math/SafeMath64.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";
import "./PandoKit.sol";


contract VotingKit is PandoKit {
    using SafeMath for uint256;
    using SafeMath64 for uint64;
    using Pando for Pando.RFI;
    using Pando for Pando.RFL;

    bytes32 public constant UPDATE_KIT_PARAMETERS_ROLE = keccak256("UPDATE_KIT_PARAMETERS_ROLE");

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

    mapping(uint256 => RFIVote) public RFIVotes; // mapping RFIs to related vote
    mapping(uint256 => RFLVote) public RFLVotes; // mapping RFLs to related vote

    mapping(uint256 => mapping(address => VoterState)) public RFIVotesBallots;
    mapping(uint256 => mapping(address => RFLBallot))  public RFLVotesBallots;

    event NewRFIVote(uint256 id);
    event CastRFIVote(uint256 id, address voter, bool supports, uint256 stake);
    event CancelRFIVote(uint256 id);
    event ExecuteRFIVote(uint256 id);

    event NewRFLVote(uint256 id);
    event CastRFLVote(uint256 id, address voter, bool supports, uint256 value, uint256 stake);
    event CancelRFLVote(uint256 id);
    event ExecuteRFLVote(uint256 id);

    modifier RFIVoteExists(uint256 _RFIid) {
        require(RFIVotes[_RFIid].RFIid > 0, "RFI does not exist");
        _;
    }

    modifier RFLVoteExists(uint256 _RFLid) {
        require(RFLVotes[_RFLid].RFLid > 0, "RFL does not exist");
        _;
    }

    modifier senderCanVoteOnRFI(uint256 _RFIid) {
        require(canVoteOnRFI(_RFIid, msg.sender), "sender cannot vote on RFI");
        _;
    }

    modifier senderCanVoteOnRFL(uint256 _RFLid) {
        require(canVoteOnRFL(_RFLid, msg.sender), "sender cannot vote on RFL");
        _;
    }

    modifier valueIsSuperiorToRFLMinimum(uint256 _RFLid, uint256 _value) {
        require(_value >= api.getRFL(_RFLid).lineage.minimum, "value is inferior to RFL minimum");
        _;
    }

    function initialize(PandoAPI _api, uint256 _quorum, uint256 _required) external onlyInit {
        require(_quorum <= 100 && _required <= _quorum, "initialization parameters out of bound");

        initialized();

        api = _api;
        token = MiniMeToken(api.getLineageToken());
        quorum = _quorum;
        required = _required;
    }

    function createRFI(Pando.IIndividuation _individuation, Pando.ILineage[] _lineages) public isInitialized {
        _createRFI(_individuation, _lineages);
    }

    function mergeRFI(uint256 _RFIid) public isInitialized senderCanVoteOnRFI(_RFIid) {
        _mergeRFI(_RFIid);
    }

    function rejectRFI(uint256 _RFIid) public isInitialized senderCanVoteOnRFI(_RFIid) {
        _rejectRFI(_RFIid);
    }

    function acceptRFL(uint256 _RFLid, uint256 _value)
        public
        isInitialized
        senderCanVoteOnRFL(_RFLid)
        valueIsSuperiorToRFLMinimum(_RFLid, _value)
    {
        _acceptRFL(_RFLid, _value);
    }

    function rejectRFL(uint256 _RFLid) public isInitialized senderCanVoteOnRFL(_RFLid) {
        _rejectRFL(_RFLid);
    }

    /*--------------------*/

    function getRFIVote(uint256 _RFIid) public view RFIVoteExists(_RFIid) returns (RFIVote) {
        return RFIVotes[_RFIid];
    }

    function getRFLVote(uint256 _RFLid) public view RFLVoteExists(_RFLid) returns (RFLVote) {
        return RFLVotes[_RFLid];
    }

    /*--------------------*/

    function _createRFI(Pando.IIndividuation _individuation, Pando.ILineage[] _lineages) internal {
        uint256 RFIid = api.createRFI(_individuation, _lineages);

        Pando.RFI memory RFI = api.getRFI(RFIid);

        for (uint256 i = 0; i < RFI.RFLids.length; i++) {
            _newRFLVote(RFI.RFLids[i]);
        }

        _newRFIVote(RFIid);

        emit CreateRFI(RFIid, msg.sender);
    }

    function _mergeRFI(uint256 _RFIid) internal {
        _voteRFI(_RFIid, true, msg.sender);
        emit MergeRFI(_RFIid, msg.sender);
    }

    function _rejectRFI(uint256 _RFIid) internal {
        _voteRFI(_RFIid, false, msg.sender);
        emit RejectRFI(_RFIid, msg.sender);
    }

    function _newRFIVote(uint256 _RFIid) internal {
        RFIVote storage vote = RFIVotes[_RFIid];

        vote.RFIid = _RFIid;
        vote.blockstamp = block.number - 1; // avoid double voting in this very block
        vote.supply = token.totalSupplyAt(vote.blockstamp);
        vote.quorum = quorum.mul(vote.supply).div(100);
        vote.required = required.mul(vote.supply).div(100);
        vote.yea = 0;
        vote.nay = 0;
        vote.participation = 0;
        vote.state = VoteState.Pending;

        emit NewRFIVote(_RFIid);

        if (canVoteOnRFI(_RFIid, msg.sender)) {
            _voteRFI(_RFIid, true, msg.sender);
        }
    }

    function _cancelRFIVote(uint256 _RFIid) internal {
        RFIVote   storage vote = RFIVotes[_RFIid];
        Pando.RFI memory  RFI = api.getRFI(_RFIid);

        vote.state = VoteState.Cancelled;

        for (uint256 i = 0; i < RFI.RFLids.length; i++) {
            if (RFLVotes[RFI.RFLids[i]].state != VoteState.Executed)
                _cancelRFLVote(RFI.RFLids[i]);
        }

        emit CancelRFIVote(_RFIid);
    }

    function _voteRFI(uint256 _RFIid, bool _supports, address _voter) internal {
        RFIVote storage vote = RFIVotes[_RFIid];

        uint256 stake = token.balanceOfAt(_voter, vote.blockstamp);
        VoterState state = RFIVotesBallots[_RFIid][_voter];

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
            RFIVotesBallots[_RFIid][_voter] = VoterState.Yea;
            emit MergeRFI(vote.RFIid, _voter);

        } else {
            vote.nay = vote.nay.add(stake);
            RFIVotesBallots[_RFIid][_voter] = VoterState.Nay;
            emit RejectRFI(vote.RFIid, _voter);
        }

        vote.participation = vote.participation.add(stake);

        emit CastRFIVote(_RFIid, _voter, _supports, stake);

        if (canExecuteRFIVote(_RFIid)) {
            _executeRFIVote(_RFIid);
        }
    }

    function _executeRFIVote(uint256 _RFIid) internal {
        RFIVote storage vote = RFIVotes[_RFIid];

        if (vote.yea >= vote.required) {
            api.mergeRFI(_RFIid);
        } else {
            Pando.RFI memory RFI = api.getRFI(_RFIid);

            for (uint256 i = 0; i < RFI.RFLids.length; i++) {
                _cancelRFLVote(RFI.RFLids[i]);
            }

            api.rejectRFI(vote.RFIid);
        }

        vote.state = VoteState.Executed;

        emit ExecuteRFIVote(_RFIid);
    }

    function _acceptRFL(uint256 _RFLid, uint256 _value) internal {
        _voteRFL(_RFLid, true, _value, msg.sender);
        emit AcceptRFL(_RFLid, _value, msg.sender);
    }

    function _rejectRFL(uint256 _RFLid) internal {
        _voteRFL(_RFLid, false, 0, msg.sender);
        emit RejectRFL(_RFLid, msg.sender);
    }

    function _newRFLVote(uint256 _RFLid) internal {
        RFLVote storage vote = RFLVotes[_RFLid];

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

        emit NewRFLVote(_RFLid);
    }

    function _cancelRFLVote(uint256 _RFLid) internal {
        RFLVote storage vote = RFLVotes[_RFLid];

        vote.state = VoteState.Cancelled;

        emit CancelRFLVote(_RFLid);
    }

    function _voteRFL(uint256 _RFLid, bool _supports, uint256 _value, address _voter) internal {
        RFLVote storage vote = RFLVotes[_RFLid];

        uint256 stake = token.balanceOfAt(_voter, vote.blockstamp);
        RFLBallot storage ballot = RFLVotesBallots[_RFLid][_voter];

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
            emit AcceptRFL(_RFLid, _value, _voter);

        } else {
            vote.nay = vote.nay.add(stake);
            ballot.state = VoterState.Nay;
            ballot.value = 0;
            emit RejectRFL(_RFLid, _voter);
        }

        vote.participation = vote.participation.add(stake);

        emit CastRFLVote(_RFLid, _voter, _supports, _value, stake);

        if (canExecuteRFLVote(_RFLid)) {
            _executeRFLVote(_RFLid);
        }
    }

    function _executeRFLVote(uint256 _RFLid) internal {
        RFLVote storage vote = RFLVotes[_RFLid];

        vote.state = VoteState.Executed;

        if (vote.yea >= vote.required) {
            api.acceptRFL(_RFLid, vote.total.div(vote.yea));
        } else {
            _cancelRFIVote(api.getRFL(_RFLid).RFIid);
            api.rejectRFL(_RFLid);
        }

        emit ExecuteRFLVote(_RFLid);
    }

    /*--------------------*/

    function canVoteOnRFI(uint256 _RFIid, address _voter) public view RFIVoteExists(_RFIid) returns (bool) {
        RFIVote storage vote = RFIVotes[_RFIid];

        return vote.state == VoteState.Pending && token.balanceOfAt(_voter, vote.blockstamp) > 0;
    }

    function canVoteOnRFL(uint256 _RFLid, address _voter) public view RFLVoteExists(_RFLid) returns (bool) {
        RFLVote storage vote = RFLVotes[_RFLid];

        return vote.state == VoteState.Pending && token.balanceOfAt(_voter, vote.blockstamp) > 0;
    }

    function canExecuteRFIVote(uint256 _RFIid) public view RFIVoteExists(_RFIid) returns (bool) {
        RFIVote storage vote = RFIVotes[_RFIid];
        Pando.RFI memory RFI = api.getRFI(vote.RFIid);

        if (vote.state != VoteState.Pending) {
            return false;
        }

        if (vote.participation >= vote.quorum) {
            if (vote.yea >= vote.required) {
                for (uint256 i = 0; i < RFI.RFLids.length; i++) {
                    Pando.RFL memory RFL = api.getRFL(RFI.RFLids[i]);
                    if (!RFL.isAccepted()) {
                        return false;
                    }
                }
            }
            return true;
        }

        return false;
    }

    function canExecuteRFLVote(uint256 _RFLid) public view RFLVoteExists(_RFLid) returns (bool) {
        RFLVote storage vote = RFLVotes[_RFLid];

        if (vote.state != VoteState.Pending) {
            return false;
        }

        if (vote.participation >= vote.quorum) {
            return true;
        }

        return false;
    }
}
