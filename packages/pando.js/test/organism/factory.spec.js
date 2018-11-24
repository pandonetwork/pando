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

const account = '0xd9d07da98fd0b62458e168225131e2f758e2984d'
const gateway = { fake: { protocol: 'ws', host: '192.168.0.1', port: '8546' } }

describe('@pando/pando.js/organism/factory', () => {
    let pando, repository

    const initialize = async () => {
        pando = await Pando.create()
    }

    describe('#at', () => {
        describe('ethereum option is passed as gateway', () => {
            it('it should return created pando object', async () => {
                pando = await Pando.create({ ethereum: { account, gateway: gateway.fake } })

                console.log(pando.organisms)
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
