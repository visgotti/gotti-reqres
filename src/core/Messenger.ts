import * as zmq from 'zeromq';

/*
    Handler is a function that is used to process data
    received from the request and whatever it returns is sent back
    as data
*/
export type Handler = (request: any) => any;

export type Sequence = number;

export interface REQUEST_MESSAGE  {
    readonly name: string,
    readonly from: string,
    readonly sequence: number,
    data: any,
}

export interface RESPONSE_MESSAGE  {
    readonly sequence: number,
    data: any,
}

export interface RequestOptions {
    timeout?: number,
}


export interface MessengerOptions {
    id: string,
    brokerURI?: string,
    request?: RequestOptions,
    response?: boolean,
}

import { Requester } from './Messengers/Requester';
import { Responder } from './Messengers/Responder';

export class Messenger {
    public serverId: string;

    public requests?: { [name: string]: Function };
    public responses?: Set<string>;

    public requester?: Requester;
    public responder?: Responder;

    private dealerSocket: any;

    private pubSocket: any;
    private subSocket: any;

    private options: MessengerOptions;

    constructor(options: MessengerOptions) {
        this.serverId = options.id;
        this.dealerSocket = null;
        this.pubSocket = null;

        this.requests = null;
        this.requester = null;

        this.responses = null;
        this.responder = null;

        this.options = options;
        this.initializeMessengers(options);
    }

    /**
     * sets and initializes available public functions based on messenger options passed in.
     * @param options
     */
    private initializeMessengers(options: MessengerOptions) {
        if(options.brokerURI) {
            console.log('server id was', this.serverId)
            this.dealerSocket = new zmq.Dealer({ routingId: this.serverId });
            this.dealerSocket.connect(options.brokerURI);
        }

        if(options.request) {
            if(!this.dealerSocket) throw `Please provide a broker URI in your messengerOptions for request server: ${this.serverId}`;
            this.requests = {};
            this.requester = new Requester(this.dealerSocket, options.request);
            this.createRequest = this._createRequest;
            this.removeRequest = this._removeRequest;
        }

        if(options.response) {
            if(!this.dealerSocket) throw `Please provide a broker URI in your messengerOptions for response server: ${this.serverId}`;
            this.responses = new Set();
            this.responder = new Responder(this.dealerSocket);
            this.createResponse = this._createResponse;
            this.removeResponse = this._removeResponse;
        }

    }

    public close() {
        if(this.dealerSocket) {
            this.dealerSocket.close();
            this.dealerSocket = null;
        }
    }

    /**
     * @param name - unique name of request which will be used
     * @param to - id of server you are sending request to.
     * @returns Function - request function that sends out the request.
     * if left out, by default you can pass in an object when calling request and send that.
     * whatever it returns gets sent.
     */
    public createRequest(name: string, to: string) : Function { throw new Error('Server is not configured to use requests.') }
    public removeRequest(name) { throw new Error('Server is not configured to use requests.')}

    /**
     * If options.response was passed into constructor, you can use this function to create
     * an onRequest handler, with a hook that processes the request data and whatever
     * the hook returns gets sent back as the response data.
     * @param name - unique name of request which will be used
     * @param handler - handler to process data, whatever it returns gets sent back to request asynchronously
     */
    public createResponse(name: string, handler: Handler) { throw new Error('Server is not configured use responses.') }
    public removeResponse(name) { throw new Error('Server is not configured to use responses.')}

    private _createRequest(name: string, to: string) : Function {
        if(this.requests[name]) {
            throw new Error(`Duplicate request name: ${name}`);
        }
        const request = this.requester.make(name, to);
        this.requests[name] = request;
        return request;
    }

    private _removeRequest(name: string) {
        if(this.requests[name]) {
            delete this.requests[name]
        } else {
            throw new Error(`Request does not exist for name: ${name}`);
        }
    }

    private _createResponse(name: string, handler: Handler) {
        if(this.responses.has(name)) {
            throw new Error(`Duplicate response name: ${name}`);
        }
        this.responses.add(name);
        this.responder.addOnRequestHandler(name, handler);
    }

    private _removeResponse(name: string) {
        if(this.responses.has(name)) {
            this.responses.delete(name);
            this.responder.removeOnRequestHandler(name);
        } else {
            throw new Error(`Response does not exist for name: ${name}`);
        }
    }
}