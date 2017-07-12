# Upgrade workflow
Documented the steps taken to upgrade the old AngularJS app to Angular.

## Info
- AngularJS Version 1.x will be called AngularJS.
- Angular Versions 2/4 will be called just Angular.

## Workflow

### Created new Angular App with CLI
- ng new brenda-web2
- renamed _src/app_ to _src/app2_

### Merge AngularJS with Angular
- Copied the AngularJS folder _app_ from the old project to _src_ in the newly created Angular project.
- Merged the two index.html files _/app/index.html_ and _/index.html_. Important to load AngularJS before Angular. 
The static AnguarJS imports where copied before the ending _body_ tag. The bundled Angular imports are injected 
after the static imports and before the ending _body_ tag.
- fixed paths for old refences to files in the _/app_ folder because the new root is on the _/index.html_ level. 
Because it runs in the Angular context.
- moved _amiList.json_ and _instances.json_ from _app_ to _assets_ and fixed paths.

### Adding the UpgradeModule
- removing bootstrap from decorator in @NgModule
```typescript
  //bootstrap: [AppComponent]
```
- removing _ng-app_ from _/index.html_
- manual bootstrapping 
```typescript
export class AppModule {
  constructor(private upgrade: UpgradeModule) {
  }

  ngDoBootstrap() {
    console.info("do bootstrap");
    this.upgrade.bootstrap(document.body, ['brendaWeb'], {strictDi: true});
  }
}
```
- Downgrade Angular _AppComponent_ to AngularJS
```typescript
import {downgradeComponent} from '@angular/upgrade/static';

declare let angular: any;

angular.module('brendaWeb')
  .directive(
    'app2',
    downgradeComponent({component: AppComponent})
  );
```
- to test the downgrade we added the directive to the merged _/index.html_
```html
  <app2></app2>
```

### Upgrade the AWS Service to inject it in Angular
- create ajs-upgraded-providers.ts
- get _awsService_ from AngularJS injections and use it in an Angular provider.
```typescript
import {InjectionToken} from '@angular/core';

export const AWS_SERVICE = new InjectionToken<any>('AWS_SERVICE');

export function awsServiceFactory(i: any) {
  return i.get('awsService');
}

export const awsServiceProvider = {
  provide: AWS_SERVICE,
  useFactory: awsServiceFactory,
  deps: ['$injector']
};
```

### Convert AngularJS component to an Angular component
- we picked _awsSetup.ctrl.js_ to replace it with a new Angular component
- The controller gets the awsService injected. But we already upgraded it, what a coincidence ;-)
- Create the new component _aws-setup-component.ts_ and convert code
```typescript
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
```

- Create the html view of the component. Copied the html from the old _awsSetup.html_ and then upgrade/convert old AngularJS directives

```angular2html
<div class="panel panel-default">
  <div class="panel-heading">
    <h3 class="panel-title">AWS Credentials</h3>
  </div>
  <div class="panel-body">
    <table class="table">
      <tr><td><strong>Access Key ID:</strong></td><td>{{awsKeyId}}</td></tr>
      <tr><td><strong>AWS Access Key Secret:</strong></td><td>{{awsSecret}}</td></tr>
      <tr><td><strong>AWS Region:</strong></td><td>{{awsRegion}}</td></tr>
    </table>
    <div *ngIf="showNoCredentialsError()">
      <div class="alert alert-danger">Credentials not configured yet, 
      <a href aws-configure><strong>configure</strong></a> them now</div>
    </div>
  </div>
</div>
```
- Downgrade the new component to use it in the AngularJS context instead of the old one.
```typescript
angular.module('brendaWeb')
  .directive(
    'appAwsSetup',  // normalisierter name
    downgradeComponent({component: AwsSetupComponent})
  );
```

### Managing routing for both AngularJS and Angular

- Change routing of _landing.html_ to use the new Angular component
- remove old route to _landing.html_
- created new Angular component _landingPage.components.ts_, copy _landing.html_ to the new components _html_



```typescript

```
