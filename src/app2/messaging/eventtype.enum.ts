// enum not compatible with ES5 AngularJS code when downgrading
// export const enum EventTypeEnum {
//   AWS_LOGIN_ERROR,
//   AWS_LOGIN_SUCCESS,
//   AWS_SQS_ERROR,
//   AWS_SQS_SUCCESS,
//   AWS_SQS_SEND_UPDATE,
//   AWS_EC2_ERROR,
//   AWS_SPOTPRICE_ERROR,
//   AWS_SPOTPRICE_UPDATE
// }

export type EventType =
      'aws-login-error' |
      'aws-login-success' |
      'aws-sqs-error' |
      'aws-sqs-success' |
      'aws-sqs-send-update' |
      'aws-ec2-error' |
      'aws-spotprice-error' |
      'aws-spotprice-update';

