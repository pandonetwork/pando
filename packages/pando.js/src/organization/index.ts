import Pando from '..'


export default class Organization {
  public pando:  Pando
  public kernel: any
  public acl:    any

  constructor(pando: Pando, kernel: any, acl: any) {
    this.pando  = pando
    this.kernel = kernel
    this.acl    = acl
  }
}
