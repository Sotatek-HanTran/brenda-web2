import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {downgradeComponent, downgradeInjectable, UpgradeModule} from '@angular/upgrade/static';
import {AwsSetupComponent} from './aws-setup/aws-setup.component';
import {LandingPageComponent} from './landingPage/landing-page.component';
import {RoutingEmptyComponent} from 'app2/routing-empty/routing-empty.component';
import {localStorageProvider} from './ajs-upgraded-providers';
import {AwsService} from './services/aws.service';
import {EventService} from './messaging/event.service';

declare let angular: any;

angular.module('brendaWeb')
  .directive(
    'app2',
    downgradeComponent({component: AppComponent})
  )
  .directive(
    'appAwsSetup',  // normalized name, the tag uses kebab case "app-aws-setup"
    downgradeComponent({component: AwsSetupComponent})
  )
  .directive(
    'landingPage',  // normalized name, the tag uses kebab case "app-aws-setup"
    downgradeComponent({component: LandingPageComponent})
  )
  .factory(
    'awsService',
    downgradeInjectable(AwsService)
  )
  .factory(
    'eventService',
    downgradeInjectable(EventService)
  )
;

@NgModule({
  declarations: [
    AppComponent,
    AwsSetupComponent,
    LandingPageComponent,
    RoutingEmptyComponent
  ],
  imports: [
    BrowserModule,
    UpgradeModule
  ],
  providers: [
    AwsService,
    localStorageProvider,
    EventService
  ],
  entryComponents: [
    AppComponent,
    AwsSetupComponent,
    LandingPageComponent,
  ]
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) {
  }

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['brendaWeb'], {strictDi: true});
  }
}
