"use strict";
var zmq_1 = require('../Mocks/zmq');
var Responder_1 = require('../../src/core/Messengers/Responder');
var assert = require('assert');
describe('Responder', function () {
    var mockResponder;
    var dealerSocket;
    beforeEach('Initialize Responder', function (done) {
        dealerSocket = new zmq_1.DealerSocket();
        mockResponder = new Responder_1.Responder(dealerSocket);
        done();
    });
    it('responder.addOnRequestHandler adds hook', function (done) {
        mockResponder.addOnRequestHandler("foo", function (bar) { return bar; });
        assert.deepStrictEqual(mockResponder.removeOnRequestHandler("foo"), true);
        done();
    });
});
