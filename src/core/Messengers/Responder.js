"use strict";
var Responder = (function () {
    function Responder(dealerSocket) {
        this.dealerSocket = dealerSocket;
        this.onRequestHandlers = new Map();
        this.registerOnRequestHandlers();
    }
    /**
     * Used when adding a handler for incoming requests.
     * @param name - name of the request
     * @param hook - function used to process and return data
     */
    Responder.prototype.addOnRequestHandler = function (name, hook) {
        this.onRequestHandlers.set(name, hook);
    };
    Responder.prototype.removeOnRequestHandler = function (name) {
        if (this.onRequestHandlers.has(name)) {
            this.onRequestHandlers.delete(name);
            return true;
        }
        return false;
    };
    /**
     * @param response - response message to encode and send
     * @param toServerId - id of the server waiting for response
     */
    Responder.prototype.sendResponse = function (response, toServerId) {
        var encoded = JSON.stringify(response);
        this.dealerSocket.send([toServerId, '', encoded]);
    };
    Responder.prototype.registerOnRequestHandlers = function () {
        var _this = this;
        this.dealerSocket.on('message', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (args[1]) {
                var request = JSON.parse(args[1]);
                var response = [request.sequence];
                var onRequestHandler = _this.onRequestHandlers.get(request.name);
                if (onRequestHandler) {
                    response.push(onRequestHandler(request.data));
                }
                _this.sendResponse(response, request.from);
            }
        });
    };
    return Responder;
}());
exports.Responder = Responder;
