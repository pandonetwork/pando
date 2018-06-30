export default class Specimen {
  public genesis?: string
  public address: string

  public constructor(data: any, opts?: any) {
    this.address = data.address
  }
}
