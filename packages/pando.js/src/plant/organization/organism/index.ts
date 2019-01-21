import Organization from '..'
import Pando from '../../..'

export default class Organism {
  public address: string
  public organization: Organization

  public public

  constructor(organization: Organization, address: string) {
    this.address = address
    this.organization = organization
  }

  public async head(): Promise<any> {
    const contract = await this.organization.plant.pando.contracts.Organism.at(this.address)
    const head = await contract.getHead()

    return head
  }
}
