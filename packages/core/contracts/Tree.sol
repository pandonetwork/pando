pragma solidity ^0.4.18;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "./utils/Strings.sol";


contract Tree is AragonApp {
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

    function initialize() public onlyInit {
        initialized();
    }

    function isBranch(bytes32 _branchNameHash) public view returns (bool) {
        return knownBranches[_branchNameHash].exists;
    }

    function setHead(string _branchName, string _head) public auth(PUSH) {
        bytes32 hash = keccak256(abi.encodePacked(_branchName));
        require(isBranch(hash));
    
        uint branchID = knownBranches[hash].id;
        branches[branchID].snapshots.push(Snapshot(msg.sender, block.number, _head));
    
        emit NewSnapshot(_branchName, msg.sender, _head);
    }
  
    function getHead(string _branchName) public view returns (string cid_) {
        bytes32 hash = keccak256(abi.encodePacked(_branchName));
        require(isBranch(hash));
  
        uint branchID = knownBranches[hash].id;
        if (branches[branchID].snapshots.length != 0) {
            return branches[branchID].snapshots[branches[branchID].snapshots.length - 1].cid;   
        } else {
            return "undefined";
        }
    }

    function newBranch(string _branchName) public auth(PUSH) returns (uint) {
        bytes32 hash = keccak256(abi.encodePacked(_branchName));
        require(!isBranch(hash));
  
        uint branchID = branches.length++;
        branches[branchID].name = _branchName;
        knownBranches[hash] = BranchID(true, branchID);
    
        emit NewBranch(_branchName, branchID);
    
        return branchID;
    }
  
    function getBranchesName() public view returns (string) {
        uint length = branches.length;    
        string memory _branches;
    
        for (uint i = 0 ; i < length ; i++) {
            _branches = _branches.toSlice().concat(branches[i].name.toSlice());
            _branches = _branches.toSlice().concat(SEPARATOR.toSlice());
        }

        return _branches;
    }
}