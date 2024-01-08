import { REQUEST_MESSAGE, RequestOptions, Sequence } from '../Messenger';
import Timeout = NodeJS.Timeout;

function getMethods(obj)
{
    var res = [];
    for(var m in obj) {
        if(typeof obj[m] == "function") {
            res.push(m)
        }
    }
    return res;
}
export class Requester {
    private dealerSocket: any;
    private onResponseHandlers: Map<Sequence, Function>;
    private awaitingResponseTimeouts: Map<Sequence, Timeout>;
    private timeout: number;
    private sequence: Sequence;

    constructor(dealerSocket, options: RequestOptions) {
        this.timeout = options.timeout || 5000;
        this.dealerSocket = dealerSocket;
        this.onResponseHandlers = new Map();
        this.awaitingResponseTimeouts = new Map();
        this.registerResponseHandler();
        this.sequence = 0;
    }

    public make(name, to) {
        return ((data: any) => {
            return new Promise((resolve, reject) => {
                this.sendRequest(data, name, to, (err, receivedData) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(receivedData);
                });
            });
        });
    }

    /**
     * @param data - user data that's meant to be sent and processed
     * @param name - name of the request
     * @param to - id of the server being sent to
     * @param onResponse - function called asynchronously when received response
     */
    private sendRequest(data, name, to, onResponse) {
        const request: REQUEST_MESSAGE = {
            name,
            from: this.dealerSocket.routingId,
            sequence: this.sequence,
            data,
        };

        const encoded = JSON.stringify(request);

        this.dealerSocket.send([ to, '', encoded]);
        this.onResponseHandlers.set(this.sequence, onResponse);

        // add a timeout to prevent hanging requests.
        this.addTimeout(this.sequence);

        this.sequence += 1;
    }

    private async registerResponseHandler() {  
        if(!('receive' in this.dealerSocket)) {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    await this.registerResponseHandler();
                    return resolve(true);
                }, 50);
            })
        }    

        this.dealerSocket.receive().then((args)=> {           
            if (args[1]) {
                const response = JSON.parse(args[1]);
                const sequence = response[0];
                const callback = this.onResponseHandlers.get(response[0]);
                if(callback) {
                    this.onResponseHandlers.delete(sequence);

                    // cancel the timeout since we got the response
                    this.removeTimeout(sequence);

                    return callback(null, response[1]);
                }
            }
        });


    }

    private addTimeout(sequence) {
        this.awaitingResponseTimeouts.set(sequence, setTimeout(() => {
            const callback = this.onResponseHandlers.get(sequence);
            this.onResponseHandlers.delete(sequence);
            this.awaitingResponseTimeouts.delete(sequence);
            return callback(`Request timed out after ${this.timeout}ms`, null);
        }, this.timeout));
    }

    private removeTimeout(sequence) {
        const timeout = this.awaitingResponseTimeouts.get(sequence);
        clearTimeout(timeout);
        this.awaitingResponseTimeouts.delete(sequence);
    }
}