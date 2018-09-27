pragma solidity ^0.4.18;

import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/acl/ACL.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "./PandoApp.sol";
import "./Branch.sol";
import "./BranchKit/BranchKit.sol";


contract Specimen is PandoApp {
    bytes32 constant public CREATE_BRANCH_ROLE = keccak256("CREATE_BRANCH_ROLE");
    bytes32 constant public FREEZE_BRANCH_ROLE = keccak256("FREEZE_BRANCH_ROLE");
    bytes32 constant public ISSUE_REWARD_ROLE  = keccak256("ISSUE_REWARD_ROLE");

    TokenManager public tokenManager;
    Branch[]     internal branches;

    event CreateBranch(uint256 indexed branchId, address proxy, string name);
    event FreezeBranch(uint256 indexed branchId);
    event IssueReward(address indexed receiver, uint256 amount);

    /******************************/
    /*      EXTERNAL METHODS      */
    /******************************/

    function initialize(TokenManager _tokenManager) onlyInit external {
        initialized();
        tokenManager = _tokenManager;
    }

    function createBranch(string _name, BranchKit _kit) external returns (uint256 branchId) {
        require(canCreateBranch(msg.sender, _name));
        return _createBranch(_name, _kit);
    }

    function issueReward(address _receiver, uint256 _amount) external {
        require(canIssueReward(msg.sender));
        _issueReward(_receiver, _amount);
    }

    /************************************/
    /*      ACCESS CONTROL METHODS      */
    /************************************/

    function canCreateBranch(address _sender, string _name) public view returns (bool) {
        return canPerform(_sender, CREATE_BRANCH_ROLE, arr());
    }

    function canIssueReward(address _sender) public view returns (bool) {
        return canPerform(_sender, ISSUE_REWARD_ROLE, arr());
    }

    /****************************/
    /*      GETTER METHODS      */
    /****************************/

    function getBranch(uint256 _branchId) public view returns (address proxy) {
        proxy = address(branches[_branchId]);
    }

    function getBranches() public view returns (address[] proxies) {
        uint256 length = branches.length;
        proxies        = new address[](length);

        for (uint256 branchId = 0; branchId < length; branchId++) {
            proxies[branchId] = getBranch(branchId);
        }
    }

    /******************************/
    /*      INTERNAL METHODS      */
    /******************************/

    function _createBranch(string _name, BranchKit _kit) isInitialized internal returns (uint256 branchId) {
        branchId           = branches.length++;
        branches[branchId] = Branch(Kernel(kernel).newAppInstance(keccak256(abi.encodePacked('branch', branchId)), new Branch()));


        _kit.initialize(branches[branchId]);

        branches[branchId].initialize(this, _kit, _name);
        ACL(Kernel(kernel).acl()).grantPermission(branches[branchId], this, ISSUE_REWARD_ROLE);

        emit CreateBranch(branchId, branches[branchId], _name);
    }

    function _issueReward(address _receiver, uint256 _amount) isInitialized internal {
        tokenManager.mint(_receiver, _amount);
        emit IssueReward(_receiver, _amount);
    }
}
