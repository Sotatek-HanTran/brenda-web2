"use strict";
exports.__esModule = true;
var CloudFront = require("../clients/cloudfront");
var client = new CloudFront({
    signatureVersion: 'v4'
});
var params = {
    Marker: 'foo'
};
client.listDistributions(params, function (err, data) {
});
var signer = new CloudFront.Signer('id', 'key');
var params1 = {
    expires: 0,
    url: 'localhost'
};
var params2 = {
    policy: 'policy'
};
var cookie1 = signer.getSignedCookie(params1);
console.log(cookie1['CloudFront-Expires']);
var cookie2 = signer.getSignedCookie(params2);
console.log(cookie2['CloudFront-Policy']);
signer.getSignedCookie(params1, function (err, cookie) {
    console.log(cookie['CloudFront-Expires']);
});
signer.getSignedCookie(params2, function (err, cookie) {
    console.log(cookie['CloudFront-Policy']);
});
var url1 = signer.getSignedUrl(params1);
var url2 = signer.getSignedUrl(params2);
signer.getSignedUrl(params1, function (err, url) {
});
signer.getSignedUrl(params2, function (err, url) {
});
