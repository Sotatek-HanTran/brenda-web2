import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {downgradeComponent, UpgradeModule} from '@angular/upgrade/static';
import {awsServiceProvider} from './ajs-upgraded-providers';
import {AwsSetupComponent} from './aws-setup/aws-setup.component';
import {RouterModule, Routes, RouterOutlet, RouterLink, RouterLinkActive, UrlHandlingStrategy} from '@angular/router';
import {LandingPageComponent} from "./landingPage/landing-page.component";
import {RoutingEmptyComponent} from "app2/routing-empty/routing-empty.component";

const appRoutes: Routes = [
  {
    path: '',
    // pathMatch: 'full',
    component: LandingPageComponent
  }

  /*,
  {
    path: '',
    component: RoutingEmptyComponent
  }*/
];

class CustomHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url) {
    console.info("url: "+url);
    return url.toString().startsWith("/feature1") || url.toString() === "/";
  }
  extract(url) { return url; }
  merge(url, whole) { return url; }
}

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
    'router-outlet',
    downgradeComponent({component: RouterOutlet})
  )
  .directive(
    'routerLink',
    downgradeComponent({component: RouterLink})
  )
  .directive(
    'routerLinkActive',
    downgradeComponent({component: RouterLinkActive})
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
    UpgradeModule,
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: true, useHash: true} // <-- debugging purposes only
    )
  ],
  providers: [
    awsServiceProvider,
    { provide: UrlHandlingStrategy, useClass: CustomHandlingStrategy }
  ],
  entryComponents: [
    AppComponent,
    AwsSetupComponent
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
