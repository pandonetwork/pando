/* eslint-disable no-undef */
const Kernel = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL = artifacts.require('@aragon/os/contracts/acl/ACL')
const RegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory = artifacts.require('@aragon/os/contracts/factory/DAOFactory')
const Pando = artifacts.require('Pando')
const Lineage = artifacts.require('Lineage')
const Genesis = artifacts.require('Genesis')
const Organism = artifacts.require('Organism')

const { RFI_STATE } = require('@pando/helpers/state')
const { RFL_STATE } = require('@pando/helpers/state')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const blocknumber = require('@aragon/test-helpers/blockNumber')(web3)

contract('Organism', accounts => {
  let factory, pando, genesis, lineage, organism

  const root = accounts[0]
  const origin = accounts[1]
  const dependency = accounts[2]
  const authorized = accounts[3]
  const unauthorized = accounts[4]

  const individuation = { metadata: 'QwAwesomeIPFSHash' }
  const lineage0 = { destination: origin, minimum: 0, metadata: '0x1987' }
  const lineage1 = {
    destination: dependency,
    minimum: 15,
    metadata: '0x1987',
  }

  const deploy = async () => {
    // DAO
    const receipt1 = await factory.newDAO(root)
    const dao = await Kernel.at(receipt1.logs.filter(l => l.event === 'DeployDAO')[0].args.dao)
    const acl = await ACL.at(await dao.acl())
    await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })
    // Pando Lib
    const pando = await Pando.new()
    // Genesis
    const receipt2 = await dao.methods['newAppInstance(bytes32,address)']('0x0001', (await Genesis.new()).address, { from: root })
    const genesis = await Genesis.at(receipt2.logs.filter(l => l.event === 'NewAppProxy')[0].args.proxy)
    // Lineage
    const receipt3 = await dao.methods['newAppInstance(bytes32,address)']('0x0002', (await Lineage.new()).address, { from: root })
    const lineage = await Lineage.at(receipt3.logs.filter(l => l.event === 'NewAppProxy')[0].args.proxy)
    // Organism
    const receipt4 = await dao.methods['newAppInstance(bytes32,address)']('0x0003', (await Organism.new()).address, { from: root })
    const organism = await Organism.at(receipt4.logs.filter(l => l.event === 'NewAppProxy')[0].args.proxy)
    await acl.createPermission(organism.address, genesis.address, await genesis.INDIVIDUATE_ROLE(), root, { from: root })
    await acl.createPermission(organism.address, lineage.address, await lineage.MINT_ROLE(), root, { from: root })
    await acl.createPermission(authorized, organism.address, await organism.CREATE_RFI_ROLE(), root, { from: root })
    await acl.createPermission(authorized, organism.address, await organism.MERGE_RFI_ROLE(), root, { from: root })
    await acl.createPermission(authorized, organism.address, await organism.REJECT_RFI_ROLE(), root, { from: root })
    await acl.createPermission(authorized, organism.address, await organism.ACCEPT_RFL_ROLE(), root, { from: root })
    await acl.createPermission(authorized, organism.address, await organism.REJECT_RFL_ROLE(), root, { from: root })

    await lineage.initialize()
    await genesis.initialize(pando.address)
    await organism.initialize(pando.address, genesis.address, lineage.address, {
      from: root,
    })

    return { pando, genesis, lineage, organism }
  }

  before(async () => {
    const kernelBase = await Kernel.new(true) // petrify immediately
    const aclBase = await ACL.new()
    const regFactory = await RegistryFactory.new()
    factory = await DAOFactory.new(kernelBase.address, aclBase.address, regFactory.address)
  })

  beforeEach(async () => {
    ;({ pando, genesis, lineage, organism } = await deploy())
  })

  context('#initialize', () => {
    it('should initialize organism', async () => {
      const pandoAddress = await organism.pando()
      const genesisAddress = await organism.genesis()
      const lineageAddress = await organism.lineage()

      assert.equal(pandoAddress, pando.address)
      assert.equal(genesisAddress, genesis.address)
      assert.equal(lineageAddress, lineage.address)
    })

    it('should revert on reinitialization', async () => {
      return assertRevert(async () => {
        await organism.initialize(pando.address, genesis.address, lineage.address, { from: root })
      })
    })
  })

  context('Requests For Individuation | RFI', () => {
    context('#create', () => {
      context('sender has CREATE_RFI_ROLE', () => {
        it('should create RFI', async () => {
          const receipt = await organism.createRFI(individuation, [lineage0], {
            from: authorized,
          })
          const RFIid = receipt.logs.filter(x => x.event === 'CreateRFI')[0].args.id.toNumber()

          assert.equal(RFIid, 1)
        })

        it('should initialize RFI', async () => {
          await organism.createRFI(individuation, [lineage0, lineage1], {
            from: authorized,
          })

          const RFI = await organism.getRFI(1)

          assert.equal(RFI.individuation.metadata, individuation.metadata)
          assert.equal(RFI.blockstamp, await blocknumber())
          assert.equal(RFI.state, RFI_STATE.PENDING)
          assert.equal(RFI.RFLids[0], 1)
          assert.equal(RFI.RFLids[1], 2)
        })

        it('should initialize related RFLs', async () => {
          await organism.createRFI(individuation, [lineage0], {
            from: authorized,
          })
          await organism.createRFI(individuation, [lineage1], {
            from: authorized,
          })

          const RFL_1 = await organism.getRFL(1)
          const RFL_2 = await organism.getRFL(2)

          assert.equal(RFL_1.lineage.destination, lineage0.destination)
          assert.equal(RFL_1.lineage.minimum, lineage0.minimum)
          assert.equal(RFL_1.lineage.metadata, lineage0.metadata)
          assert.equal(RFL_1.blockstamp, (await blocknumber()) - 1)
          assert.equal(RFL_1.state, RFL_STATE.PENDING)
          assert.equal(RFL_1.RFIid, 1)

          assert.equal(RFL_2.lineage.destination, lineage1.destination)
          assert.equal(RFL_2.lineage.minimum, lineage1.minimum)
          assert.equal(RFL_2.lineage.metadata, lineage1.metadata)
          assert.equal(RFL_2.blockstamp, await blocknumber())
          assert.equal(RFL_2.state, RFL_STATE.PENDING)
          assert.equal(RFL_2.RFIid, 2)
        })
      })

      context('sender does not have CREATE_RFI_ROLE', () => {
        it('should revert', async () => {
          return assertRevert(async () => {
            await organism.createRFI(individuation, [lineage0], {
              from: unauthorized,
            })
          })
        })
      })
    })

    context('#merge', () => {
      context('RFI exists', () => {
        context('and sender has MERGE_RFI_ROLE', () => {
          context('and RFI is pending', () => {
            context('and all related RFLs are accepted', () => {
              it('should merge RFI', async () => {
                await organism.createRFI(individuation, [lineage0], {
                  from: authorized,
                })
                await organism.acceptRFL(1, lineage0.minimum, {
                  from: authorized,
                })
                await organism.mergeRFI(1, { from: authorized })

                const RFI = await organism.getRFI(1)

                assert.equal(RFI.state, RFI_STATE.MERGED)
              })

              it('should update genesis head', async () => {
                await organism.createRFI(individuation, [lineage0], {
                  from: authorized,
                })
                await organism.acceptRFL(1, lineage0.minimum, {
                  from: authorized,
                })
                await organism.mergeRFI(1, { from: authorized })

                const head = await organism.head()
                const hash = await organism.getIndividuationHash([await blocknumber(), 'QwAwesomeIPFSHash'])

                assert.equal(head, hash)
              })

              it('should issue related RFLs', async () => {
                await organism.createRFI(individuation, [lineage0, lineage1], { from: authorized })
                await organism.acceptRFL(1, 25, { from: authorized })
                await organism.acceptRFL(2, 45, { from: authorized })
                await organism.mergeRFI(1, { from: authorized })

                const RFL_1 = await organism.getRFL(1)
                const RFL_2 = await organism.getRFL(2)

                const balanceOfOrigin = await lineage.balanceOf(origin)
                const balanceOfDepency = await lineage.balanceOf(dependency)

                assert.equal(RFL_1.state, RFL_STATE.ISSUED)
                assert.equal(RFL_2.state, RFL_STATE.ISSUED)
                assert.equal(balanceOfOrigin, 25)
                assert.equal(balanceOfDepency, 45)
              })
            })

            context('but at least one of the related RFLs is not accepted', () => {
              it('should revert', async () => {
                await organism.createRFI(individuation, [lineage0], { from: authorized })

                return assertRevert(async () => {
                  await organism.mergeRFI(1, { from: authorized })
                })
              })
            })
          })

          context('but RFI is not pending anymore', () => {
            it('should revert', async () => {
              await organism.createRFI(individuation, [lineage0], {
                from: authorized,
              })
              await organism.acceptRFL(1, lineage0.minimum, {
                from: authorized,
              })
              await organism.mergeRFI(1, { from: authorized })

              // RFI is already merged and thus not pending anymore
              return assertRevert(async () => {
                await organism.mergeRFI(1, { from: authorized })
              })
            })
          })
        })

        context('but sender does not have SORT_RFI_ROLE', () => {
          it('should revert', async () => {
            await organism.createRFI(individuation, [lineage0], {
              from: authorized,
            })
            await organism.acceptRFL(1, lineage0.minimum, {
              from: authorized,
            })

            return assertRevert(async () => {
              await organism.mergeRFI(1, { from: unauthorized })
            })
          })
        })
      })

      context('RFI does not exist', () => {
        it('should revert', async () => {
          return assertRevert(async () => {
            await organism.mergeRFI(1, { from: authorized })
          })
        })
      })
    })

    context('#reject', () => {
      context('RFI exists', () => {
        context('and sender has REJECT_RFI_ROLE', () => {
          context('and RFI is pending', () => {
            it('should reject RFI', async () => {
              await organism.createRFI(individuation, [lineage0], {
                from: authorized,
              })
              await organism.rejectRFI(1, { from: authorized })

              const RFI = await organism.getRFI(1)

              assert.equal(RFI.state, RFI_STATE.REJECTED)
            })

            it('should cancel all related RFLs', async () => {
              await organism.createRFI(individuation, [lineage0, lineage1], {
                from: authorized,
              })
              await organism.rejectRFI(1, { from: authorized })

              const RFL_1 = await organism.getRFL(1)
              const RFL_2 = await organism.getRFL(2)

              assert.equal(RFL_1.state, RFL_STATE.CANCELLED)
              assert.equal(RFL_2.state, RFL_STATE.CANCELLED)
            })
          })

          context('but RFI is not pending anymore', () => {
            it('should revert', async () => {
              await organism.createRFI(individuation, [lineage0], {
                from: authorized,
              })
              await organism.acceptRFL(1, lineage0.minimum, {
                from: authorized,
              })
              await organism.mergeRFI(1, { from: authorized })

              // RFI is already merged and thus not pending anymore
              return assertRevert(async () => {
                await organism.rejectRFI(1, { from: authorized })
              })
            })
          })
        })

        context('but sender does not have REJECT_RFI_ROLE', () => {
          it('should revert', async () => {
            await organism.createRFI(individuation, [lineage0], {
              from: authorized,
            })

            return assertRevert(async () => {
              await organism.rejectRFI(1, { from: unauthorized })
            })
          })
        })
      })

      context('RFI does not exist', () => {
        it('should revert', async () => {
          return assertRevert(async () => {
            await organism.rejectRFI(1, { from: authorized })
          })
        })
      })
    })
  })

  context('Requests For Lineage | RFL', () => {
    context('#accept', () => {
      context('RFL exists', () => {
        context('and sender has ACCEPT_RFL_ROLE', () => {
          context('and RFL is pending', () => {
            context('and value is superior or equal to minimum', () => {
              it('should accept RFL', async () => {
                await organism.createRFI(individuation, [lineage0], {
                  from: authorized,
                })
                await organism.acceptRFL(1, lineage0.minimum, {
                  from: authorized,
                })

                const RFL = await organism.getRFL(1)

                assert.equal(RFL.state, RFL_STATE.ACCEPTED)
              })

              it('should update RFL value', async () => {
                await organism.createRFI(individuation, [lineage0], {
                  from: authorized,
                })
                await organism.acceptRFL(1, 15, { from: authorized })

                const RFL = await organism.getRFL(1)

                assert.equal(RFL.value, 15)
              })
            })

            context('but value is inferior to minimum', () => {
              it('should revert', async () => {
                await organism.createRFI(individuation, [lineage1], {
                  from: authorized,
                })

                return assertRevert(async () => {
                  await organism.acceptRFL(1, lineage1.minimum - 1)
                })
              })
            })
          })

          context('but RFL is not pending anymore', () => {
            it('should revert', async () => {
              await organism.createRFI(individuation, [lineage0], {
                from: authorized,
              })
              await organism.acceptRFL(1, lineage0.minimum, {
                from: authorized,
              })

              // RFL is already accepted and thus not pending anymore
              return assertRevert(async () => {
                await organism.acceptRFL(1, lineage0.minimum, {
                  from: authorized,
                })
              })
            })
          })
        })

        context('but sender does not have ACCEPT_RFL_ROLE', () => {
          it('should revert', async () => {
            await organism.createRFI(individuation, [lineage0], {
              from: authorized,
            })

            return assertRevert(async () => {
              await organism.acceptRFL(1, lineage0.minimum, {
                from: unauthorized,
              })
            })
          })
        })
      })

      context('RFL does not exist', () => {
        it('should revert', async () => {
          return assertRevert(async () => {
            await organism.acceptRFL(1, lineage0.minimum, {
              from: authorized,
            })
          })
        })
      })
    })

    context('#reject', () => {
      context('RFL exists', () => {
        context('and sender has REJECT_RFL_ROLE', () => {
          context('and RFL is pending', () => {
            it('should reject RFL', async () => {
              await organism.createRFI(individuation, [lineage0], {
                from: authorized,
              })
              await organism.rejectRFL(1, { from: authorized })

              const RFL = await organism.getRFL(1)

              assert.equal(RFL.state, RFL_STATE.REJECTED)
            })

            it('should cancel related RFI', async () => {
              await organism.createRFI(individuation, [lineage0, lineage1], {
                from: authorized,
              })
              await organism.rejectRFL(1, { from: authorized })

              const RFI = await organism.getRFI(1)

              assert.equal(RFI.state, RFI_STATE.CANCELLED)
            })

            it('should cancel related RFLs', async () => {
              await organism.createRFI(individuation, [lineage0, lineage1], {
                from: authorized,
              })
              await organism.rejectRFL(1, { from: authorized })

              const RFL = await organism.getRFL(2)

              assert.equal(RFL.state, RFL_STATE.CANCELLED)
            })
          })

          context('but RFL is not pending anymore', () => {
            it('should revert', async () => {
              await organism.createRFI(individuation, [lineage0], {
                from: authorized,
              })
              await organism.acceptRFL(1, lineage0.minimum, {
                from: authorized,
              })

              // RFL is already accepted and thus not pending anymore
              return assertRevert(async () => {
                await organism.rejectRFL(1, { from: authorized })
              })
            })
          })
        })

        context('but sender does not have REJECT_RFL_ROLE', () => {
          it('should revert', async () => {
            await organism.createRFI(individuation, [lineage0], {
              from: authorized,
            })

            return assertRevert(async () => {
              await organism.rejectRFL(1, { from: unauthorized })
            })
          })
        })
      })

      context('RFL does not exist', () => {
        it('should revert', async () => {
          return assertRevert(async () => {
            await organism.rejectRFL(1, { from: authorized })
          })
        })
      })
    })
  })
})
