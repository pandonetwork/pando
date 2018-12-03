pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";

import "./Organism.sol";
import "../lib/Pando.sol";


contract Genesis is AragonApp {

    bytes32 constant public INDIVIDUATE_ROLE = keccak256("INDIVIDUATE_ROLE");

    Organism public organism;
    bytes32 public head;
    mapping(bytes32 => Pando.Individuation) public individuations;

    event Individuate(bytes32 hash);


    function initialize(Organism _organism) external onlyInit {
        initialized();
        organism = _organism;
    }

    function individuate(Pando.IIndividuation _individuation) public auth(INDIVIDUATE_ROLE) {
        Pando.Individuation memory individuation = Pando.Individuation(
            block.number,
            _individuation.metadata
        );

        bytes32 hash = Pando(organism.pando()).hash(individuation);

        individuations[hash].blockstamp = individuation.blockstamp;
        individuations[hash].metadata = individuation.metadata;

        head = hash;

        emit Individuate(hash);
    }

    function getIndividuation(bytes32 _hash) public view isInitialized returns (Pando.Individuation) {
        return individuations[_hash];
    }

    function getHead() public view isInitialized returns (Pando.Individuation) {
        return individuations[head];
    }

}
