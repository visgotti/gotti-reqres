"use strict";
var zmq = require('zeromq');
var Requester_1 = require('./Messengers/Requester');
var Responder_1 = require('./Messengers/Responder');
var Messenger = (function () {
    function Messenger(options) {
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
    Messenger.prototype.initializeMessengers = function (options) {
        if (options.brokerURI) {
            this.dealerSocket = zmq.socket('dealer');
            this.dealerSocket.identity = this.serverId;
            this.dealerSocket.connect(options.brokerURI);
        }
        if (options.request) {
            if (!this.dealerSocket)
                throw "Please provide a broker URI in your messengerOptions for request server: " + this.serverId;
            this.requests = {};
            this.requester = new Requester_1.Requester(this.dealerSocket, options.request);
            this.createRequest = this._createRequest;
            this.removeRequest = this._removeRequest;
        }
        if (options.response) {
            if (!this.dealerSocket)
                throw "Please provide a broker URI in your messengerOptions for response server: " + this.serverId;
            this.responses = new Set();
            this.responder = new Responder_1.Responder(this.dealerSocket);
            this.createResponse = this._createResponse;
            this.removeResponse = this._removeResponse;
        }
    };
    Messenger.prototype.close = function () {
        if (this.dealerSocket) {
            this.dealerSocket.close();
            this.dealerSocket = null;
        }
    };
    /**
     * @param name - unique name of request which will be used
     * @param to - id of server you are sending request to.
     * @returns Function - request function that sends out the request.
     * if left out, by default you can pass in an object when calling request and send that.
     * whatever it returns gets sent.
     */
    Messenger.prototype.createRequest = function (name, to) { throw new Error('Server is not configured to use requests.'); };
    Messenger.prototype.removeRequest = function (name) { throw new Error('Server is not configured to use requests.'); };
    /**
     * If options.response was passed into constructor, you can use this function to create
     * an onRequest handler, with a hook that processes the request data and whatever
     * the hook returns gets sent back as the response data.
     * @param name - unique name of request which will be used
     * @param handler - handler to process data, whatever it returns gets sent back to request asynchronously
     */
    Messenger.prototype.createResponse = function (name, handler) { throw new Error('Server is not configured use responses.'); };
    Messenger.prototype.removeResponse = function (name) { throw new Error('Server is not configured to use responses.'); };
    Messenger.prototype._createRequest = function (name, to) {
        if (this.requests[name]) {
            throw new Error("Duplicate request name: " + name);
        }
        var request = this.requester.make(name, to);
        this.requests[name] = request;
        return request;
    };
    Messenger.prototype._removeRequest = function (name) {
        if (this.requests[name]) {
            delete this.requests[name];
        }
        else {
            throw new Error("Request does not exist for name: " + name);
        }
    };
    Messenger.prototype._createResponse = function (name, handler) {
        if (this.responses.has(name)) {
            throw new Error("Duplicate response name: " + name);
        }
        this.responses.add(name);
        this.responder.addOnRequestHandler(name, handler);
    };
    Messenger.prototype._removeResponse = function (name) {
        if (this.responses.has(name)) {
            this.responses.delete(name);
            this.responder.removeOnRequestHandler(name);
        }
        else {
            throw new Error("Response does not exist for name: " + name);
        }
    };
    return Messenger;
}());
exports.Messenger = Messenger;
