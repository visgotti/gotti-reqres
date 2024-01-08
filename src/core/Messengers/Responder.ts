import { REQUEST_MESSAGE, RESPONSE_MESSAGE, Handler } from '../Messenger';


export class Responder {
    private dealerSocket: any;
    private onRequestHandlers: Map<string, Handler>;

    constructor(dealerSocket) {
        this.dealerSocket = dealerSocket;
        this.onRequestHandlers = new Map();
        this.registerOnRequestHandlers();
    }

    /**
     * Used when adding a handler for incoming requests.
     * @param name - name of the request
     * @param hook - function used to process and return data
     */
    public addOnRequestHandler(name, hook: Handler) {
        this.onRequestHandlers.set(name, hook);
    }

    public removeOnRequestHandler(name) {
        if(this.onRequestHandlers.has(name)) {
            this.onRequestHandlers.delete(name);
            return true;
        }
        return false;
    }

    /**
     * @param response - response message to encode and send
     * @param toServerId - id of the server waiting for response
     */
    private sendResponse(response: Array<any>, toServerId) {
        const encoded = JSON.stringify(response);
        this.dealerSocket.send([ toServerId, '', encoded]);
    }

    private async registerOnRequestHandlers() {
        if(!('receive' in this.dealerSocket)) {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    await this.registerOnRequestHandlers();
                    return resolve(true);
                }, 50);
            })
        }    
        this.dealerSocket.receive().then((args)=> {
            if (args[1]) {
                const request = JSON.parse(args[1]) as REQUEST_MESSAGE;
                const response = [request.sequence];
                const onRequestHandler = this.onRequestHandlers.get(request.name);
                if(onRequestHandler) {
                    response.push(onRequestHandler(request.data));
                }
                this.sendResponse(response, request.from);
            }
            this.registerOnRequestHandlers();
        });
    }
}