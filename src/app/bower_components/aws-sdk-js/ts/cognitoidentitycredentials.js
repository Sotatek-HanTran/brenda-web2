"use strict";
exports.__esModule = true;
var cognito_identity_credentials_1 = require("../lib/credentials/cognito_identity_credentials");
var creds1 = new cognito_identity_credentials_1.CognitoIdentityCredentials();
var creds2 = new cognito_identity_credentials_1.CognitoIdentityCredentials({
    IdentityPoolId: 'fake'
});
var creds3 = new cognito_identity_credentials_1.CognitoIdentityCredentials({
    IdentityId: 'id'
});
var creds4 = new cognito_identity_credentials_1.CognitoIdentityCredentials({
    IdentityId: 'id',
    RoleArn: 'arn'
});
var credOptions = {
    IdentityId: 'id',
    Logins: {
        'graph.facebook.com': 'FBTOKEN',
        'www.amazon.com': 'AMAZONTOKEN',
        'accounts.google.com': 'GOOGLETOKEN',
        'api.twitter.com': 'TWITTERTOKEN',
        'www.digits.com': 'DIGITSTOKEN'
    },
    LoginId: 'example@gmail.com'
};
var creds5 = new cognito_identity_credentials_1.CognitoIdentityCredentials(credOptions);
// test client config
var creds6 = new cognito_identity_credentials_1.CognitoIdentityCredentials(credOptions, {
    httpOptions: {
        timeout: 50
    },
    region: 'us-west-2'
});
var config = {
    httpOptions: {
        timeout: 50
    },
    region: 'us-west-2'
};
var creds7 = new cognito_identity_credentials_1.CognitoIdentityCredentials(credOptions, config);
