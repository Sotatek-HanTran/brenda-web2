"use strict";
exports.__esModule = true;
var web_identity_credentials_1 = require("../lib/credentials/web_identity_credentials");
var creds1 = new web_identity_credentials_1.WebIdentityCredentials();
var creds2 = new web_identity_credentials_1.WebIdentityCredentials({
    WebIdentityToken: 'token',
    RoleArn: 'arn',
    RoleSessionName: 'web-identity'
});
var creds3 = new web_identity_credentials_1.WebIdentityCredentials({
    WebIdentityToken: 'token',
    RoleArn: 'arn',
    DurationSeconds: 100,
    RoleSessionName: 'test'
});
var config = {
    maxRetries: 5,
    httpOptions: {
        timeout: 50
    }
};
var options = {
    DurationSeconds: 10,
    WebIdentityToken: 'token',
    RoleArn: 'arn',
    RoleSessionName: 'web-identity'
};
var creds4 = new web_identity_credentials_1.WebIdentityCredentials(options);
var creds5 = new web_identity_credentials_1.WebIdentityCredentials(options, config);
