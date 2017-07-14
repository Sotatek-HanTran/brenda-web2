"use strict";
exports.__esModule = true;
var core_1 = require("@angular/core");
// export const AWS_SERVICE = new InjectionToken<any>('AWS_SERVICE');
exports.LOCAL_STORAGE_SERVICE = new core_1.InjectionToken('localStorageService');
// export function awsServiceFactory(i: any) {
//   return i.get('awsService');
// }
// export const awsServiceProvider = {
//   provide: AWS_SERVICE,
//   useFactory: awsServiceFactory,
//   deps: ['$injector']
// };
function localStorageFactory(i) {
    return i.get('localStorageService');
}
exports.localStorageFactory = localStorageFactory;
exports.localStorageProvider = {
    provide: exports.LOCAL_STORAGE_SERVICE,
    useFactory: localStorageFactory,
    deps: ['$injector']
};
