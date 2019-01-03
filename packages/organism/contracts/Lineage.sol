pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";
import "@pando/core/contracts/organism/ILineage.sol";


contract Lineage is ILineage, AragonApp {
    using SafeMath for uint256;

    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");

    mapping (address => uint256) private _balances;

    uint256 private _totalSupply;

    function initialize() external onlyInit {
        initialized();
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address owner) external view returns (uint256) {
        return _balances[owner];
    }

    function mint(address to, uint256 value) external auth(MINT_ROLE) returns (bool) {
        _mint(to, value);
        return true;
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return 0;
    }

    function transfer(address to, uint256 value) external returns (bool) {
        return false;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        return false;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        return false;
    }

    function increaseAllowance(address spender, uint256 addedValue) external returns (bool) {
        return false;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool) {
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
