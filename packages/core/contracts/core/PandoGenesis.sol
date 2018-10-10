pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "../lib/Pando.sol";


contract PandoGenesis is AragonApp {
    using Pando for Pando.Individuation;

    bytes32 constant public INDIVIDUATE_ROLE = keccak256("INDIVIDUATE_ROLE");

    bytes32 public head;
    mapping(bytes32 => Pando.Individuation) public individuations;

    event Individuate(bytes32 hash);


    function initialize() external onlyInit {
        initialized();
    }

    function individuate(Pando.IIndividuation _individuation) public isInitialized auth(INDIVIDUATE_ROLE) {
        Pando.Individuation memory individuation = Pando.Individuation(
            _individuation.origin,
            block.number,
            _individuation.tree,
            _individuation.message,
            _individuation.metadata,
            _individuation.parents
        );

        bytes32 hash = individuation.hash();

        individuations[hash].origin = individuation.origin;
        individuations[hash].blockstamp = individuation.blockstamp;
        individuations[hash].tree = individuation.tree;
        individuations[hash].message = individuation.message;
        individuations[hash].metadata = individuation.metadata;

        // solc 4.0.24 cannot directly convert dynamic struct array from memory to storage
        individuations[hash].parents.length = individuation.parents.length;
        for (uint256 i = 0; i < individuation.parents.length; i++) {
            individuations[hash].parents[i] = individuation.parents[i];
        }

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
