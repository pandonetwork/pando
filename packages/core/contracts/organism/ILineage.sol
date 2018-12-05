pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;


contract ILineage {
    function mint(address _receiver, uint256 _amount) external;
    function burn(address _holder, uint256 _amount) external;

    function proxyPayment(address) external payable returns (bool);
    function onTransfer(address _from, address _to, uint _amount) external returns(bool);
    function onApprove(address, address, uint) external returns (bool);

}
