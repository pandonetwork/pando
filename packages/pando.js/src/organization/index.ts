import Pando from '..'


export default class Organization {

    public kernel: string
    public acl:    string


    constructor(kernel: string, acl: string) {
        this.kernel = kernel
        this.acl = acl
    }


}
