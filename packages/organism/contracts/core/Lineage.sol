pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/apps-shared-minime/contracts/ITokenController.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";


contract Lineage is ITokenController, AragonApp {
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");
    bytes32 public constant BURN_ROLE = keccak256("BURN_ROLE");

    MiniMeToken public token;


    function initialize(MiniMeToken _token) external onlyInit {
        require(_token.controller() == address(this), "this contract is not set as a controller of this token");

        initialized();

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
        require(msg.sender == address(token), "only the controlled token can send ETH to this address");
        return false;
    }

    function onTransfer(address _from, address _to, uint _amount) external returns(bool) {
        return false;
    }

    function onApprove(address, address, uint) public returns (bool) {
        return false;
    }

    function _mint(address _receiver, uint256 _amount) internal {
        token.generateTokens(_receiver, _amount); // minime.generateTokens() never returns false
    }
}
