pragma solidity ^0.4.18;

contract ExecutionTarget {
    uint256 public value;
    uint256 public counter;

    function execute() {
        counter += 1;
        Executed(counter);
    }

    function setValue(uint256 _value) {
        counter += 1;
        value = _value;
    }

    function autoThrow(uint256 _value) public {
        require(false);
    }

    event Executed(uint256 x);
}
