"use strict";
(function (SERIALIZER_TYPES) {
    SERIALIZER_TYPES[SERIALIZER_TYPES["JSON"] = 'JSON'] = "JSON";
    SERIALIZER_TYPES[SERIALIZER_TYPES["MSGPACK"] = 'MSGPACK'] = "MSGPACK";
    SERIALIZER_TYPES[SERIALIZER_TYPES["NONE"] = 'NONE'] = "NONE";
})(exports.SERIALIZER_TYPES || (exports.SERIALIZER_TYPES = {}));
var SERIALIZER_TYPES = exports.SERIALIZER_TYPES;
exports.defaults = {
    encode: JSON.stringify,
    decode: JSON.parse,
};
function get(type) {
    switch (type) {
        case SERIALIZER_TYPES.JSON: {
            return {
                encode: JSON.stringify,
                decode: JSON.parse,
            };
        }
        case SERIALIZER_TYPES.MSGPACK: {
            return {
                encode: require('notepack.io').encode,
                decode: require('notepack.io').decode,
            };
        }
        case SERIALIZER_TYPES.NONE: {
            return {
                encode: null,
                decode: null,
            };
        }
    }
}
exports.get = get;
