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

describe('@pando/pando.js', () => {
    let pando, repository

    const initialize = async () => {
        pando = await Pando.create()
    }

    describe('#create', () => {
        describe('ethereum option is passed as gateway', () => {
            it('it should return created pando object', async () => {
                pando = await Pando.create({ ethereum: { account, gateway: gateway.fake } })

                pando.should.exist
            })

            it("should set pando's provider", () => {
                pando.provider.connection._url.should.equal('ws://192.168.0.1:8546')
            })

            it("should set pando's account", () => {
                pando.account.should.equal(account)
            })

            it("should initialize pando's contracts", () => {
                pando.contracts.Pando.should.exist
                pando.contracts.PandoAPI.should.exist
                pando.contracts.PandoLineage.should.exist
                pando.contracts.PandoGenesis.should.exist

                pando.contracts.Pando.web3.currentProvider.provider.connection._url.should.equal('ws://192.168.0.1:8546')
            })

        })

        describe('ethereum option is passed as provider', () => {
            it('it should return created pando object', async () => {
                const provider = new Web3.providers.HttpProvider('http://localhost:8546')
                pando = await Pando.create({ ethereum: { account, provider } })

                pando.should.exist
            })
        })

        describe('no ethereum option is passed except for account', () => {
            it('it should return created pando object', async () => {
                pando = await Pando.create({ ethereum: { account } })
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
