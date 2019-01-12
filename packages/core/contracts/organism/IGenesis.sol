pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../lib/Pando.sol";


contract IGenesis {
    event Individuate(bytes32 indexed hash);

    function individuate(Pando.IIndividuation _individuation) public;
    function getIndividuation(bytes32 _hash) public view returns (Pando.Individuation);
    function getHead() public view returns (Pando.Individuation);
}
