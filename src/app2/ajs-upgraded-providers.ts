import {InjectionToken} from '@angular/core';

// export const AWS_SERVICE = new InjectionToken<any>('AWS_SERVICE');
export const LOCAL_STORAGE_SERVICE = new InjectionToken<any>('localStorageService');

// export function awsServiceFactory(i: any) {
//   return i.get('awsService');
// }
// export const awsServiceProvider = {
//   provide: AWS_SERVICE,
//   useFactory: awsServiceFactory,
//   deps: ['$injector']
// };

export function localStorageFactory(i: any) {
  return i.get('localStorageService');
}
export const localStorageProvider = {
  provide: LOCAL_STORAGE_SERVICE,
  useFactory: localStorageFactory,
  deps: ['$injector']
};

