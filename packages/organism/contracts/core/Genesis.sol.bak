pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../lib/PandoApp.sol";


contract Genesis is PandoApp {

    bytes32 constant public INDIVIDUATE_ROLE = keccak256("INDIVIDUATE_ROLE");

    bytes32 public head;
    mapping(bytes32 => PandoApp.Individuation) public individuations;

    event Individuate(bytes32 hash);


    function initialize() external onlyInit {
        initialized();
    }

    function individuate(PandoApp.IIndividuation _individuation) public isInitialized auth(INDIVIDUATE_ROLE) {
        PandoApp.Individuation memory individuation = PandoApp.Individuation(
            _individuation.origin,
            block.number,
            _individuation.tree,
            _individuation.message,
            _individuation.metadata,
            _individuation.parents
        );

        bytes32 hash = PandoApp.hash(individuation);

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

    function getIndividuation(bytes32 _hash) public view isInitialized returns (PandoApp.Individuation) {
        return individuations[_hash];
    }

    function getHead() public view isInitialized returns (PandoApp.Individuation) {
        return individuations[head];
    }

}
