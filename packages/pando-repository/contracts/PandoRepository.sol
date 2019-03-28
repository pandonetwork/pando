pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";


contract PandoRepository is AragonApp {
    bytes32 constant public PUSH_ROLE = keccak256("PUSH_ROLE");
    bytes32 constant public OPEN_PR_ROLE = keccak256("OPEN_PR_ROLE");
    bytes32 constant public SORT_PR_ROLE = keccak256("SORT_PR_ROLE");
    bytes32 constant public UPDATE_INFORMATIONS_ROLE = keccak256("UPDATE_INFORMATIONS_ROLE");

    string private constant ERROR_REPO_CANNOT_SORT_PR = "REPO_CANNOT_SORT_PR";

    enum PRState { Pending, Merged, Rejected }

    struct PR {
        PRState state;
        address author;
        string  title;
        string  description;
        string  ref;
        string  hash;
    }

    string public name;
    string public description;
    mapping (string => string) refs;

    mapping(uint256 => PR) public PRs;
    uint256 public PRsLength;

    event UpdateRef(string ref, string hash);
    event OpenPR(uint256 indexed id, address author, string title, string description, string ref, string hash);
    event MergePR(uint256 indexed id);
    event RejectPR(uint256 indexed id);
    event UpdateInformations(string name, string description);

    /***** external functions *****/

    function initialize(string _name, string _description) external onlyInit {
        initialized();

        _updateInformations(_name, _description);
    }

    /**
    * @notice Push `_hash` to `_ref`
    * @param _ref Reference to push to
    * @param _hash CID of the git-ipld commit to push
    */
    function push(string _ref, string _hash) external auth(PUSH_ROLE) {
        _push(_ref, _hash);
    }

    /**
    * @notice Open PR '`_title`'
    * @param _title Title of the PR
    * @param _description Description of the PR
    * @param _ref Reference to push to
    * @param _hash CID of the git-ipld commit to push
    */
    function openPR(string _title, string _description, string _ref, string _hash) external auth(OPEN_PR_ROLE) {
        _openPR(msg.sender, _title, _description, _ref, _hash);
    }

    /**
    * @notice Merge PR #`_id`
    * @param _id ID of the PR
    */
    function mergePR(uint256 _id) external auth(SORT_PR_ROLE) {
        require(canSortPR(_id), ERROR_REPO_CANNOT_SORT_PR);
        _mergePR(_id);
    }

    /**
    * @notice Reject PR #`_id`
    * @param _id ID of the PR
    */
    function rejectPR(uint256 _id) external auth(SORT_PR_ROLE) {
        require(canSortPR(_id), ERROR_REPO_CANNOT_SORT_PR);
        _rejectPR(_id);
    }

    /**
    * @notice Update repository name to '`_name`' and description to '`_description`'
    * @param _name Name of the repository
    * @param _description Description of the repository
    */
    function updateInformations(string _name, string _description) external auth(UPDATE_INFORMATIONS_ROLE) {
        _updateInformations(_name, _description);
    }

    /***** public functions *****/

    function ref(string _ref) public view returns (string hash) {
        hash = refs[_ref];
    }

    function canSortPR(uint256 _id) public view returns (bool) {
        if (_id < 1 || _id > PRsLength)
            return false;

        PR storage pr = PRs[_id];
        if (pr.state != PRState.Pending)
            return false;

        return true;
    }

    /***** private functions *****/

    function _push(string _ref, string _hash) internal {
        refs[_ref] = _hash;

        emit UpdateRef(_ref, _hash);
    }

    function _openPR(address _author, string _title, string _description, string _ref, string _hash) internal {
        PRsLength = PRsLength + 1;
        uint256 id = PRsLength;

        PR storage pr = PRs[id];

        pr.state = PRState.Pending;
        pr.author = _author;
        pr.title = _title;
        pr.description = _description;
        pr.ref = _ref;
        pr.hash = _hash;

        emit OpenPR(id, _author, _title, _description, _ref, _hash);
    }

    function _mergePR(uint256 _id) internal {
        PR storage pr = PRs[_id];

        pr.state = PRState.Merged;
        _push(pr.ref, pr.hash);

        emit MergePR(_id);
    }

    function _rejectPR(uint256 _id) internal {
        PR storage pr = PRs[_id];

        pr.state = PRState.Rejected;

        emit RejectPR(_id);
    }

    function _updateInformations(string _name, string _description) internal {
        name = _name;
        description = _description;

        emit UpdateInformations(_name, _description);
    }


}
