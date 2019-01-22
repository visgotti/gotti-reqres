import * as assert from 'assert';
import * as mocha from 'mocha';
import * as fs from 'fs';
import * as path from 'path';

import { Broker } from '../../src/core/Broker';
import { Messenger } from '../../src/core/Messenger';

describe('Request to response server communication', function() {
    let config: any;
    let broker;
    let requestServer;
    let responseServer;

    before('Initialize two servers, one as a requester, one as a responder.', (done) => {
        config = fs.readFileSync(path.resolve('test', 'messenger.config.json'));
        config = JSON.parse(config);
        let brokerURI = config.broker.URI;
        broker = new Broker(brokerURI, "TEST_BROKER");

        for(let i = 0; i < config.servers.length; i++) {
            const serverData = config.servers[i];
            if (!("request" in serverData.messengerOptions) && !("response" in serverData.messengerOptions)) continue;
            let server = new Messenger(serverData.messengerOptions);

            if (serverData.messengerOptions["request"]) {
                requestServer = server;
            } else if (serverData.messengerOptions["response"]) {
                responseServer = server;
            }
        }
        setTimeout(() => {
            done();
        }, 500)
    });

    describe('Sending a request', function() {
        it('Sends data returned from the hook in createRequest and retrives data returned from hook in createResponse.', function(done) {
            requestServer.createRequest("foo", responseServer.serverId)

            responseServer.createResponse("foo", function(data) {
                assert.strictEqual(data, 12);
                return data + 10;
            });

            requestServer.requests.foo(12).then(response => {
                assert.strictEqual(response, 22);
                done();
            });
        });
    });
});