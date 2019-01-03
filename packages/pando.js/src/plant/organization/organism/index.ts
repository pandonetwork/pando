import Pando from '../../..'
import Organization from '..'


export default class Organism {

  public address: string
  public organization: Organization

  constructor(organization: Organization, address: string) {
    this.address = address
    this.organization = organization
  }


}
