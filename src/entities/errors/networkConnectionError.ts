export class NetworkConnectionError extends Error {
    constructor(m: string) {
        super(m);

        Object.setPrototypeOf(this, NetworkConnectionError.prototype);
    }    
}