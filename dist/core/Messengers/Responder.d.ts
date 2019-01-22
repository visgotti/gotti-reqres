import { Handler } from '../Messenger';
export declare class Responder {
    private dealerSocket;
    private onRequestHandlers;
    constructor(dealerSocket: any);
    /**
     * Used when adding a handler for incoming requests.
     * @param name - name of the request
     * @param hook - function used to process and return data
     */
    addOnRequestHandler(name: any, hook: Handler): void;
    removeOnRequestHandler(name: any): boolean;
    /**
     * @param response - response message to encode and send
     * @param toServerId - id of the server waiting for response
     */
    private sendResponse;
    private registerOnRequestHandlers;
}
