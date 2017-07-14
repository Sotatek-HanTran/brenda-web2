"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
// Brenda-Web -- Frontend for Blender
//
// Brenda-Web is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
var core_1 = require("@angular/core");
var ajs_upgraded_providers_1 = require("../ajs-upgraded-providers");
var AwsService = (function () {
    function AwsService(logger, localStorageService, eventService) {
        this.logger = logger;
        this.localStorageService = localStorageService;
        this.eventService = eventService;
        this.startDate = new Date(new Date().getTime() - 6 * 60 * 60 * 1000);
        this.uriCache = {};
    }
    AwsService.prototype.deferredWrapper = function (obj, func, params) {
        return new Promise(function (resolve, reject) {
            func.call(obj, params, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    AwsService.prototype.setCredentials = function (keyId, secret) {
        AWS.config.update({ accessKeyId: keyId, secretAccessKey: secret });
    };
    AwsService.prototype.getKeyId = function () {
        if (AWS.config.credentials) {
            return AWS.config.credentials.accessKeyId;
        }
        else {
            return '';
        }
    };
    AwsService.prototype.getKeySecret = function () {
        if (AWS.config.credentials) {
            return AWS.config.credentials.secretAccessKey;
        }
        else {
            return '';
        }
    };
    AwsService.prototype.setRegion = function (region) {
        AWS.config.region = region;
        this.logger.info('Set region: ' + region);
    };
    AwsService.prototype.getRegion = function () {
        return AWS.config.region;
    };
    AwsService.prototype.testCredentials = function () {
        var _this = this;
        var ec2 = new AWS.EC2();
        return new Promise(function (resolve, reject) {
            ec2.describeKeyPairs({}, function (err, data) {
                if (err) {
                    reject(String(err));
                    _this.eventService.sendEvent('aws-login-error', String(err));
                }
                else {
                    resolve();
                    _this.eventService.sendEvent('aws-login-success');
                }
            });
        });
    };
    AwsService.prototype.getQueues = function () {
        var _this = this;
        var sqs = new AWS.SQS();
        sqs.listQueues({}, function (err, data) {
            if (err) {
                _this.eventService.sendEvent('aws-sqs-error', String(err));
            }
            else {
                _this.eventService.sendEvent('aws-sqs-success', data);
            }
        });
    };
    AwsService.prototype.sendToQueue = function (queueUrl, data) {
        var _this = this;
        this.localStorageService.set('awsQueue', queueUrl);
        var sqs = new AWS.SQS();
        var sendStatus = {
            total: data.length,
            success: 0,
            failed: 0,
            inFlight: 0,
            copy: function () {
                return {
                    total: this.total,
                    success: this.success,
                    failed: this.failed,
                    inFlight: this.inFlight
                };
            }
        };
        this.eventService.sendEvent('aws-sqs-send-update', sendStatus.copy());
        var entries = [];
        data.forEach(function (item, i) {
            entries.push({
                MessageBody: btoa(item),
                Id: String(i)
            });
            if ((entries.length === 10) || (i === (data.length - 1))) {
                sendStatus.inFlight += entries.length;
                _this.eventService.sendEvent('aws-sqs-send-update', sendStatus.copy());
                var params_1 = {
                    Entries: entries,
                    QueueUrl: queueUrl
                };
                sqs.sendMessageBatch(params_1, function (sqsErr, sqsData) {
                    if (sqsErr) {
                        sendStatus.failed += params_1.Entries.length;
                        sendStatus.inFlight -= params_1.Entries.length;
                    }
                    else {
                        sendStatus.success += sqsData.Successful.length;
                        sendStatus.failed += sqsData.Failed.length;
                        sendStatus.inFlight -= sqsData.Successful.length;
                        sendStatus.inFlight -= sqsData.Failed.length;
                    }
                    _this.eventService.sendEvent('aws-sqs-send-update', sendStatus.copy());
                });
                entries = [];
            }
        });
    };
    AwsService.prototype.getQueue = function () {
        return this.localStorageService.get('awsQueue');
    };
    AwsService.prototype.clearQueue = function (queueUrl) {
        var sqs = new AWS.SQS();
        return this.deferredWrapper(sqs, sqs.purgeQueue, { QueueUrl: queueUrl });
    };
    AwsService.prototype.getQueueSize = function (queueUrl) {
        var sqs = new AWS.SQS();
        var params = {
            QueueUrl: queueUrl,
            AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible']
        };
        return new Promise(function (resolve, reject) {
            sqs.getQueueAttributes(params, function (err, data) {
                if (err) {
                    reject(String(err));
                }
                else {
                    resolve(data.Attributes.ApproximateNumberOfMessages);
                }
            });
        });
    };
    AwsService.prototype.getKeyPairs = function (callback) {
        var _this = this;
        var ec2 = new AWS.EC2();
        ec2.describeKeyPairs({}, function (err, data) {
            if (err) {
                _this.logger.info(err);
                _this.eventService.sendEvent('aws-ec2-error', String(err));
            }
            else {
                return callback(data);
            }
        });
    };
    AwsService.prototype.getLaunchSpecification = function (ami, keyPair, securityGroup, userData, instanceType, snapshots) {
        var devs = [
            'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'
        ];
        var spec = {
            ImageId: ami,
            KeyName: keyPair,
            SecurityGroups: [securityGroup],
            UserData: btoa(userData),
            InstanceType: instanceType
        };
        if (snapshots) {
            spec['BlockDeviceMappings'] = [];
            snapshots.forEach(function (snapshot, i) {
                spec['BlockDeviceMappings'].push({
                    DeviceName: '/dev/sd' + devs[i],
                    Ebs: {
                        DeleteOnTermination: true,
                        SnapshotId: snapshot
                    }
                });
            });
        }
        return spec;
    };
    AwsService.prototype.setTags = function (instances, tags, callback) {
        var params = {
            Resources: instances,
            Tags: tags
        };
        var ec2 = new AWS.EC2();
        ec2.createTags(params, function (err, data) {
            if (err) {
                // Try the call again after a little bit
                this.logger.info('Setting tags failed once, retrying');
                setTimeout(function () {
                    ec2.createTags(params, callback);
                }, 5000);
            }
            else {
                return callback(err, data);
            }
        });
    };
    AwsService.prototype.requestSpot = function (ami, keyPair, securityGroup, userData, instanceType, snapshots, spotPrice, count, type, queueName, s3Destination, statusCallback) {
        var _this = this;
        var spec = this.getLaunchSpecification(ami, keyPair, securityGroup, userData, instanceType, snapshots);
        var params = {
            // DryRun: true,
            SpotPrice: String(spotPrice),
            InstanceCount: parseInt(count, 10),
            LaunchSpecification: spec,
            Type: type
        };
        var ec2 = new AWS.EC2();
        ec2.requestSpotInstances(params, function (err, data) {
            if (err) {
                _this.logger.info(err);
                statusCallback('danger', String(err));
            }
            else {
                _this.logger.info(data);
                var spotRequests = data.SpotInstanceRequests.map(function (item) {
                    return item.SpotInstanceRequestId;
                });
                _this.setTags(spotRequests, [{ Key: 'brenda-queue', Value: queueName }, {
                        Key: 'brenda-dest',
                        Value: s3Destination
                    }], function (setTagsErr) {
                    if (setTagsErr) {
                        statusCallback('warning', 'Spot instances requested but could not set tags (may affect dashboard)');
                    }
                    else {
                        statusCallback('success', 'Spot instances requested');
                    }
                });
            }
        });
    };
    AwsService.prototype.requestOndemand = function (ami, keyPair, securityGroup, userData, instanceType, snapshots, count, queueName, s3Destination, statusCallback) {
        var spec = this.getLaunchSpecification(ami, keyPair, securityGroup, userData, instanceType, snapshots);
        spec['MinCount'] = count;
        spec['MaxCount'] = count;
        spec['InstanceInitiatedShutdownBehavior'] = 'terminate';
        // spec.DryRun = true;
        var self = this;
        var ec2 = new AWS.EC2();
        ec2.runInstances(spec, function (err, data) {
            if (err) {
                this.logger.info(err);
                statusCallback('danger', String(err));
            }
            else {
                this.logger.info(data);
                var instanceIds = data.Instances.map(function (item) {
                    return item.InstanceId;
                });
                self.setTags(instanceIds, [{ Key: 'brenda-queue', Value: queueName }, {
                        Key: 'brenda-dest',
                        Value: s3Destination
                    }], function (setTagsErr) {
                    if (setTagsErr) {
                        statusCallback('warning', 'On demand instances requested but could not set tags (may affect dashboard)');
                    }
                    else {
                        statusCallback('success', 'On demand instances requested');
                    }
                });
            }
        });
    };
    AwsService.prototype.getSpotRequests = function () {
        var ec2 = new AWS.EC2();
        return this.deferredWrapper(ec2, ec2.describeSpotInstanceRequests, {
            Filters: [{
                    Name: 'tag-key',
                    Values: ['brenda-queue']
                }]
        });
    };
    AwsService.prototype.getInstanceDetails = function (instanceList) {
        var ec2 = new AWS.EC2();
        var params = {};
        if (instanceList) {
            params['InstanceIds'] = instanceList;
        }
        else {
            params['Filters'] = [{ Name: 'tag-key', Values: ['brenda-queue'] }];
        }
        return this.deferredWrapper(ec2, ec2.describeInstances, params);
    };
    AwsService.prototype.getSecurityGroups = function (groupName) {
        var ec2 = new AWS.EC2();
        return this.deferredWrapper(ec2, ec2.describeSecurityGroups, { GroupNames: [groupName] });
    };
    AwsService.prototype.createSecurityGroup = function () {
        var ec2 = new AWS.EC2();
        var sgParams = {
            GroupName: 'brenda-web',
            Description: 'Security group used by brenda-web.com'
        };
        var ingressParams = {
            IpPermissions: [{
                    FromPort: 22,
                    IpProtocol: 'tcp',
                    IpRanges: [{
                            CidrIp: '0.0.0.0/0'
                        }],
                    ToPort: 22
                }, {
                    FromPort: 80,
                    IpProtocol: 'tcp',
                    IpRanges: [{
                            CidrIp: '0.0.0.0/0'
                        }],
                    ToPort: 80
                }, {
                    FromPort: -1,
                    IpProtocol: 'icmp',
                    IpRanges: [{
                            CidrIp: '0.0.0.0/0'
                        }],
                    ToPort: -1
                }]
        };
        return new Promise(function (resolve, reject) {
            ec2.createSecurityGroup(sgParams, function (err, data) {
                if (err) {
                    reject(String(err));
                }
                else {
                    ingressParams['GroupId'] = data.GroupId;
                    ec2.authorizeSecurityGroupIngress(ingressParams, function (ec2Err) {
                        if (ec2Err) {
                            reject(String(ec2Err));
                        }
                        else {
                            resolve();
                        }
                    });
                }
            });
        });
    };
    AwsService.prototype.createQueue = function (queueName) {
        var params = {
            QueueName: queueName,
            Attributes: {
                VisibilityTimeout: '120'
            }
        };
        var sqs = new AWS.SQS();
        return this.deferredWrapper(sqs, sqs.createQueue, params);
    };
    AwsService.prototype.listObjects = function (bucket) {
        var s3 = new AWS.S3();
        return this.deferredWrapper(s3, s3.listObjects, { Bucket: bucket });
    };
    AwsService.prototype.getObjectUri = function (bucket, key) {
        var cacheKey = bucket + '-' + key;
        var cached = this.uriCache[cacheKey];
        // If cached and not going to expire within the next two minutes
        if (cached && (cached.expiration > new Date(new Date().valueOf() + 120 * 1000))) {
            return cached.url;
        }
        else {
            var s3 = new AWS.S3();
            var url = s3.getSignedUrl('getObject', { Bucket: bucket, Key: key, Expires: 3600 });
            this.uriCache[cacheKey] = { url: url, expiration: new Date(new Date().valueOf() + 3600 * 1000) };
            return url;
        }
    };
    AwsService.prototype.getAvailabilityZones = function () {
        var ec2 = new AWS.EC2();
        return new Promise(function (resolve, reject) {
            ec2.describeAvailabilityZones({}, function (err, data) {
                if (err) {
                    reject(String(err));
                }
                else {
                    resolve(data.AvailabilityZones.map(function (item) {
                        return item.ZoneName;
                    }));
                }
            });
        });
    };
    AwsService.prototype.getSpotPrices = function (nextToken) {
        var _this = this;
        var ec2 = new AWS.EC2();
        var params = {
            Filters: [{ Name: 'product-description', Values: ['Linux/UNIX'] }],
            StartTime: this.startDate
        };
        if (nextToken) {
            params['NextToken'] = nextToken;
        }
        ec2.describeSpotPriceHistory(params, function (err, data) {
            if (err) {
                _this.eventService.sendEvent('aws-spotprice-error', err);
            }
            else {
                _this.eventService.sendEvent('aws-spotprice-update', data);
            }
        });
    };
    AwsService.prototype.cancelSpotRequest = function (spotId) {
        var ec2 = new AWS.EC2();
        return this.deferredWrapper(ec2, ec2.cancelSpotInstanceRequests, { SpotInstanceRequestIds: [spotId] });
    };
    AwsService.prototype.terminateInstance = function (instanceId) {
        var ec2 = new AWS.EC2();
        return this.deferredWrapper(ec2, ec2.terminateInstances, { InstanceIds: [instanceId] });
    };
    return AwsService;
}());
AwsService = __decorate([
    core_1.Injectable(),
    __param(1, core_1.Inject(ajs_upgraded_providers_1.LOCAL_STORAGE_SERVICE))
], AwsService);
exports.AwsService = AwsService;
