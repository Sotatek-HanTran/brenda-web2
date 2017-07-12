import {Component, Inject} from '@angular/core';
import {AWS_SERVICE} from 'app2/ajs-upgraded-providers';
// import {AwsSetupComponent} from './aws-setup/aws-setup.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(@Inject(AWS_SERVICE) awsService: any) {
    console.info('awsService= ', awsService);
  }

  title = 'app2';
}
