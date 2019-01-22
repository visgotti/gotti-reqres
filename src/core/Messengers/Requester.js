"use strict";
var Requester = (function () {
    function Requester(dealerSocket, options) {
        this.timeout = options.timeout || 5000;
        this.dealerSocket = dealerSocket;
        this.onResponseHandlers = new Map();
        this.awaitingResponseTimeouts = new Map();
        this.registerResponseHandler();
        this.sequence = 0;
    }
    Requester.prototype.make = function (name, to) {
        var _this = this;
        return (function (data) {
            return new Promise(function (resolve, reject) {
                _this.sendRequest(data, name, to, function (err, receivedData) {
                    if (err) {
                        reject(err);
                    }
                    resolve(receivedData);
                });
            });
        });
    };
    /**
     * @param data - user data that's meant to be sent and processed
     * @param name - name of the request
     * @param to - id of the server being sent to
     * @param onResponse - function called asynchronously when received response
     */
    Requester.prototype.sendRequest = function (data, name, to, onResponse) {
        var request = {
            name: name,
            from: this.dealerSocket.identity,
            sequence: this.sequence,
            data: data,
        };
        var encoded = JSON.stringify(request);
        this.dealerSocket.send([to, '', encoded]);
        this.onResponseHandlers.set(this.sequence, onResponse);
        // add a timeout to prevent hanging requests.
        this.addTimeout(this.sequence);
        this.sequence += 1;
    };
    Requester.prototype.registerResponseHandler = function () {
        var _this = this;
        this.dealerSocket.on('message', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (args[1]) {
                var response = JSON.parse(args[1]);
                var callback = _this.onResponseHandlers.get(response[0]);
                if (callback) {
                    _this.onResponseHandlers.delete(response[0]);
                    // cancel the timeout since we got the response
                    _this.removeTimeout(response.sequence);
                    return callback(null, response[1]);
                }
            }
        });
    };
    Requester.prototype.addTimeout = function (sequence) {
        var _this = this;
        this.awaitingResponseTimeouts.set(sequence, setTimeout(function () {
            var callback = _this.onResponseHandlers.get(sequence);
            _this.onResponseHandlers.delete(sequence);
            _this.awaitingResponseTimeouts.delete(sequence);
            return callback("Request timed out after " + _this.timeout + "ms", null);
        }, this.timeout));
    };
    Requester.prototype.removeTimeout = function (sequence) {
        var timeout = this.awaitingResponseTimeouts.get(sequence);
        clearTimeout(timeout);
        this.awaitingResponseTimeouts.delete(sequence);
    };
    return Requester;
}());
exports.Requester = Requester;
