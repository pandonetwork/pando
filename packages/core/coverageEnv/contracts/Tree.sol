pragma solidity ^0.4.18;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "./utils/Strings.sol";


contract Tree is AragonApp {event __CoverageTree(string fileName, uint256 lineNumber);
event __FunctionCoverageTree(string fileName, uint256 fnId);
event __StatementCoverageTree(string fileName, uint256 statementId);
event __BranchCoverageTree(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoverageTree(string fileName, uint256 branchId);
event __AssertPostCoverageTree(string fileName, uint256 branchId);

    using strings for *;  

    struct Snapshot {
        address author;
        uint256 block;
        string  cid;
    }

    struct Branch {
        string name;
        Snapshot[] snapshots;
    }

    struct BranchID {
        bool exists;
        uint id;
    }
      
    bytes32 constant public PUSH = bytes32(1);
    string constant public SEPARATOR = "0x|x0";
  
    Branch[] public branches;
    mapping(bytes32 => BranchID) knownBranches;
  
    event NewBranch(string name, uint branchID);
    event NewSnapshot(string branch, address author, string cid);

    function initialize() public onlyInit {emit __FunctionCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',1);

emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',36);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',1);
initialized();
    }

    function isBranch(bytes32 _branchNameHash) public  returns (bool) {emit __FunctionCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',2);

emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',40);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',2);
return knownBranches[_branchNameHash].exists;
    }

    function setHead(string _branchName, string _head) public auth(PUSH) {emit __FunctionCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',3);

emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',44);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',3);
bytes32 hash = keccak256(abi.encodePacked(_branchName));
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',45);
        emit __AssertPreCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',1);
emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',4);
require(isBranch(hash));emit __AssertPostCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',1);

    
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',47);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',5);
uint branchID = knownBranches[hash].id;
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',48);
        branches[branchID].snapshots.push(Snapshot(msg.sender, block.number, _head));
    
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',50);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',6);
emit NewSnapshot(_branchName, msg.sender, _head);
    }
  
    function getHead(string _branchName) public  returns (string cid_) {emit __FunctionCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',4);

emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',54);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',7);
bytes32 hash = keccak256(abi.encodePacked(_branchName));
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',55);
        emit __AssertPreCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',2);
emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',8);
require(isBranch(hash));emit __AssertPostCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',2);

  
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',57);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',9);
uint branchID = knownBranches[hash].id;
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',58);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',10);
if (branches[branchID].snapshots.length != 0) {emit __BranchCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',3,0);
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',59);
            emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',11);
return branches[branchID].snapshots[branches[branchID].snapshots.length - 1].cid;   
        } else {emit __BranchCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',3,1);
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',61);
            emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',12);
return "undefined";
        }
    }

    function newBranch(string _branchName) public auth(PUSH) returns (uint) {emit __FunctionCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',5);

emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',66);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',13);
bytes32 hash = keccak256(abi.encodePacked(_branchName));
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',67);
        emit __AssertPreCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',4);
emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',14);
require(!isBranch(hash));emit __AssertPostCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',4);

  
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',69);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',15);
uint branchID = branches.length++;
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',70);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',16);
branches[branchID].name = _branchName;
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',71);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',17);
knownBranches[hash] = BranchID(true, branchID);
    
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',73);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',18);
emit NewBranch(_branchName, branchID);
    
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',75);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',19);
return branchID;
    }
  
    function getBranchesName() public  returns (string) {emit __FunctionCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',6);

emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',79);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',20);
uint length = branches.length;    
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',80);
        string memory _branches;
    
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',82);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',21);
for (uint i = 0 ; i < length ; i++) {
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',83);
            emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',22);
_branches = _branches.toSlice().concat(branches[i].name.toSlice());
emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',84);
            emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',23);
_branches = _branches.toSlice().concat(SEPARATOR.toSlice());
        }

emit __CoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',87);
        emit __StatementCoverageTree('/Users/osarrouy/Documents/devs/dapps/@pando/packages/core/contracts/Tree.sol',24);
return _branches;
    }
}