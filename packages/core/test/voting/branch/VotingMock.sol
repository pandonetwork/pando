pragma solidity ^0.4.18;

import "../../../contracts/ShareVoting.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "@aragon/os/contracts/lib/minime/MiniMeToken.sol";



contract VotingMock is ShareVoting {
    // _isValuePct public wrapper
    function isValuePct(uint256 _value, uint256 _total, uint256 _pct) external pure returns (bool) {
        return _isValuePct(_value, _total, _pct);
        
    }
}
