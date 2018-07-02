pragma solidity ^0.4.18;
pragma experimental ABIEncoderV2;

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

  function initialize() onlyInit {
      initialized();
  }

  function isBranch(bytes32 _hash) public view returns (bool isIndeed) {
    return knownBranches[_hash].exists;
  }

  function setHead(string _branch, string _head) public auth(PUSH) {
    bytes32 hash = keccak256(abi.encodePacked(_branch));
    require(isBranch(hash));
    
    uint branchID = knownBranches[hash].id;
    branches[branchID].snapshots.push(Snapshot(msg.sender, block.number, _head));
    
    emit NewSnapshot(_branch, msg.sender, _head);
  }
  
  /* function getHead(string _branch) public view returns (string _cid){
    bytes32 hash = keccak256(abi.encodePacked(_branch));
    require(isBranch(hash));
    
    uint branchID = knownBranches[hash].id;
    return branches[branchID].snapshots[branches[branchID].snapshots.length - 1].cid;
    
  } */
  
  function getHead(bytes32 _hash) public view returns (string cid_){
    require(isBranch(_hash));
    
    uint branchID = knownBranches[_hash].id;
    if(branches[branchID].snapshots.length != 0) {
      return branches[branchID].snapshots[branches[branchID].snapshots.length - 1].cid;   
    } else {
      return "root snapshot";
    }
     
  }

  function newBranch(string _name) public auth(PUSH) returns (uint branchID_){
    bytes32 hash = keccak256(abi.encodePacked(_name));
    require(!isBranch(hash));
  
    uint branchID = branches.length++;
    branches[branchID].name = _name;
    knownBranches[hash] = BranchID(true, branchID);
    
    emit NewBranch(_name, branchID);
    
    return branchID;
  }
  
  function getBranchesName() public view returns (string branches_) {
    /* string memory separator = "0x|x0"; */
    uint length = branches.length;
    
    string memory _branches;
    
    for (uint i = 0 ; i < length ; i++) {
      _branches = _branches.toSlice().concat(branches[i].name.toSlice()); // "abcdef"
      _branches = _branches.toSlice().concat(SEPARATOR.toSlice()); // "abcdef"
    }
    
    /* _branches = _branches.toSlice().concat("master".toSlice()); // "abcdef"
    _branches = _branches.toSlice().concat(SEPARATOR.toSlice()); // "abcdef"
    _branches = _branches.toSlice().concat("dev".toSlice()); // "abcdef" */
    
    
    /* string[] memory _branches = new string[](length); */
    
    /* string[length] branches_; */
    
    /* branches_[0] = 'master'; */
    
    return _branches;
  }
  
}