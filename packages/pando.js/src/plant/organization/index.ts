import Pando from '../..'
import Plant from '..'
import OrganismFactory from './organism/factory'
import Aragon from '@aragon/wrapper'

const APP_IDS = {
  'acl': '0xe3262375f45a6e2026b7e7b18c2b807434f2508fe1a2a3dfb493c7df8f4aad6a',
  'colony': '0x7b1ecd00360e711e0e2f5e06cfaa343df02df7bce0566ae1889b36a81c7ac7c7',
  'scheme': '0x7dcc2953010d38f70485d098b74f6f8dc58f18ebcd350267fa5f62e7cbc13cfe'
}

export default class Organization {
  public plant:   Plant
  public address: string
  public kernel:  any
  public acl:     any
  public colony:  any
  public scheme:  any

  public organisms: OrganismFactory


  constructor(plant: Plant, address: string, kernel: any, acl: any, colony: any, scheme:any) {
    this.plant   = plant
    this.address = address
    this.kernel  = kernel
    this.acl     = acl
    this.colony  = colony
    this.scheme  = scheme
    this.organisms = new OrganismFactory(this)
  }
}
