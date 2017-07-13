//Brenda-Web -- Frontend for Blender
//
//Brenda-Web is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.
//
//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU General Public License for more details.
//
//You should have received a copy of the GNU General Public License
//along with this program.  If not, see <http://www.gnu.org/licenses/>.
import * as AWS from 'aws-sdk';
import * as log4javascript from 'log4javascript';
import {Inject, Injectable} from '@angular/core';
import {LOCAL_STORAGE_SERVICE} from "../ajs-upgraded-providers";


@Injectable()
export class AwsService {

  LOGGER = log4javascript.getLogger();
  startDate: any = new Date(new Date().getTime() - 6*60*60*1000);
  localStorageService: any;
  uriCache = {};

  constructor(@Inject(LOCAL_STORAGE_SERVICE) localStorageService: any) {
    console.info('loaded AwsSetupComponent');
    this.localStorageService = localStorageService;
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
      this.LOGGER.info("Set keyId: " + keyId + " and secret: " + secret);
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
			this.LOGGER.info("Set region: " + region);
		}
		getRegion() {
			return AWS.config.region;
		}
		testCredentials() {
			var ec2 = new AWS.EC2();

      return new Promise<any>((resolve: Function, reject: Function) => {
        ec2.describeKeyPairs({}, function (err, data) {
          if (err) {
            reject(String(err));
            // $rootScope.$broadcast('aws-login-error', String(err));
          } else {
            resolve();
            // $rootScope.$broadcast('aws-login-success');
          }
        });
      });
		}
		getQueues() {
			var sqs = new AWS.SQS();
			sqs.listQueues({}, function(err, data) {
				if (err) {
					// $rootScope.$broadcast('aws-sqs-error', String(err));
				} else {
					// $rootScope.$broadcast('aws-sqs-success', data);
				}
			});
		}
		sendToQueue(queueUrl, data) {
			this.localStorageService.set('awsQueue', queueUrl);
			var sqs = new AWS.SQS();

			var sendStatus = {
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

			var entries = [];

			data.forEach(function(item, i) {
				entries.push( {
					MessageBody: btoa(item),
					Id: String(i)
				});

				if ((entries.length === 10) || ( i === (data.length -1))) {
					sendStatus.inFlight += entries.length;
					// $rootScope.$broadcast('aws-sqs-send-update', sendStatus.copy());

					(function() {
						var params = {
							Entries: entries,
							QueueUrl: queueUrl
						};

						sqs.sendMessageBatch(params, function(err, data) {
							if (err) {
								sendStatus.failed += params.Entries.length;
								sendStatus.inFlight -= params.Entries.length;
							} else {
								sendStatus.success += data.Successful.length;
								sendStatus.failed += data.Failed.length;
								sendStatus.inFlight -= data.Successful.length;
								sendStatus.inFlight -= data.Failed.length;
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
			var sqs = new AWS.SQS();
			return this.deferredWrapper(sqs, sqs.purgeQueue, {QueueUrl: queueUrl});
		}
		getQueueSize(queueUrl) {
			var sqs = new AWS.SQS();
			var params = {
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
			var ec2 = new AWS.EC2();
			ec2.describeKeyPairs({}, function(err, data) {
				if (err) {
          this.LOGGER.info(err);
					// $rootScope.$broadcast('aws-ec2-error', String(err));
				} else {
					return callback(data);
				}
			});
		}
		getLaunchSpecification(ami, keyPair, securityGroup, userData, instanceType, snapshots) {
			let devs = [
	            'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'
            ];

			let spec: object = {
				ImageId: ami,
				KeyName: keyPair,
				SecurityGroups: [securityGroup],
				UserData: btoa(userData),
				InstanceType: instanceType
			};

			if (snapshots) {
				spec['BlockDeviceMappings'] = [];

				snapshots.forEach(function(snapshot, i) {
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
			var params = {
				Resources: instances,
				Tags: tags
			};

			var ec2 = new AWS.EC2();
			ec2.createTags(params, function(err, data) {
				if (err) {
					//Try the call again after a little bit
          this.LOGGER.info("Setting tags failed once, retrying");

          setTimeout(() => {
            ec2.createTags(params, callback);
          }, 5000);

				} else {
					return callback(err, data);
				}
			});
		}
		requestSpot(ami, keyPair, securityGroup, userData, instanceType, snapshots, spotPrice, count, type, queueName, s3Destination, statusCallback) {
			var spec = this.getLaunchSpecification(ami, keyPair, securityGroup, userData, instanceType, snapshots);

			var params = {
				// DryRun: true,
				SpotPrice: String(spotPrice),
				InstanceCount: parseInt(count, 10),
				LaunchSpecification: spec,
				Type: type
			};

			var self = this;

			var ec2 = new AWS.EC2();
			ec2.requestSpotInstances(params, function(err, data) {
				if (err) {
          this.LOGGER.info(err);
					statusCallback('danger', String(err));
				} else {
          this.LOGGER.info(data);
					var spotRequests = data.SpotInstanceRequests.map(function(item) {
						return item.SpotInstanceRequestId;
					});
					self.setTags(spotRequests, [{Key: 'brenda-queue', Value: queueName}, {Key: 'brenda-dest', Value: s3Destination}], function(err, data) {
						if (err) {
							statusCallback('warning', 'Spot instances requested but could not set tags (may affect dashboard)');
						} else {
							statusCallback('success', 'Spot instances requested');
						}
					});

				}
			});
		}
		requestOndemand(ami, keyPair, securityGroup, userData, instanceType, snapshots, count, queueName, s3Destination, statusCallback) {
			let spec:any = this.getLaunchSpecification(ami, keyPair, securityGroup, userData, instanceType, snapshots);
			spec['MinCount'] = count;
			spec['MaxCount'] = count;
			spec['InstanceInitiatedShutdownBehavior'] = 'terminate';
			// spec.DryRun = true;

			let self = this;

			let ec2 = new AWS.EC2();
			ec2.runInstances(spec, function(err, data) {
				if (err) {
          this.LOGGER.info(err);
					statusCallback('danger', String(err));
				} else {
          this.LOGGER.info(data);
					var instanceIds = data.Instances.map(function(item) {
						return item.InstanceId;
					});
					self.setTags(instanceIds, [{Key: 'brenda-queue', Value: queueName}, {Key: 'brenda-dest', Value: s3Destination}], function(err, data) {
						if (err) {
							statusCallback('warning', 'On demand instances requested but could not set tags (may affect dashboard)');
						} else {
							statusCallback('success', 'On demand instances requested');
						}
					});
				}
			});
		}
		getSpotRequests() {
			var ec2 = new AWS.EC2();
			return this.deferredWrapper(ec2, ec2.describeSpotInstanceRequests, {Filters: [{Name: 'tag-key', Values: ['brenda-queue']}]});
		}
		getInstanceDetails(instanceList) {
			var ec2 = new AWS.EC2();

			var params = {};
			if (instanceList) {
				params['InstanceIds'] = instanceList;
			} else {
				params['Filters'] = [{Name: 'tag-key', Values: ['brenda-queue']}];
			}

			return this.deferredWrapper(ec2, ec2.describeInstances, params);
		}
		getSecurityGroups(groupName) {
			var ec2 = new AWS.EC2();
			return this.deferredWrapper(ec2, ec2.describeSecurityGroups, {GroupNames: [groupName]});
		}
		createSecurityGroup() {
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

      return new Promise<any>((resolve: Function, reject: Function) => {
        ec2.createSecurityGroup(sgParams, function (err, data) {
          if (err) {
            reject(String(err));
          } else {
            ingressParams['GroupId'] = data.GroupId;
            ec2.authorizeSecurityGroupIngress(ingressParams, function (err, data) {
              if (err) {
                reject(String(err));
              } else {
                resolve();
              }
            });
          }
        });
      });
		}
		createQueue(queueName) {
			var params = {
				QueueName: queueName,
				Attributes: {
					VisibilityTimeout: '120'
				}
			};

			var sqs = new AWS.SQS();
			return this.deferredWrapper(sqs, sqs.createQueue, params);
		}
		listObjects(bucket) {
			var s3 = new AWS.S3();
			return this.deferredWrapper(s3, s3.listObjects, {Bucket: bucket});
		}
		getObjectUri(bucket, key) {
			var cacheKey = bucket + '-' + key;
			var cached = this.uriCache[cacheKey];

			//If cached and not going to expire within the next two minutes
			if (cached && (cached.expiration > new Date(new Date().valueOf() + 120*1000))) {
				return cached.url;
			} else {
				let s3 = new AWS.S3();
				let url = s3.getSignedUrl('getObject', {Bucket: bucket, Key: key, Expires: 3600});
				this.uriCache[cacheKey] = {url: url, expiration: new Date(new Date().valueOf() + 3600*1000)}
				return url;
			}


		}
		getAvailabilityZones() {
			let ec2 = new AWS.EC2();

      return new Promise<any>((resolve: Function, reject: Function) => {
        ec2.describeAvailabilityZones({}, function (err, data) {
          if (err) {
            reject(String(err));
          } else {
            resolve(data.AvailabilityZones.map(function(item) {return item.ZoneName}));
          }
        });
      });
		}
		getSpotPrices(nextToken) {
			var ec2 = new AWS.EC2();

			var params = {
					Filters: [{Name: 'product-description', Values: ['Linux/UNIX']}],
					StartTime: this.startDate
			};

			if (nextToken) {
				params['NextToken'] = nextToken;
			}

			ec2.describeSpotPriceHistory(params, function(err, data) {
				if (err) {
					// $rootScope.$broadcast('aws-spotprice-error', err);
				} else {
					// $rootScope.$broadcast('aws-spotprice-update', data);
				}
			});
		}
		cancelSpotRequest(spotId) {
			var ec2 = new AWS.EC2();
			return this.deferredWrapper(ec2, ec2.cancelSpotInstanceRequests, {SpotInstanceRequestIds: [spotId]})
		}
		terminateInstance(instanceId) {
			var ec2 = new AWS.EC2();
			return this.deferredWrapper(ec2, ec2.terminateInstances, {InstanceIds: [instanceId]});
		}

};
