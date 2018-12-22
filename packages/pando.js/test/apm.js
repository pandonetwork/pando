/* eslint-disable import/no-duplicates */
import APM from '@aragon/apm'
import fs from 'fs-extra'
import path from 'path'
import chai from 'chai'
import capture from 'collect-console'

import promised from 'chai-as-promised'

import Web3 from 'web3'

chai.use(promised)
const expect = chai.expect
const should = chai.should()

const account = '0xd9d07da98fd0b62458e168225131e2f758e2984d'
const gateway = { fake: { protocol: 'ws', host: '192.168.0.1', port: '8546' } }

describe('APM', () => {
    let pando, repository

    const initialize = async () => {
        pando = await Pando.create()
    }

    describe('#create', () => {
        describe('ethereum option is passed as gateway', () => {
            it('it should return created pando object', async () => {
                const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
                console.log(web3.currentProvider)
                const apm = APM(web3, { ensRegistryAddress: '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1', ipfs: 'http://locahost:5001' })
                console.log(apm)
                const latest = await apm.getLatestVersion('organization-factory.aragonpm.eth')
                console.log(latest)
            })

        })





        // it('it should throw', async () => {
        //     let pando = new Pando({ ethereum: { protocol: 'ws', address: 'blablabla', port: '43' }})
        //
        //     console.log(pando.configuration)
        //     // console.log(pando.contracts)
        //     console.log(pando.contracts.PandoLineage)
        //
        // })
    })
})
