
var example = angular.module('example', ['ngRoute','Carousel3D', 'ui.codemirror'])

.controller('mainController', ['$scope', '$http', '$location', '$window',
	function($scope, $http, $location, $window){

	$scope.panels = [0,1,2,3,4,5,6,7,8,9,10]

	$scope.addPanel = function(){
		$scope.panels.push($scope.panels.length + 1)
	}

	$scope.popPanel = function(){
		$scope.panels.pop()
	}

	function detect3d(){
		var detect = document.createElement("div");
		detect.style.transformStyle = "preserve-3d";
		if (detect.style.transformStyle.length > 0) {
		  console.log('supports 3d');
		} else {
			alert("Internet Explorer does not support 3D tranformations " + 
					" so some features of this appliations may not work for you, " + 
					" please upgrade to Chrome or Firefox :) ");
		}
	}

	detect3d();

	setTimeout(function(){
		$scope.rotateto(4)
	}, 500)

}])

.config(['$routeProvider', '$locationProvider',
	function($routeProvider, $locationProvider){
		
	$routeProvider

		.when('/',
		{
			controller : 'mainController',
			templateUrl:'/partials/main.html',
			reloadOnSearch: false
		})

		.otherwise(
		{
			controller : 'mainController',
			templateUrl: '/partials/main.html',
			reloadOnSearch: false
    	});

    $locationProvider.html5Mode(true);

}]);


