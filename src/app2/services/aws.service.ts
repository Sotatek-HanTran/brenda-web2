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
import {Inject, Injectable} from '@angular/core';
import {LOCAL_STORAGE_SERVICE} from '../ajs-upgraded-providers';
import {EventService} from '../messaging/event.service';
import {AwsEvent} from '../messaging/event.model';

declare let AWS: any; // workaround to use global var, because aws-sdk doesn't work with angular/cli

@Injectable()
export class AwsService {
  startDate: any = new Date(new Date().getTime() - 6 * 60 * 60 * 1000);
  localStorageService: any;
  eventService: EventService;
  uriCache = {};

  constructor(@Inject(LOCAL_STORAGE_SERVICE) localStorageService: any, eventService: EventService) {
    this.localStorageService = localStorageService;
    this.eventService = eventService;
  };


  deferredWrapper(obj, func, params) {
    return new Promise<any>((resolve: Function, reject: Function) => {
      func.call(obj, params, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  setCredentials(keyId, secret) {
    AWS.config.update({accessKeyId: keyId, secretAccessKey: secret});
    // this.LOGGER.info('Set keyId: ' + keyId + ' and secret: ' + secret);
  }

  getKeyId() {
    if (AWS.config.credentials) {
      return AWS.config.credentials.accessKeyId;
    } else {
      return '';
    }
  }

  getKeySecret() {
    if (AWS.config.credentials) {
      return AWS.config.credentials.secretAccessKey;
    } else {
      return '';
    }
  }

  setRegion(region) {
    AWS.config.region = region;
    // this.LOGGER.info('Set region: ' + region);
  }

  getRegion() {
    return AWS.config.region;
  }

  testCredentials() {
    const ec2 = new AWS.EC2();

    return new Promise<any>((resolve: Function, reject: Function) => {
      ec2.describeKeyPairs({}, function (err, data) {
        if (err) {
          reject(String(err));
          // $rootScope.$broadcast('aws-login-error', String(err));
          this.eventService.sendEvent(new AwsEvent(null, null, null));
        } else {
          resolve();
          // $rootScope.$broadcast('aws-login-success');
        }
      });
    });
  }

  getQueues() {
    const sqs = new AWS.SQS();
    sqs.listQueues({}, function (err, data) {
      if (err) {
        // $rootScope.$broadcast('aws-sqs-error', String(err));
      } else {
        // $rootScope.$broadcast('aws-sqs-success', data);
      }
    });
  }

  sendToQueue(queueUrl, data) {
    this.localStorageService.set('awsQueue', queueUrl);
    const sqs = new AWS.SQS();

    const sendStatus = {
      total: data.length,
      success: 0,
      failed: 0,
      inFlight: 0,
      copy() {
        return {
          total: this.total,
          success: this.success,
          failed: this.failed,
          inFlight: this.inFlight
        };
      }
    };

    // $rootScope.$broadcast('aws-sqs-send-update', sendStatus.copy());

    let entries = [];

    data.forEach(function (item, i) {
      entries.push({
        MessageBody: btoa(item),
        Id: String(i)
      });

      if ((entries.length === 10) || ( i === (data.length - 1))) {
        sendStatus.inFlight += entries.length;
        // $rootScope.$broadcast('aws-sqs-send-update', sendStatus.copy());

        (function () {
          const params = {
            Entries: entries,
            QueueUrl: queueUrl
          };

          sqs.sendMessageBatch(params, function (sqsErr, sqsData) {
            if (sqsErr) {
              sendStatus.failed += params.Entries.length;
              sendStatus.inFlight -= params.Entries.length;
            } else {
              sendStatus.success += sqsData.Successful.length;
              sendStatus.failed += sqsData.Failed.length;
              sendStatus.inFlight -= sqsData.Successful.length;
              sendStatus.inFlight -= sqsData.Failed.length;
            }

            // $rootScope.$broadcast('aws-sqs-send-update', sendStatus.copy());
          });
        }());

        entries = [];
      }
    });
  }

  getQueue() {
    return this.localStorageService.get('awsQueue');
  }

  clearQueue(queueUrl) {
    const sqs = new AWS.SQS();
    return this.deferredWrapper(sqs, sqs.purgeQueue, {QueueUrl: queueUrl});
  }

  getQueueSize(queueUrl) {
    const sqs = new AWS.SQS();
    const params = {
      QueueUrl: queueUrl,
      AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible']
    };

    return new Promise<any>((resolve: Function, reject: Function) => {
      sqs.getQueueAttributes(params, function (err, data) {
        if (err) {
          reject(String(err));
        } else {
          resolve(data.Attributes.ApproximateNumberOfMessages);
        }
      });
    });
  }

  getKeyPairs(callback) {
    const ec2 = new AWS.EC2();
    ec2.describeKeyPairs({}, function (err, data) {
      if (err) {
        // this.LOGGER.info(err);
        // $rootScope.$broadcast('aws-ec2-error', String(err));
      } else {
        return callback(data);
      }
    });
  }

  getLaunchSpecification(ami, keyPair, securityGroup, userData, instanceType, snapshots) {
    const devs = [
      'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'
    ];

    const spec: object = {
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
  }

  setTags(instances, tags, callback) {
    const params = {
      Resources: instances,
      Tags: tags
    };

    const ec2 = new AWS.EC2();
    ec2.createTags(params, function (err, data) {
      if (err) {
        // Try the call again after a little bit
        // this.LOGGER.info('Setting tags failed once, retrying');

        setTimeout(() => {
          ec2.createTags(params, callback);
        }, 5000);

      } else {
        return callback(err, data);
      }
    });
  }

  requestSpot(ami, keyPair, securityGroup, userData, instanceType, snapshots, spotPrice, count, type, queueName, s3Destination, statusCallback) {
    const spec = this.getLaunchSpecification(ami, keyPair, securityGroup, userData, instanceType, snapshots);

    const params = {
      // DryRun: true,
      SpotPrice: String(spotPrice),
      InstanceCount: parseInt(count, 10),
      LaunchSpecification: spec,
      Type: type
    };

    const self = this;

    const ec2 = new AWS.EC2();
    ec2.requestSpotInstances(params, function (err, data) {
      if (err) {
        // this.LOGGER.info(err);
        statusCallback('danger', String(err));
      } else {
        // this.LOGGER.info(data);
        const spotRequests = data.SpotInstanceRequests.map(function (item) {
          return item.SpotInstanceRequestId;
        });
        self.setTags(spotRequests, [{Key: 'brenda-queue', Value: queueName}, {
          Key: 'brenda-dest',
          Value: s3Destination
        }], function (setTagsErr) {
          if (setTagsErr) {
            statusCallback('warning', 'Spot instances requested but could not set tags (may affect dashboard)');
          } else {
            statusCallback('success', 'Spot instances requested');
          }
        });

      }
    });
  }

  requestOndemand(ami, keyPair, securityGroup, userData, instanceType, snapshots, count, queueName, s3Destination, statusCallback) {
    const spec: any = this.getLaunchSpecification(ami, keyPair, securityGroup, userData, instanceType, snapshots);
    spec['MinCount'] = count;
    spec['MaxCount'] = count;
    spec['InstanceInitiatedShutdownBehavior'] = 'terminate';
    // spec.DryRun = true;

    const self = this;

    const ec2 = new AWS.EC2();
    ec2.runInstances(spec, function (err, data) {
      if (err) {
        // this.LOGGER.info(err);
        statusCallback('danger', String(err));
      } else {
        // this.LOGGER.info(data);
        const instanceIds = data.Instances.map(function (item) {
          return item.InstanceId;
        });
        self.setTags(instanceIds, [{Key: 'brenda-queue', Value: queueName}, {
          Key: 'brenda-dest',
          Value: s3Destination
        }], function (setTagsErr) {
          if (setTagsErr) {
            statusCallback('warning', 'On demand instances requested but could not set tags (may affect dashboard)');
          } else {
            statusCallback('success', 'On demand instances requested');
          }
        });
      }
    });
  }

  getSpotRequests() {
    const ec2 = new AWS.EC2();
    return this.deferredWrapper(ec2, ec2.describeSpotInstanceRequests, {
      Filters: [{
        Name: 'tag-key',
        Values: ['brenda-queue']
      }]
    });
  }

  getInstanceDetails(instanceList) {
    const ec2 = new AWS.EC2();

    const params = {};
    if (instanceList) {
      params['InstanceIds'] = instanceList;
    } else {
      params['Filters'] = [{Name: 'tag-key', Values: ['brenda-queue']}];
    }

    return this.deferredWrapper(ec2, ec2.describeInstances, params);
  }

  getSecurityGroups(groupName) {
    const ec2 = new AWS.EC2();
    return this.deferredWrapper(ec2, ec2.describeSecurityGroups, {GroupNames: [groupName]});
  }

  createSecurityGroup() {
    const ec2 = new AWS.EC2();

    const sgParams = {
      GroupName: 'brenda-web',
      Description: 'Security group used by brenda-web.com'
    };

    const ingressParams = {
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

    return new Promise<any>((resolve: Function, reject: Function) => {
      ec2.createSecurityGroup(sgParams, function (err, data) {
        if (err) {
          reject(String(err));
        } else {
          ingressParams['GroupId'] = data.GroupId;
          ec2.authorizeSecurityGroupIngress(ingressParams, function (ec2Err) {
            if (ec2Err) {
              reject(String(ec2Err));
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  createQueue(queueName) {
    const params = {
      QueueName: queueName,
      Attributes: {
        VisibilityTimeout: '120'
      }
    };

    const sqs = new AWS.SQS();
    return this.deferredWrapper(sqs, sqs.createQueue, params);
  }

  listObjects(bucket) {
    const s3 = new AWS.S3();
    return this.deferredWrapper(s3, s3.listObjects, {Bucket: bucket});
  }

  getObjectUri(bucket, key) {
    const cacheKey = bucket + '-' + key;
    const cached = this.uriCache[cacheKey];

    // If cached and not going to expire within the next two minutes
    if (cached && (cached.expiration > new Date(new Date().valueOf() + 120 * 1000))) {
      return cached.url;
    } else {
      const s3 = new AWS.S3();
      const url = s3.getSignedUrl('getObject', {Bucket: bucket, Key: key, Expires: 3600});
      this.uriCache[cacheKey] = {url: url, expiration: new Date(new Date().valueOf() + 3600 * 1000)}
      return url;
    }


  }

  getAvailabilityZones() {
    const ec2 = new AWS.EC2();

    return new Promise<any>((resolve: Function, reject: Function) => {
      ec2.describeAvailabilityZones({}, function (err, data) {
        if (err) {
          reject(String(err));
        } else {
          resolve(data.AvailabilityZones.map(function (item) {
            return item.ZoneName
          }));
        }
      });
    });
  }

  getSpotPrices(nextToken) {
    const ec2 = new AWS.EC2();

    const params = {
      Filters: [{Name: 'product-description', Values: ['Linux/UNIX']}],
      StartTime: this.startDate
    };

    if (nextToken) {
      params['NextToken'] = nextToken;
    }

    ec2.describeSpotPriceHistory(params, function (err, data) {
      if (err) {
        // $rootScope.$broadcast('aws-spotprice-error', err);
      } else {
        // $rootScope.$broadcast('aws-spotprice-update', data);
      }
    });
  }

  cancelSpotRequest(spotId) {
    const ec2 = new AWS.EC2();
    return this.deferredWrapper(ec2, ec2.cancelSpotInstanceRequests, {SpotInstanceRequestIds: [spotId]})
  }

  terminateInstance(instanceId) {
    const ec2 = new AWS.EC2();
    return this.deferredWrapper(ec2, ec2.terminateInstances, {InstanceIds: [instanceId]});
  }

}
;
