"use strict";
var zmq = require('zeromq');
/*
    Router Socket which routes messages
    from a channel to an back
 */
var Broker = (function () {
    /**
     * @param {string} routerURI - URI string for the brokers router
     * @param {int} id - Unique identifier of the broker.
     */
    function Broker(routerURI, id) {
        this.routerSocket = {};
        this.routerSocket = zmq.socket('router');
        this.routerSocket.identity = "broker " + id + " ";
        this.routerSocket.bindSync(routerURI);
        this.registerRouterMessages();
    }
    Broker.prototype.registerRouterMessages = function () {
        var _this = this;
        // relays message from based on args[1]
        this.routerSocket.on('message', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _this.routerSocket.send([args[1], '', args[3]]);
        });
    };
    Broker.prototype.close = function () {
        this.routerSocket.close();
    };
    return Broker;
}());
exports.Broker = Broker;
;
