const namehash = require('eth-ens-namehash').hash
const keccak256 = require('js-sha3').keccak256
const artifactor = require('truffle-contract')
const web3Utils = require('web3-utils')
const { assertRevert } = require('./helpers/assertThrow')

const kernelA = require('@aragon/os/build/contracts/Kernel.json')
const aclA = require('@aragon/os/build/contracts/ACL.json')
const daoFactoryA = require('@aragon/os/build/contracts/DAOFactory.json')
const appProxyUpgradeableA = require('@aragon/os/build/contracts/AppProxyUpgradeable.json')

const Kernel = artifactor(kernelA)
const DAOFactory = artifactor(daoFactoryA)
const ACL = artifactor(aclA)
const AppProxyUpgradeable = artifactor(appProxyUpgradeableA)
const Tree = artifacts.require('Tree')

const GAS = 0xfffffffffff
const APP_NAMESPACE = '0x' + keccak256('app')
const APP_BASE_NAMESPACE = '0x' + keccak256('base')
const TREE_BASE_APP_ID = namehash('tree.pando.aragonpm.test')
const TREE_APP_ID = web3Utils.sha3(
  APP_BASE_NAMESPACE + TREE_BASE_APP_ID.substring(2),
  { encoding: 'hex' }
)
const PROXY_APP_ID = web3Utils.sha3(
  APP_NAMESPACE + TREE_BASE_APP_ID.substring(2),
  { encoding: 'hex' }
)

contract('Tree', function(accounts) {
  let kernel, acl, tree, toInit

  before(async () => {
    // Configure contracts
    Kernel.setProvider(web3.currentProvider)
    Kernel.defaults({ from: accounts[0], gas: GAS })
    DAOFactory.setProvider(web3.currentProvider)
    DAOFactory.defaults({ from: accounts[0], gas: GAS })
    ACL.setProvider(web3.currentProvider)
    ACL.defaults({ from: accounts[0], gas: GAS })
    AppProxyUpgradeable.setProvider(web3.currentProvider)
    AppProxyUpgradeable.defaults({ from: accounts[0], gas: GAS })

    // Deploy DAOFactory
    const kernelBase = await Kernel.new()
    const aclBase = await ACL.new()
    const factory = await DAOFactory.new(
      kernelBase.address,
      aclBase.address,
      '0x00'
    )

    // Deploy aragonOS-based DAO
    const receipt = await factory.newDAO(accounts[0])
    const dao = receipt.logs.filter(l => l.event === 'DeployDAO')[0].args.dao
    kernel = await Kernel.at(dao)
    acl = await ACL.at(await kernel.acl())

    // Grant APP_MANAGER_ROLE over the DAO
    const APP_MANAGER_ROLE = await kernel.APP_MANAGER_ROLE()
    const receipt2 = await acl.createPermission(
      accounts[0],
      kernel.address,
      APP_MANAGER_ROLE,
      accounts[0]
    )

    // // Deploy tree app
    const treeBase = await Tree.new()
    await kernel.setApp(APP_BASE_NAMESPACE, TREE_BASE_APP_ID, treeBase.address)
    const initializationPayload = treeBase.contract.initialize.getData()
    const appProxy = await AppProxyUpgradeable.new(
      kernel.address,
      TREE_BASE_APP_ID,
      initializationPayload,
      { gas: 6e6 }
    )
    tree = await Tree.at(appProxy.address)
    await kernel.setApp(APP_NAMESPACE, TREE_BASE_APP_ID, tree.address)
  })

  it('should deploy correctly', async () => {
    toInit = await Tree.new()
  })

  it('should initialize correctly', async () => {
    await toInit.initialize()
  })

  it('should allow to create PUSH role correctly', async () => {
    const PUSH = await tree.PUSH()
    const receipt = await acl.createPermission(
      accounts[0],
      tree.address,
      PUSH,
      accounts[0]
    )
    const pManager = await acl.getPermissionManager(tree.address, PUSH)

    assert.equal(
      pManager,
      accounts[0],
      'accounts[0] should be permission manager of PUSH role over tree'
    )
  })

  it('should allow to grant PUSH role correctly', async () => {
    const PUSH = await tree.PUSH()
    const receipt = await acl.grantPermission(accounts[1], tree.address, PUSH)
    const permission = await acl.hasPermission(accounts[1], tree.address, PUSH)

    assert.equal(permission, true, 'accounts[1] should own PUSH role over tree')
  })

  context('#newBranch', () => {
    let receipt

    it('should create new branch correctly', async () => {
      receipt = await tree.newBranch('master')
      let branchName = await tree.branches(0)

      assert.equal(branchName, 'master', "branch name should equal 'master'")
    })

    it('should emit NewBranch event correctly', async () => {
      let event = receipt.logs.filter(l => l.event === 'NewBranch')[0]
      let name = event.args.name
      let branchID = event.args.branchID

      assert.exists(event, "newBranch should emit a 'NewBranch' event")
      assert.equal(name, 'master', "NewBranch 'name' arg should equal 'master'")
      assert.equal(branchID, 0, "NewBranch 'branchID' arg should equal 0")
    })

    it('should revert if user do not own PUSH role', async () => {
      return assertRevert(async () => {
        await tree.newBranch('test', { from: accounts[2] })
      })
    })

    it('should revert if branch already exists', async () => {
      return assertRevert(async () => {
        await tree.newBranch('master')
      })
    })
  })

  context('#getBranchesName', () => {
    it('should get remote branches name correctly', async () => {
      await tree.newBranch('dev')
      let branchesName = await tree.getBranchesName()
      let branches = branchesName.split('0x|x0')
      branches.splice(-1, 1)

      assert.equal(branches[0], 'master', "branches[0] should equal 'master'")
      assert.equal(branches[1], 'dev', "branches[1] should equal 'dev'")
      assert.notExists(branches[2], 'branches[2] should not exist')
    })
  })

  context('#setHead', () => {
    let receipt

    it('should set head correctly', async () => {
      receipt = await tree.setHead('master', 'testcid')
      let head = await tree.getHead('master')

      assert.equal(head, 'testcid', "head should equal 'testcid'")
    })

    it('should emit NewSnapshot event correctly', async () => {
      let event = receipt.logs.filter(l => l.event === 'NewSnapshot')[0]
      let branch = event.args.branch
      let author = event.args.author
      let cid = event.args.cid

      assert.exists(event, "setHead should emit a 'NewSnapshot' event")
      assert.equal(
        branch,
        'master',
        "NewSnapshot branch arg should equal 'master'"
      )
      assert.equal(
        author,
        accounts[0],
        'NewSnapshot author arg should equal accounts[0]'
      )
      assert.equal(cid, 'testcid', "NewSnapshot cid arg should equal 'testcid'")
    })

    it('should revert if user do not own PUSH role', async () => {
      return assertRevert(async () => {
        await tree.setHead('master', 'testcid2', { from: accounts[2] })
      })
    })

    it('should revert if branch does not exist', async () => {
      return assertRevert(async () => {
        await tree.setHead('doesnotexist', 'testcid2')
      })
    })
  })

  context('#getHead', () => {
    it('should get head correctly', async () => {
      let head = await tree.getHead('master')

      assert.equal(head, 'testcid', "head should equal 'testcid'")
    })

    it("should return 'undefined' if branch has no snapshot yet", async () => {
      let head = await tree.getHead('dev')

      assert.equal(head, 'undefined', "head should equal 'undefined'")
    })

    it('should revert if branch does not exist', async () => {
      return assertRevert(async () => {
        await tree.getHead('doesnotexist')
      })
    })
  })

  context('#isBranch', () => {
    it('should return true if branch exists', async () => {
      let hash = '0x' + keccak256('master')
      let exists = await tree.isBranch(hash)

      assert.equal(exists, true, "isBranch('master') should return true")
    })

    it('should return true if branch exists', async () => {
      let hash = '0x' + keccak256('doesnotexist')
      let exists = await tree.isBranch(hash)

      assert.equal(
        exists,
        false,
        "isBranch('doesnotexist') should return false"
      )
    })
  })
})
