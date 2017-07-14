"use strict";
exports.__esModule = true;
var AwsEvent = (function () {
    function AwsEvent(type, payload) {
        if (!type) {
            throw new Error('AwsEvent constructor called with NULL type');
        }
        this.type = type;
        this.payload = payload;
    }
    return AwsEvent;
}());
exports.AwsEvent = AwsEvent;
