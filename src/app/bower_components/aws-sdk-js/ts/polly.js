"use strict";
exports.__esModule = true;
var Polly = require("../clients/polly");
var client = new Polly({
    signatureVersion: 'v4',
    region: 'us-east-1'
});
var params = {
    Text: 'foo',
    OutputFormat: 'mp3',
    VoiceId: 'Kimberly'
};
client.synthesizeSpeech(params, function (err, data) {
    if (err) {
        console.log(err.code);
    }
    else if (data) {
        if (data.AudioStream instanceof Buffer) {
            console.log(data.AudioStream.toString());
        }
    }
});
var presigner = new Polly.Presigner({
    service: client
});
var params2 = params;
var url = presigner.getSynthesizeSpeechUrl(params2);
console.log(url.length);
presigner.getSynthesizeSpeechUrl(params, function (err, url) { });
presigner.getSynthesizeSpeechUrl(params, 1000, function (err, url) { });
var url2 = presigner.getSynthesizeSpeechUrl(params, 100);
