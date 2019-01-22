export declare type Handler = (request: any) => any;
export declare type Sequence = number;
export interface REQUEST_MESSAGE {
    readonly name: string;
    readonly from: string;
    readonly sequence: number;
    data: any;
}
export interface RESPONSE_MESSAGE {
    readonly sequence: number;
    data: any;
}
export interface RequestOptions {
    timeout?: number;
}
export interface MessengerOptions {
    id: string;
    brokerURI?: string;
    request?: RequestOptions;
    response?: boolean;
}
import { Requester } from './Messengers/Requester';
import { Responder } from './Messengers/Responder';
export declare class Messenger {
    serverId: string;
    requests?: {
        [name: string]: Function;
    };
    responses?: Set<string>;
    requester?: Requester;
    responder?: Responder;
    private dealerSocket;
    private pubSocket;
    private subSocket;
    private options;
    constructor(options: MessengerOptions);
    /**
     * sets and initializes available public functions based on messenger options passed in.
     * @param options
     */
    private initializeMessengers;
    close(): void;
    /**
     * @param name - unique name of request which will be used
     * @param to - id of server you are sending request to.
     * @returns Function - request function that sends out the request.
     * if left out, by default you can pass in an object when calling request and send that.
     * whatever it returns gets sent.
     */
    createRequest(name: string, to: string): Function;
    removeRequest(name: any): void;
    /**
     * If options.response was passed into constructor, you can use this function to create
     * an onRequest handler, with a hook that processes the request data and whatever
     * the hook returns gets sent back as the response data.
     * @param name - unique name of request which will be used
     * @param handler - handler to process data, whatever it returns gets sent back to request asynchronously
     */
    createResponse(name: string, handler: Handler): void;
    removeResponse(name: any): void;
    private _createRequest;
    private _removeRequest;
    private _createResponse;
    private _removeResponse;
}
