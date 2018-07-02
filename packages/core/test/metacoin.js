const namehash   = require('eth-ens-namehash').hash
const keccak256  = require('js-sha3').keccak256 
const artifactor = require("truffle-contract")

const Kernel     = artifactor(require('@aragon/os/build/contracts/Kernel.json'))
const DAOFactory = artifactor(require('@aragon/os/build/contracts/DAOFactory.json'))
const ACL        = artifactor(require('@aragon/os/build/contracts/ACL.json'))
const AppProxy   = artifactor(require('@aragon/os/build/contracts/AppProxyUpgradeable.json'))
const AppProxyFactory = artifactor(require('@aragon/os/build/contracts/AppProxyFactory.json'))
const Specimen = artifacts.require('./Tree.sol')

const GAS = 100000000
const APP_BASE_NAMESPACE = '0x' + keccak256('base')
const APP_ID = namehash('pando.aragonpm.test')

contract('Specimen', (accounts) => {
  
  let kernel, acl, specimen
  
  before(async () => {
    // Configure artifacts
    Kernel.setProvider(web3.currentProvider)
    Kernel.defaults({ from: accounts[0], gas: GAS })
    DAOFactory.setProvider(web3.currentProvider)
    DAOFactory.defaults({ from: accounts[0], gas: GAS })
    ACL.setProvider(web3.currentProvider)
    ACL.defaults({ from: accounts[0], gas: GAS })
    AppProxy.setProvider(web3.currentProvider)
    AppProxy.defaults({ from: accounts[0], gas: GAS })
    AppProxyFactory.setProvider(web3.currentProvider)
    AppProxyFactory.defaults({ from: accounts[0], gas: GAS })
    
    // Deploy AragonOS-based DAO
    let kernelBase = await Kernel.new()
    let aclBase    = await ACL.new()
    let factory    = await DAOFactory.new(kernelBase.address, aclBase.address, '0x00')
    let receipt    = await factory.newDAO(accounts[0]) 
    let address    = receipt.logs.filter(l => l.event === 'DeployDAO')[0].args.dao
    
    kernel     = await Kernel.at(address)
    acl        = await ACL.at(await kernel.acl())
    
    // Grant accounts[0] APP_MANAGER_ROLE over the DAO
    let APP_MANAGER_ROLE = await kernel.APP_MANAGER_ROLE()
    let receipt2         = await acl.createPermission(accounts[0], kernel.address, APP_MANAGER_ROLE, accounts[0])
  })
  
  it("should deploy correctly", async () => {
    let base    = await Specimen.new()
    let receipt = await kernel.newAppInstance(APP_ID, base.address)
    let address    = receipt.logs.filter(l => l.event === 'NewAppProxy')[0].args.proxy
    specimen = await Specimen.at(address)    
  })
  
  it("should create PUSH role correctly", async () => {
    const PUSH  = await specimen.PUSH()
    let receipt = await acl.createPermission(accounts[0], specimen.address, PUSH, accounts[0])
  })
  
  it("should grant PUSH role correctly", async () => {
    const PUSH  = await specimen.PUSH()
    let receipt = await acl.grantPermission(accounts[1], specimen.address, PUSH)
  })
  
  it("should create new branch correctly", async () => {    
    let receipt    = await specimen.newBranch('testbranch')
    let logName    = receipt.logs.filter(l => l.event === 'NewBranch')[0].args.name
    let branchName = await specimen.branches(0)

    assert.equal(branchName, 'testbranch', 'the registered branch name is incorrect')
    assert.equal(logName, 'testbranch', 'the event broadcasted branch name is incorrect')
  })
  
  
  it("should push snapshots correctly", async () => {    
    let receipt    = await specimen.setHead('testbranch', 'Qmv85')
    // event NewSnapshot(string branch, address author, string cid);
    let branch    = receipt.logs.filter(l => l.event === 'NewSnapshot')[0].args.branch
    let author    = receipt.logs.filter(l => l.event === 'NewSnapshot')[0].args.author
    let cid    = receipt.logs.filter(l => l.event === 'NewSnapshot')[0].args.cid


    let branchReg = await specimen.branches(0)
    
    let hash = '0x' + keccak256('testbranch')
    let head = await specimen.getHead(hash);
    

    

    console.log(branch);
    console.log(author);
    console.log(cid);
    console.log(branchReg)
    console.log(head)
    
    
    // let hash = '0x' + keccak256('testbranch')
    // let headH = await specimen.getHeadH(hash);
    // console.log(headH)
    
    
    // let branchName = await specimen.branches(0)
    // 
    // assert.equal(branchName, 'testbranch', 'the registered branch name is incorrect')
    // assert.equal(logName, 'testbranch', 'the event broadcasted branch name is incorrect')
  })
  
  it("should get remote branches correctly", async () => {
    await specimen.newBranch('dev')
    await specimen.newBranch('features')
    
     
    let branches = await specimen.getBranchesName()
    
    console.log(branches)
    
    let b = branches.split('0x|x0')
    
    b.splice(-1,1)
    
    console.log(b)
    
    
    // let hash = '0x' + keccak256('testbranch')
    // let headH = await specimen.getHeadH(hash);
    // console.log(headH)
    
    
    // let branchName = await specimen.branches(0)
    // 
    // assert.equal(branchName, 'testbranch', 'the registered branch name is incorrect')
    // assert.equal(logName, 'testbranch', 'the event broadcasted branch name is incorrect')
  })
  
})


// var MetaCoin = artifacts.require("./MetaCoin.sol");
// 
// contract('MetaCoin', function(accounts) {
//   it("should put 10000 MetaCoin in the first account", function() {
//     return MetaCoin.deployed().then(function(instance) {
//       return instance.getBalance.call(accounts[0]);
//     }).then(function(balance) {
//       assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
//     });
//   });
//   it("should call a function that depends on a linked library", function() {
//     var meta;
//     var metaCoinBalance;
//     var metaCoinEthBalance;
// 
//     return MetaCoin.deployed().then(function(instance) {
//       meta = instance;
//       return meta.getBalance.call(accounts[0]);
//     }).then(function(outCoinBalance) {
//       metaCoinBalance = outCoinBalance.toNumber();
//       return meta.getBalanceInEth.call(accounts[0]);
//     }).then(function(outCoinBalanceEth) {
//       metaCoinEthBalance = outCoinBalanceEth.toNumber();
//     }).then(function() {
//       assert.equal(metaCoinEthBalance, 2 * metaCoinBalance, "Library function returned unexpected function, linkage may be broken");
//     });
//   });
//   it("should send coin correctly", function() {
//     var meta;
// 
//     // Get initial balances of first and second account.
//     var account_one = accounts[0];
//     var account_two = accounts[1];
// 
//     var account_one_starting_balance;
//     var account_two_starting_balance;
//     var account_one_ending_balance;
//     var account_two_ending_balance;
// 
//     var amount = 10;
// 
//     return MetaCoin.deployed().then(function(instance) {
//       meta = instance;
//       return meta.getBalance.call(account_one);
//     }).then(function(balance) {
//       account_one_starting_balance = balance.toNumber();
//       return meta.getBalance.call(account_two);
//     }).then(function(balance) {
//       account_two_starting_balance = balance.toNumber();
//       return meta.sendCoin(account_two, amount, {from: account_one});
//     }).then(function() {
//       return meta.getBalance.call(account_one);
//     }).then(function(balance) {
//       account_one_ending_balance = balance.toNumber();
//       return meta.getBalance.call(account_two);
//     }).then(function(balance) {
//       account_two_ending_balance = balance.toNumber();
// 
//       assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
//       assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
//     });
//   });
// });
