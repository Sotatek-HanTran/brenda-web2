"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var platform_browser_1 = require("@angular/platform-browser");
var core_1 = require("@angular/core");
var app_component_1 = require("./app.component");
var static_1 = require("@angular/upgrade/static");
var aws_setup_component_1 = require("./aws-setup/aws-setup.component");
var landing_page_component_1 = require("./landingPage/landing-page.component");
var ajs_upgraded_providers_1 = require("./ajs-upgraded-providers");
var aws_service_1 = require("./services/aws.service");
var event_service_1 = require("./messaging/event.service");
var core_2 = require("angular2-logger/core");
angular.module('brendaWeb')
    .directive('app2', static_1.downgradeComponent({ component: app_component_1.AppComponent }))
    .directive('appAwsSetup', // normalized name, the tag uses kebab case "app-aws-setup"
static_1.downgradeComponent({ component: aws_setup_component_1.AwsSetupComponent }))
    .directive('appLandingPage', // normalized name, the tag uses kebab case "app-aws-setup"
static_1.downgradeComponent({ component: landing_page_component_1.LandingPageComponent }))
    .factory('awsService', static_1.downgradeInjectable(aws_service_1.AwsService))
    .factory('eventService', static_1.downgradeInjectable(event_service_1.EventService));
var AppModule = (function () {
    function AppModule(upgrade) {
        this.upgrade = upgrade;
    }
    AppModule.prototype.ngDoBootstrap = function () {
        this.upgrade.bootstrap(document.body, ['brendaWeb'], { strictDi: true });
    };
    return AppModule;
}());
AppModule = __decorate([
    core_1.NgModule({
        declarations: [
            app_component_1.AppComponent,
            aws_setup_component_1.AwsSetupComponent,
            landing_page_component_1.LandingPageComponent
        ],
        imports: [
            platform_browser_1.BrowserModule,
            static_1.UpgradeModule
        ],
        providers: [
            { provide: core_2.Options, useValue: { store: false, level: core_2.Level.DEBUG } },
            core_2.Logger,
            aws_service_1.AwsService,
            ajs_upgraded_providers_1.localStorageProvider,
            event_service_1.EventService
        ],
        entryComponents: [
            app_component_1.AppComponent,
            aws_setup_component_1.AwsSetupComponent,
            landing_page_component_1.LandingPageComponent,
        ]
    })
], AppModule);
exports.AppModule = AppModule;
