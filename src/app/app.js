//Brenda-Web -- Frontend for Blender
//Copyright (C) 2016 Nakul Jeirath
//
//Brenda-Web is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.
//
//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU General Public License for more details.
//
//You should have received a copy of the GNU General Public License
//along with this program.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

// Declare app level module which depends on views, and components
angular.module('brendaWeb', [
  'myApp.version',
  'ui.router',
  'ui.bootstrap',
  'LocalStorageModule',
  'awsSetup',
  'duScroll',
  'angulartics',
  'angulartics.google.analytics',
  'dashboard'
]).
config(['$stateProvider', function($stateProvider) {
  $stateProvider
    .state('landing', {
      url: '',
      template: '<app-landing-page></app-landing-page>'
    }).state('setup', {
    templateUrl: 'app/jobSetup/jobSetup.partial.html',
    controller: 'SetupCtrl'
  }).state('setup.view', {
  	url: '/setup',
  	views: {
  		'credentials': {template: '<app-aws-setup></app-aws-setup>'},
  		'queue': {templateUrl: 'app/awsSetup/jobSetup.html', controller: 'JobSetupCtrl'},
  		's3': {templateUrl: 'app/awsSetup/s3Setup.html', controller: 'S3Ctrl'},
  		'workers': {templateUrl: 'app/awsSetup/workerSetup.html', controller: 'WorkerSetupCtrl'}
  	}
  }).state('dashboard', {
  	templateUrl: 'app/dashboard/dashboard.partial.html',
  	controller: 'dashboardParentCtrl'
  }).state('dashboard.view', {
  	url: '/dashboard',
  	views: {
  		'queues': {templateUrl: 'app/dashboard/queues.partial.html', controller: 'queuesCtrl'},
  		'instances': {templateUrl: 'app/dashboard/instances.partial.html', controller: 'instancesCtrl'},
  		'buckets': {templateUrl: 'app/dashboard/buckets.partial.html', controller: 'BucketCtrl'}
  	}
  })
  .state('tutorial', {
	  url: '/tutorial',
	  templateUrl: 'app/tutorial/tutorial.partial.html'
  });
}])
.controller('NavCtrl', ['$scope', function($scope) {
	$scope.navbarCollapsed = true;
}]);
