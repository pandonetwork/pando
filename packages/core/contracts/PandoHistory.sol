pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "./Pando.sol";

// contract PandoGenesis
// Et le token manager du lineage il s'appelle contract Alliance et la fonction pour issuer c'est ally(uint _destination, uint256 amount)

contract PandoHistory is AragonApp {
    using Pando for Pando.Individuation;


    bytes32 constant public COMMIT_ROLE = keccak256("COMMIT_ROLE");

    bytes32 public head;
    mapping(bytes32 => Pando.Individuation) public individuations;

    event Commit(bytes32 hash);

    function initialize() onlyInit external {
        initialized();
    }

    /* struct Commit {
        address origin;
        uint256 block;
        string  tree;
        string  message;
        CID[]   parents;
    } */


    /* struct IIndividuation {
        address origin;
        string  tree;
        string  message;
        string  metadata;
        IID[]   parents;
    }

    // Un commit est un est acte d'individuation, (par les parents), pas un état
    struct Individuation {
        address origin;
        uint256 blockstamp;
        string  tree;
        string  message;
        string  metadata;
        IID[]   parents;
    } */

    function individuate(Pando.IIndividuation _individuation) isInitialized /*auth(COMMIT_ROLE)*/ public {
        Pando.Individuation memory individuation = Pando.Individuation(_individuation.origin, block.number, _individuation.tree, _individuation.message, _individuation.metadata, _individuation.parents);

        bytes32 hash  = individuation.hash();

        individuations[hash].origin     = individuation.origin;
        individuations[hash].blockstamp = individuation.blockstamp;
        individuations[hash].tree       = individuation.tree;
        individuations[hash].message    = individuation.message;
        individuations[hash].metadata   = individuation.metadata;



        individuations[hash].parents.length = individuation.parents.length;
        for (uint256 i = 0; i < individuation.parents.length; i++) {
            individuations[hash].parents[i] = individuation.parents[i];
        }

        head = hash;

        emit Commit(hash);
    }

    function getHead() isInitialized public returns (Pando.Individuation) {
        return individuations[head];
    }

}
