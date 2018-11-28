pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "../zeppelin/token/IERC20.sol";
import "../zeppelin/math/SafeMath.sol";


contract Lineage is IERC20, AragonApp {
    using SafeMath for uint256;

    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");

    mapping (address => uint256) private _balances;

    uint256 private _totalSupply;

    function initialize() external onlyInit {
        initialized();
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address owner) public view returns (uint256) {
        return _balances[owner];
    }

    function mint(address to, uint256 value) public auth(MINT_ROLE) returns (bool) {
        _mint(to, value);
        return true;
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return 0;
    }

    function transfer(address to, uint256 value) public returns (bool) {
        return false;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        return false;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        return false;
    }

    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        return false;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        return false;
    }

    function _mint(address account, uint256 value) internal {
        require(account != address(0));

        _totalSupply = _totalSupply.add(value);
        _balances[account] = _balances[account].add(value);
        emit Transfer(address(0), account, value);
    }

    function _burn(address account, uint256 value) internal {
        require(account != address(0));

        _totalSupply = _totalSupply.sub(value);
        _balances[account] = _balances[account].sub(value);
        emit Transfer(account, address(0), value);
    }
}
