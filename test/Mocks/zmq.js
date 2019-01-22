"use strict";
var DealerSocket = (function () {
    function DealerSocket() {
    }
    ;
    DealerSocket.prototype.on = function (string, cb) { cb(); };
    return DealerSocket;
}());
exports.DealerSocket = DealerSocket;
var PubSocket = (function () {
    function PubSocket() {
    }
    ;
    PubSocket.prototype.send = function (any) { return any; };
    return PubSocket;
}());
exports.PubSocket = PubSocket;
