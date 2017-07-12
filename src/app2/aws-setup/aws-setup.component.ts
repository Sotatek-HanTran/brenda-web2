import {Component, Inject} from '@angular/core';
import {AWS_SERVICE} from 'app2/ajs-upgraded-providers';

@Component({
  selector: 'app-aws-setup',
  templateUrl: './aws-setup.component.html'
})
export class AwsSetupComponent {
  awsService: any;

  awsRegion: String;
  awsKeyId: String;
  awsSecret: String;

  constructor(@Inject(AWS_SERVICE) awsService: any) {
    console.info('loaded AwsSetupComponent');
    this.awsService = awsService;

    this.awsRegion = awsService.getRegion();
    this.awsKeyId = awsService.getKeyId();
    this.awsSecret = awsService.getKeySecret();
  };

  showNoCredentialsError() {
    return !this.awsRegion || !this.awsKeyId || !this.awsSecret
  }
}
