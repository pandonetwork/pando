import Loom from '@components/loom';
import { hash } from 'eth-ens-namehash';
import ethereumRegex from 'ethereum-regex';
import { keccak256, sha3_256 } from 'js-sha3';
import web3Utils from 'web3-utils';

export default class Remote {
  public static APP_BASE_NAMESPACE = '0x' + keccak256('base');
  public static TREE_BASE_APP_ID = hash('tree.pando.aragonpm.test');
  public static TREE_APP_ID = web3Utils.sha3(
    Remote.APP_BASE_NAMESPACE + Remote.TREE_BASE_APP_ID.substring(2),
    { encoding: 'hex' }
  );

  public loom: Loom;
  public name: string;
  public kernel: any;
  public acl?: any;
  public tree?: any;

  public constructor(
    _loom: Loom,
    _kernel: any,
    _acl: any,
    _tree: any,
    _name: string
  ) {
    this.loom = _loom;
    this.name = _name;
    this.kernel = _kernel;
    this.acl = _acl;
    this.tree = _tree;
  }

  public static async deploy(_loom: Loom): Promise<any> {
    // Deploy base contracts
    const kernelBase = await _loom.pando.contracts.kernel.new();
    const aclBase = await _loom.pando.contracts.acl.new();
    const factory = await _loom.pando.contracts.daoFactory.new(
      kernelBase.address,
      aclBase.address,
      '0x00'
    );
    // Deploy aragonOS-based DAO
    const receipt = await factory.newDAO(_loom.config.author.account);
    const kernelAddress = receipt.logs.filter(l => l.event === 'DeployDAO')[0]
      .args.dao;
    const kernel = await _loom.pando.contracts.kernel.at(kernelAddress);
    const acl = await _loom.pando.contracts.acl.at(await kernel.acl());
    // Grant current author APP_MANAGER_ROLE over the DAO
    const APP_MANAGER_ROLE = await kernel.APP_MANAGER_ROLE();
    const receipt2 = await acl.createPermission(
      _loom.config.author.account,
      kernel.address,
      APP_MANAGER_ROLE,
      _loom.config.author.account
    );
    // Deploy tree app
    const tree = await _loom.pando.contracts.tree.new();
    const receipt3 = await kernel.newAppInstance(
      Remote.TREE_BASE_APP_ID,
      tree.address
    );
    // let treeAddress = receipt3.logs.filter(l => l.event === 'NewAppProxy')[0].args.proxy
    // let tree        = await _loom.pando.contracts.tree.at(treeAddress)
    // // Create PUSH role
    const PUSH = await tree.PUSH();
    const receipt4 = await acl.createPermission(
      _loom.config.author.account,
      tree.address,
      PUSH,
      _loom.config.author.account
    );
    // Create master branch
    const receipt5 = await tree.newBranch('master');

    return { kernel, acl, tree };
  }

  public static async at(_loom: Loom, _kernelAddress: string): Promise<any> {
    const kernel = await _loom.pando.contracts.kernel.at(_kernelAddress);
    const acl = await _loom.pando.contracts.acl.at(await kernel.acl());
    const tree = await _loom.pando.contracts.tree.at(
      await kernel.getApp(Remote.TREE_APP_ID)
    );

    return { kernel, acl, tree };
  }

  public async newBranch(_name: string) {
    await this.tree.newBranch(_name);
    await this.loom.branch.new(_name, { remote: this.name });
  }

  public async getBranchesName(): Promise<string[]> {
    const separator = await this.tree.SEPARATOR();
    const branches = await this.tree.getBranchesName();
    const array = branches.split(separator);
    array.splice(-1, 1);

    return array;
  }

  public async push(_branch: string, _cid: string): Promise<any> {
    const branchHash = '0x' + keccak256(_branch);
    const tx = await this.tree.setHead(_branch, _cid);

    return tx;
  }

  public async head(_branch: string): Promise<any> {
    const branchHash = '0x' + keccak256(_branch);
    const head = await this.tree.getHead(branchHash);

    return head;
  }

  public async show(): Promise<any> {
    const branches = await this.getBranchesName();
    const remote = {
      kernel: this.kernel.address,
      acl: this.acl.address,
      tree: this.tree.address,
      branches: {}
    };

    for (const branch of branches) {
      console.log(branch);
      remote.branches[branch] = { head: await this.head(branch) };
    }

    return remote;
  }

  public async fetch(): Promise<any> {
    const branches = await this.getBranchesName();
    console.log('banches');
    console.log(branches);
    const heads = {};
    console.log('avant boucle');
    for (const branchName of branches) {
      console.log(branchName);
      const head = await this.head(branchName);
      console.log('Name');
      console.log(this.name);
      const branch = await this.loom.branch.load(branchName, {
        remote: this.name
      });
      console.log('on a la branch');
      branch.head = head;
      heads[branchName] = await this.head(branchName);
    }

    return heads;
  }

  public async grant(_what: string, _who: string): Promise<any> {
    let receipt;

    if (!ethereumRegex({ exact: true }).test(_who)) {
      throw new TypeError('Invalid ethereum address: ' + _who);
    }

    switch (_what) {
      case 'PUSH':
        const PUSH = await this.tree.PUSH();
        receipt = await this.acl.grantPermission(_who, this.tree.address, PUSH);
        break;
      default:
        throw new TypeError('Invalid role: ' + _what);
    }

    return receipt;
  }
}
