pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@pando/core/contracts/lib/Pando.sol";
import "@pando/core/contracts/organism/IGenesis.sol";


contract Genesis is IGenesis, AragonApp {

    bytes32 constant public INDIVIDUATE_ROLE = keccak256("INDIVIDUATE_ROLE");

    Pando public pando;
    bytes32 public head;
    mapping(bytes32 => Pando.Individuation) public individuations;

    event Individuate(bytes32 hash);


    function initialize(Pando _pando) external onlyInit {
        initialized();
        pando = _pando;
    }

    function individuate(Pando.IIndividuation _individuation) public auth(INDIVIDUATE_ROLE) {
        Pando.Individuation memory individuation = Pando.Individuation(
            block.number,
            _individuation.metadata
        );

        bytes32 hash = pando.hash(individuation);

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
