import {Component, Inject} from '@angular/core';
import {AwsService} from "../services/aws.service";

@Component({
  selector: 'app-aws-setup',
  templateUrl: './aws-setup.component.html'
})
export class AwsSetupComponent {
  awsService: any;

  awsRegion: String;
  awsKeyId: String;
  awsSecret: String;

  constructor(awsService: AwsService) {
    this.awsService = awsService;

    this.awsRegion = awsService.getRegion();
    this.awsKeyId = awsService.getKeyId();
    this.awsSecret = awsService.getKeySecret();
  };

  showNoCredentialsError() {
    return !this.awsRegion || !this.awsKeyId || !this.awsSecret
  }
}
