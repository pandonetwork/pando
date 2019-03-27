/* eslint-disable no-undef */
const DAOFactory = artifacts.require('DAOFactory')
const Kernel = artifacts.require('Kernel')
const ACL = artifacts.require('ACL')
const EVMScriptRegistryFactory = artifacts.require('EVMScriptRegistryFactory')
const PandoRepository = artifacts.require('PandoRepository')

const assertEvent = require('@aragon/test-helpers/assertEvent')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')

const PR_STATE = ['PENDING', 'MERGED', 'REJECTED'].reduce((state, key, index) => {
  state[key] = index
  return state
}, {})

contract('PandoRepository', accounts => {
  let factory, repo

  const root = accounts[0]
  const authorized = accounts[1]
  const unauthorized = accounts[2]

  const deploy = async () => {
    // DAO
    const receipt1 = await factory.newDAO(root)
    const dao = await Kernel.at(receipt1.logs.filter(l => l.event === 'DeployDAO')[0].args.dao)
    const acl = await ACL.at(await dao.acl())
    await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })
    // Colony
    const receipt2 = await dao.methods['newAppInstance(bytes32,address)']('0x0001', (await PandoRepository.new()).address)
    const repo = await PandoRepository.at(receipt2.logs.filter(l => l.event === 'NewAppProxy')[0].args.proxy)
    // Initialization
    await repo.initialize('aragonOS', 'Solidity framework to build crazy DAOs', { from: root })
    // Permissions
    await acl.createPermission(authorized, repo.address, await repo.PUSH_ROLE(), root, { from: root })
    await acl.createPermission(authorized, repo.address, await repo.OPEN_PR_ROLE(), root, { from: root })
    await acl.createPermission(authorized, repo.address, await repo.SORT_PR_ROLE(), root, { from: root })
    await acl.createPermission(authorized, repo.address, await repo.UPDATE_INFORMATIONS_ROLE(), root, { from: root })

    return { dao, acl, repo }
  }

  before(async () => {
    const kBase = await Kernel.new(true) // petrify immediately
    const aBase = await ACL.new()
    const rFactory = await EVMScriptRegistryFactory.new()
    factory = await DAOFactory.new(kBase.address, aBase.address, rFactory.address)
  })

  context('> #initialize', () => {
    before(async () => {
      ;({ repo } = await deploy())
    })

    it('it should initialize repository', async () => {
      assert.equal(await repo.name(), 'aragonOS')
      assert.equal(await repo.description(), 'Solidity framework to build crazy DAOs')
    })

    it('it should revert on re-initialization', async () => {
      return assertRevert(async () => {
        await repo.initialize('aragonOS', 'Solidity framework to build crazy DAOs', { from: root })
      })
    })
  })

  context('> #push', () => {
    beforeEach(async () => {
      ;({ repo } = await deploy())
    })

    context('> sender has PUSH_ROLE', () => {
      it('it should update ref', async () => {
        const receipt = await repo.push('refs/head/master', 'QAwesomeIPFSHash', { from: authorized })

        assertEvent(receipt, 'UpdateRef')
        assert.equal(await repo.ref('refs/head/master'), 'QAwesomeIPFSHash')
      })
    })

    context('> sender does not have PUSH_ROLE', () => {
      it('it should revert', async () => {
        return assertRevert(async () => {
          await repo.push('refs/head/master', 'QAwesomeIPFSHash', { from: unauthorized })
        })
      })
    })
  })

  context('> #openPR', () => {
    beforeEach(async () => {
      ;({ repo } = await deploy())
    })

    context('> sender has OPEN_PR_ROLE', () => {
      it('it should create PR', async () => {
        const receipt = await repo.openPR('My first PR', 'This is just a test PR', 'refs/head/master', 'QAwesomeIPFSHash', { from: authorized })
        const pr = await repo.PRs(1)

        assertEvent(receipt, 'OpenPR')
        assert.equal(pr.state, PR_STATE.PENDING)
        assert.equal(pr.author, authorized)
        assert.equal(pr.title, 'My first PR')
        assert.equal(pr.description, 'This is just a test PR')
        assert.equal(pr.ref, 'refs/head/master')
        assert.equal(pr.hash, 'QAwesomeIPFSHash')
      })
    })

    context('> sender does not have OPEN_PR_ROLE', () => {
      it('it should revert', async () => {
        return assertRevert(async () => {
          await repo.openPR('My first PR', 'This is just a test PR', 'refs/head/master', 'QAwesomeIPFSHash', { from: unauthorized })
        })
      })
    })
  })

  context('> #mergePR', () => {
    beforeEach(async () => {
      ;({ repo } = await deploy())
      await repo.openPR('My first PR', 'This is just a test PR', 'refs/head/master', 'QAwesomeIPFSHash', { from: authorized })
    })

    context('> sender has SORT_PR_ROLE', () => {
      context('> and PR exists', () => {
        context('> and PR has not been sorted yet', () => {
          it('it should merge PR', async () => {
            const receipt = await repo.mergePR(1, { from: authorized })
            const pr = await repo.PRs(1)

            assertEvent(receipt, 'MergePR')
            assertEvent(receipt, 'UpdateRef')
            assert.equal(pr.state, PR_STATE.MERGED)
            assert.equal(await repo.ref('refs/head/master'), 'QAwesomeIPFSHash')
          })
        })

        context('> but PR has already been sorted ', () => {
          it('it should revert', async () => {
            await repo.mergePR(1, { from: authorized })

            return assertRevert(async () => {
              await repo.mergePR(1, { from: authorized })
            })
          })
        })
      })

      context('> but PR does not exists', () => {
        it('it should revert', async () => {
          return assertRevert(async () => {
            await repo.mergePR(2, { from: authorized })
          })
        })
      })
    })

    context('> sender does not have SORT_PR_ROLE', () => {
      it('it should revert', async () => {
        return assertRevert(async () => {
          await repo.mergePR(1, { from: unauthorized })
        })
      })
    })
  })

  context('> #rejectPR', () => {
    beforeEach(async () => {
      ;({ repo } = await deploy())
      await repo.openPR('My first PR', 'This is just a test PR', 'refs/head/master', 'QAwesomeIPFSHash', { from: authorized })
    })

    context('> sender has SORT_PR_ROLE', () => {
      context('> and PR exists', () => {
        context('> and PR has not been sorted yet', () => {
          it('it should reject PR', async () => {
            const receipt = await repo.rejectPR(1, { from: authorized })
            const pr = await repo.PRs(1)

            assertEvent(receipt, 'RejectPR')
            assert.equal(pr.state, PR_STATE.REJECTED)
            assert.equal(await repo.ref('refs/head/master'), '')
          })
        })

        context('> but PR has already been sorted ', () => {
          it('it should revert', async () => {
            await repo.mergePR(1, { from: authorized })

            return assertRevert(async () => {
              await repo.rejectPR(1, { from: authorized })
            })
          })
        })
      })

      context('> but PR does not exists', () => {
        it('it should revert', async () => {
          return assertRevert(async () => {
            await repo.rejectPR(2, { from: authorized })
          })
        })
      })
    })

    context('> sender does not have SORT_PR_ROLE', () => {
      it('it should revert', async () => {
        return assertRevert(async () => {
          await repo.rejectPR(1, { from: unauthorized })
        })
      })
    })
  })

  context('> #updateInformations', () => {
    beforeEach(async () => {
      ;({ repo } = await deploy())
    })

    context('> sender has UPDATE_INFORMATIONS_ROLE', () => {
      it('it should update repository informations', async () => {
        const receipt = await repo.updateInformations('aragonAPI', 'JS libraryto build crazy DAOs', { from: authorized })

        assertEvent(receipt, 'UpdateInformations')
        assert.equal(await repo.name(), 'aragonAPI')
        assert.equal(await repo.description(), 'JS libraryto build crazy DAOs')
      })
    })

    context('> sender does not have UPDATE_INFORMATIONS_ROLE', () => {
      it('it should revert', async () => {
        return assertRevert(async () => {
          await repo.updateInformations('aragonAPI', 'JS libraryto build crazy DAOs', { from: unauthorized })
        })
      })
    })
  })
})
