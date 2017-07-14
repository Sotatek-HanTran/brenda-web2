"use strict";
exports.__esModule = true;
var DynamoDB = require("../clients/dynamodb");
var client = new DynamoDB.DocumentClient();
var params = {
    TableName: 'MyTable',
    Key: {
        'my-key': 'value'
    }
};
client.get(params, function (err, data) {
});
var dynamodb = new DynamoDB({
    apiVersion: "2012-08-10"
});
var getParams = {
    TableName: 'MyTable',
    Key: {
        'my-key': {
            S: 'value'
        }
    }
};
dynamodb.getItem(getParams, function (err, data) {
});
// Still works with Types namespace as well
var getParams2 = {
    TableName: 'MyTable',
    Key: {
        'my-key': {
            S: 'value'
        }
    }
};
dynamodb.getItem(getParams2, function (err, data) {
});
