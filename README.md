

let pando0x = new Pando0x(ethereum)


DAO
kernel
acl


let dao = pando0x.dao.deploy()
let dao = pando0x.dao.at()
let dao = pando0x.dao.fork(0xgfgdf)

dao.kernel.upgrade()
dao.acl.grant()

let repository = pando0x.repository.create()
let repository = pando0x.repository.load()
let repository = pando0x.repository.clone(0xgssgf)

repository.add()
repository.commit()
repository.checkout()
repository.push()





pando0X.ethereum
pando0X.provider
pando0X.account

pando0X.network

pando0X.kernel

pando0X.remote

pando0x.local

pando0x.local.paths

// Load from remote repository
pando0x.at('@wespr/truc.pando0X.eth')

// Load from local copy
pando0x.load('../myrepo')


pando0X.repository.add()

pando0X.repository.commit()

pando0X.repository.push()

pando0X.repository.checkout()

pando0X.remote.clone()

pando0X.remote.fork()


let remote = Pando0x.Remote.deploy()

let repository = Pando.Repository.create()






let pando0x = Pando0x.deploy({ contributor: { account: '0x4567'}, ethereum: { gateway: 'http://url', networkId: '2'} })
initializes kernel and remote

let pando0x = Pando0x.load(path)
initializes kernel and remote

let pando0x = Pando0.create({ contributor: { address: '0x4567'}, repository: { path: 'path_to_repository'} })
initializes kernel, remote and repository

let pando0x = Pando0x.clone({ contributor?: { address: '0x4567'}, remote: { address: 0x534653 }, repository: { path: 'path_to_repository'} })

let pando0x = Pando0x.fork({ contributor?: { address: '0x4567'}, remote: { address: 0x534653 } })

pando0x = repository 