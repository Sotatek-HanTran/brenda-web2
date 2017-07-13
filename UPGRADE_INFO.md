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

```html
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

#### Attention: in this setup, using both routers doesn't work
- AngularJS is the leading framework, we incremently upgrade components and downgrade (with the Update Lib) 
to use them in the AngularJS context
- Workaround: 
  - Using only the AngularJS Routing and insert the Angular component tag in the _template_ (in _app.js_)
```typescript
...
  	views: {
  		'credentials': {template: '<app-aws-setup></app-aws-setup>'}
...
```

### Replacing components with material design

Using the _@angular/material_ library.

- discared because the learning value is low

### Upgrading the awsService to Agnular and TypeScript
- removed wrapper AngularJS wrapper Service _aws.service.js_
- upgrade _awsServcie.service.ts_ to Angular and Typesript
  - copied to _app2/services_
  - renamed to "_.ts_"
  - npm install aws-sdk --save
  - $q.refered ersetzen durch ES6 pattern mit Promise
  - The old code generated an object _service_ and returned it. For the new function, the _service_ object was removed
  and the code was moved one level up.
```typescript
 return new Promise<any>((resolve: Function, reject: Function) => {
      func.call(obj, params, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
```
  - appending a property to an existing object only works with following syntax
```typescript
obj['propName'] = newValue;
```

#### ng eject for aws-sdk (possibility)
The aws-sdk isn't working with the ng/cli configuration of webpack. To use the webpack configuration proposed 
from amazon http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/webpack.html ejecting is necessary.
```typescript
➜  brendaweb2 git:(master) ng eject
==========================================================================================
Ejection was successful.

To run your builds, you now need to do the following commands:
   - "npm run build" to build.
   - "npm run test" to run unit tests.
   - "npm start" to serve the app using webpack-dev-server.
   - "npm run e2e" to run protractor.

Running the equivalent CLI commands will result in an error.

==========================================================================================
Some packages were added. Please run "npm install".

```

#### using the global AWS variable
Leave the javascript import in the _index.html_.
The _AWS_ object is loaded in the _HTML_ page and available als global variable.
Using the _AWS_ object in typescript using _declare_. 
```typescript
declare let AWS: any; 
```

#### replacing _$broadcast_ with an EventService 
- Creating the _EventService_ holding an _rxjs/Subject_
- The Service can send events through the Subject and it exposes an Observable to subscribe to.
- The Subject emits an AwsEvent object which had diffent types.
- Used a type instead of an enum for the types, because its possible to use it in an ES5/AngularJS context.
```typescript
export type EventType =
      'aws-login-error' |
      'aws-login-success' |
      'aws-sqs-error' |
      'aws-sqs-success' |
      'aws-sqs-send-update' |
      'aws-ec2-error' |
      'aws-spotprice-error' |
      'aws-spotprice-update';
```
- The subscribing 'old' code can check against the string not a number from the enum. This way its still readable.
- Adding the _EventService_ to the providers.
- After downgrading the _EventService_ can be injected to the old AngularJS modules. AngularJS example:
```typescript
  eventService.getObservable().subscribe(function (observable) {
    if (observable.event.type === 'aws-sqs-send-update') {  // checking the type
      console.log('is aws-sqs-send-update event');
      $scope.sendStatus = observable.event.payload;  // some old code
    } else if (observable.event.type === 'aws-sqs-success') {  // checking the type
      // ... some old code
    }
  });
```


## Logging
For logging it was added the _angular2-logging_ library. https://github.com/code-chunks/angular2-logger
```
npm install --save angular2-logging
```

Added the logger to _app.modules.ts_:
```typescript
import {LOG_LOGGER_PROVIDERS} from 'angular2-logger/core';

...
  providers: [
    LOG_LOGGER_PROVIDERS,
...
```
There are more Logging Providers for setting the log level. 
- ERROR_LOGGER_PROVIDERS
- WARN_LOGGER_PROVIDERS
- INFO_LOGGER_PROVIDERS
- DEBUG_LOGGER_PROVIDERS
- LOG_LOGGER_PROVIDERS
- OFF_LOGGER_PROVIDERS

To log something, simply inject the Logger to the component or service and use it.
```typescript
  constructor( private logger: Logger)
  ...
    this.logger.info('something you want to log...');
```


Futher documentation on the github page of the logging library.



## Links for aws-sdk in Angular-CLI
- https://github.com/sharma02gaurav/es6-basecamp-ng2-weback
- https://www.npmjs.com/package/es6-scaffolder
- https://stackoverflow.com/questions/37041049/using-aws-sdk-with-angular2
