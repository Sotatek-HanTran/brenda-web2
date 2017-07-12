import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {downgradeComponent, UpgradeModule} from '@angular/upgrade/static';
import {awsServiceProvider} from './ajs-upgraded-providers';
import {AwsSetupComponent} from './aws-setup/aws-setup.component';
import {LandingPageComponent} from "./landingPage/landing-page.component";
import {RoutingEmptyComponent} from "app2/routing-empty/routing-empty.component";

declare let angular: any;

angular.module('brendaWeb')
  .directive(
    'app2',
    downgradeComponent({component: AppComponent})
  )
  .directive(
    'appAwsSetup',  // normalized name, the tag uses kebap case "app-aws-setup"
    downgradeComponent({component: AwsSetupComponent})
  )
  .directive(
    'landingPage',  // normalized name, the tag uses kebap case "app-aws-setup"
    downgradeComponent({component: LandingPageComponent})
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
    awsServiceProvider
  ],
  entryComponents: [
    AppComponent,
    AwsSetupComponent,
    LandingPageComponent
  ]

  //bootstrap: [AppComponent]


})
export class AppModule {
  constructor(private upgrade: UpgradeModule) {
  }

  ngDoBootstrap() {
    console.info("do bootstrap");
    this.upgrade.bootstrap(document.body, ['brendaWeb'], {strictDi: true});
  }
}
