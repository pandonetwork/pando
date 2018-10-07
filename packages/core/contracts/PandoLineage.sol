/*
 * SPDX-License-Identitifer:    GPL-3.0-or-later
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/apps-shared-minime/contracts/ITokenController.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";

/* import "@aragon/os/contracts/lib/token/ERC20.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol"; */




contract PandoLineage is ITokenController, AragonApp {

    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");
    bytes32 public constant BURN_ROLE = keccak256("BURN_ROLE");

    MiniMeToken public token;


    function initialize(MiniMeToken _token) external onlyInit {
        initialized();

        require(_token.controller() == address(this));

        token = _token;
        token.enableTransfers(false);
    }


    function mint(address _receiver, uint256 _amount) external auth(MINT_ROLE) {
        _mint(_receiver, _amount);
    }


    function burn(address _holder, uint256 _amount) external auth(BURN_ROLE) {
        // minime.destroyTokens() never returns false, only reverts on failure
        token.destroyTokens(_holder, _amount);
    }


    function proxyPayment(address) public payable returns (bool) {
        // Sender check is required to avoid anyone sending ETH to the Token Manager through this method
        // Even though it is tested, solidity-coverage doesnt get it because
        // MiniMeToken is not instrumented and entire tx is reverted
        require(msg.sender == address(token));
        return false;
    }

    function onTransfer(address _from, address _to, uint _amount) external returns(bool) {
        return true;
    }

    function onApprove(address, address, uint) public returns (bool) {
        return true;
    }


    function _mint(address _receiver, uint256 _amount) internal {
        token.generateTokens(_receiver, _amount); // minime.generateTokens() never returns false
    }
}
