import { ExtendableError } from "ts-error";


export default class PandoError extends ExtendableError {

    public static message(code: string, ...args): string {
        switch (code) {
            case 'E_REPOSITORY_NOT_FOUND':
                return `No repository found at ${args[0]}`
            case 'E_FIBER_NOT_FOUND':
                return `Fiber ${args[0]} not found`
            case 'E_NO_INDEX_ENTRY_FOUND':
                return `No file found at path ${args[0]}`
            default:
                return 'Unknown error'
        }
    }

    public args

    constructor(code: string, ...args) {
        super(code)
        this.args = args
    }
}
