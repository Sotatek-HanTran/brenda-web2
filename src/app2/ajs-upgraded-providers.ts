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
