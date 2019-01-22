import { RequestOptions } from '../Messenger';
export declare class Requester {
    private dealerSocket;
    private onResponseHandlers;
    private awaitingResponseTimeouts;
    private timeout;
    private sequence;
    constructor(dealerSocket: any, options: RequestOptions);
    make(name: any, to: any): (data: any) => Promise<{}>;
    /**
     * @param data - user data that's meant to be sent and processed
     * @param name - name of the request
     * @param to - id of the server being sent to
     * @param onResponse - function called asynchronously when received response
     */
    private sendRequest;
    private registerResponseHandler;
    private addTimeout;
    private removeTimeout;
}
