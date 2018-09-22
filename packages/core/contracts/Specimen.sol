pragma solidity ^0.4.18;

import "@aragon/os/contracts/acl/ACL.sol";

import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "./PandoApp.sol";
import "./Branch.sol";


contract Specimen is PandoApp {
    bytes32 constant public CREATE_BRANCH_ROLE = keccak256("CREATE_BRANCH_ROLE");
    bytes32 constant public FREEZE_BRANCH_ROLE = keccak256("FREEZE_BRANCH_ROLE");
    bytes32 constant public ISSUE_REWARD_ROLE  = keccak256("ISSUE_REWARD_ROLE");

    TokenManager  internal tokenManager;
    Branch[] internal branches;

    event Test(address addr);
    event CreateBranch(uint256 indexed branchId, address proxy, string name);
    event FreezeBranch(uint256 indexed branchId);

    function initialize(TokenManager _tokenManager) onlyInit external {
        initialized();
        tokenManager = _tokenManager;
    }

    function createBranch(string _name) auth(CREATE_BRANCH_ROLE) external returns (uint256 branchid) {
        return _createBranch(_name);
    }

    function reward(address _receiver, uint256 _amount) /*auth(ISSUE_REWARD_ROLE)*/ external {
        tokenManager.mint(_receiver, _amount);
    }

    function _createBranch(string _name) isInitialized internal returns (uint256 branchId) {
        branchId           = branches.length++;
        branches[branchId] = Branch(Kernel(kernel).newAppInstance(keccak256(abi.encodePacked('branch', branchId)), new Branch()));

        branches[branchId].initialize(this, _name);
        ACL(Kernel(kernel).acl()).grantPermission(branches[branchId], this, ISSUE_REWARD_ROLE);

        emit CreateBranch(branchId, branches[branchId], _name);
    }
}
