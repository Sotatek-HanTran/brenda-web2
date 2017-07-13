import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {downgradeComponent, downgradeInjectable, UpgradeModule} from '@angular/upgrade/static';
import {AwsSetupComponent} from './aws-setup/aws-setup.component';
import {LandingPageComponent} from './landingPage/landing-page.component';
import {localStorageProvider} from './ajs-upgraded-providers';
import {AwsService} from './services/aws.service';
import {EventService} from './messaging/event.service';
import {LOG_LOGGER_PROVIDERS} from 'angular2-logger/core';

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
    'appLandingPage',  // normalized name, the tag uses kebab case "app-aws-setup"
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
    LandingPageComponent
  ],
  imports: [
    BrowserModule,
    UpgradeModule
  ],
  providers: [
    LOG_LOGGER_PROVIDERS,
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
