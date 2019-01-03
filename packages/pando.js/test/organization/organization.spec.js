/* eslint-disable import/no-duplicates */
import Pando from '../../lib'
import fs from 'fs-extra'
import path from 'path'
import chai from 'chai'
import capture from 'collect-console'

import promised from 'chai-as-promised'

import Web3 from 'web3'

chai.use(promised)
const expect = chai.expect
const should = chai.should()

const account = '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7'
const gateway = { fake: { protocol: 'ws', host: '192.168.0.1', port: '8546' } }
const options = { ethereum: { account: account }}

describe('@pando/pando.js/organizations/factory', () => {
    let pando, repository

    const initialize = async () => {
        pando = await Pando.create(options)
    }

    describe('#deploy', () => {
        describe('ethereum option is passed as gateway', () => {
            it('it should return created pando object', async () => {
                await initialize()
                const organization = await pando.organizations.deploy()

                console.log(organization.kernel.address)
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
