"use strict";
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var Broker_1 = require('../../src/core/Broker');
var Messenger_1 = require('../../src/core/Messenger');
describe('Request to response server communication', function () {
    var config;
    var broker;
    var requestServer;
    var responseServer;
    before('Initialize two servers, one as a requester, one as a responder.', function (done) {
        config = fs.readFileSync(path.resolve('test', 'messenger.config.json'));
        config = JSON.parse(config);
        var brokerURI = config.broker.URI;
        broker = new Broker_1.Broker(brokerURI, "TEST_BROKER");
        for (var i = 0; i < config.servers.length; i++) {
            var serverData = config.servers[i];
            if (!("request" in serverData.messengerOptions) && !("response" in serverData.messengerOptions))
                continue;
            var server = new Messenger_1.Messenger(serverData.messengerOptions);
            if (serverData.messengerOptions["request"]) {
                requestServer = server;
            }
            else if (serverData.messengerOptions["response"]) {
                responseServer = server;
            }
        }
        setTimeout(function () {
            done();
        }, 500);
    });
    describe('Sending a request', function () {
        it('Sends data returned from the hook in createRequest and retrives data returned from hook in createResponse.', function (done) {
            requestServer.createRequest("foo", responseServer.serverId);
            responseServer.createResponse("foo", function (data) {
                assert.strictEqual(data, 12);
                return data + 10;
            });
            requestServer.requests.foo(12).then(function (response) {
                assert.strictEqual(response, 22);
                done();
            });
        });
    });
});
