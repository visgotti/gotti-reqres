import * as zmq from 'zeromq';

/*
    Router Socket which routes messages
    from a channel to an back
 */
export class Broker {
    private routerSocket: any = {};
    /**
     * @param {string} routerURI - URI string for the brokers router
     * @param {int} id - Unique identifier of the broker.
     */
    constructor() {
      
    }
    public async init(routerURI, id) {
        console.log('init', id);
        this.routerSocket = new zmq.Router({ routingId: id });
        console.log('type', this.routerSocket.routingId);
        console.log('bind', routerURI);
        await this.routerSocket.bind(routerURI);
        console.log('reg')
        this.registerRouterMessages();
    }

    private async registerRouterMessages() {
        for await (const args of this.routerSocket) {
            console.log('reg send', args)
            this.routerSocket.send([args[1], '', args[3]]);
        }
    }

    public close() {
        this.routerSocket.close();
    }
};
