// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
// Controlled test fixtures only. These are never deployed to Robinhood Chain.
contract TestAsset {
    mapping(address => uint256) public balanceOf;
    event Transfer(address indexed from,address indexed to,uint256 value);
    function mint(address to,uint256 amount) external {balanceOf[to]+=amount;emit Transfer(address(0),to,amount);}
    function transfer(address to,uint256 amount) external returns(bool){require(balanceOf[msg.sender]>=amount,"balance");balanceOf[msg.sender]-=amount;balanceOf[to]+=amount;emit Transfer(msg.sender,to,amount);return true;}
}
contract TestRecoveryVault {
    TestAsset public asset;
    mapping(address=>uint256) public balanceOf;
    bool public paused;
    event Transfer(address indexed from,address indexed to,uint256 value);
    constructor(address underlying){asset=TestAsset(underlying);}
    function seed(address owner,uint256 amount) external {balanceOf[owner]+=amount;asset.mint(address(this),amount);emit Transfer(address(0),owner,amount);}
    function setPaused(bool value) external {paused=value;}
    function maxWithdraw(address owner) external view returns(uint256){return paused?0:balanceOf[owner];}
    function maxRedeem(address owner) external view returns(uint256){return paused?0:balanceOf[owner];}
    function previewWithdraw(uint256 amount) external pure returns(uint256){return amount;}
    function previewRedeem(uint256 amount) external pure returns(uint256){return amount;}
    function withdraw(uint256 amount,address receiver,address owner) external returns(uint256){require(!paused,"paused");require(msg.sender==owner,"owner");require(balanceOf[owner]>=amount,"shares");balanceOf[owner]-=amount;require(asset.transfer(receiver,amount),"transfer");emit Transfer(owner,address(0),amount);return amount;}
    function redeem(uint256 amount,address receiver,address owner) external returns(uint256){require(!paused,"paused");require(msg.sender==owner,"owner");require(balanceOf[owner]>=amount,"shares");balanceOf[owner]-=amount;require(asset.transfer(receiver,amount),"transfer");emit Transfer(owner,address(0),amount);return amount;}
}
