import Pando from '../../..'
import Organism from '.'
import Organization from '..'


export default class OrganismFactory {
  public organization: Organization

  constructor(organization: Organization) {
    this.organization = organization
  }

    // public async deploy(): Promise<Organism> {
    //     return new Organism('0x00')
    // }
}
