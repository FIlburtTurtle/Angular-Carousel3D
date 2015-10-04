//Version 0.0.1
//Maintainer : Rafael Ancheta
//Email : rafael@toeverywhere.net

//Angular module for a 3D Carousel, include this script after angularjs and before you initialize
//your angular module, include 'Carousel3D' as a dependency in your module to use the directive
//thoughout your project.
var Carousel3D = angular.module('Carousel3D', [])

//Inject modernizr as a constant
Carousel3D.constant("Modernizr", Modernizr);

//Builder for our carousel
//initialize a carousel object used by the directive
Carousel3D.factory('builder', [ '$window', 'Modernizr', function($window, Modernizr){

	var transformProp = Modernizr.prefixed('transform');

	function Carousel3D ( el ) {
		//find the wrapper element of the carousel and set default values
		this.element = angular.element(angular.element(el).find('div'));
		this.rotation = 0;
		this.panelCount = 0;
		this.totalPanelCount = this.element.children().length;
		this.theta = 0;
		//Default axis
		this.isHorizontal = false;

	}

	//If modifying the carousel size set new angles for each panel
	Carousel3D.prototype.modify = function() {

		var panel, angle, i;
		if (this.isHorizontal) {
			this.panelSize = this.element.outerWidth();
		} else {
			this.panelSize = this.element.outerHeight();
		}
		this.rotateFn = this.isHorizontal ? 'rotateY' : 'rotateX';
		this.theta = 360 / this.panelCount;

		// do some trig to figure out how big the carousel
		// is in 3D space
		this.radius = Math.round( ( this.panelSize / 2) / Math.tan( Math.PI / this.panelCount ) );

		for ( i = 0; i < this.panelCount; i++ ) {
			//For each panel in the container apply color and transform props
			panel = angular.element(this.element.children()[i]);
			angle = this.theta * i;
			panel.css('opacity', 1);
			panel.css('background-color', 'hsla(' + angle + ', 100%, 50%, 0.8)');
			// rotate panel, then push it out in 3D space
			panel.css(transformProp, this.rotateFn + '(' + angle + 'deg) translateZ(' + this.radius + 'px)');
		}

		// hide other panels
		for (var i = 0 ; i < this.totalPanelCount; i++ ) {
			panel = angular.element(this.element.children()[i]);
			panel.css('opacity', 0);
			panel.css(transformProp,'none');
		}

		// adjust rotation so panels are always flat
		this.rotation = Math.round( this.rotation / this.theta ) * this.theta;

		this.transform();

	};

	Carousel3D.prototype.transform = function() {
		// push the carousel back in 3D space,
		// and rotate it
		this.element.css(transformProp, 'translateZ(-' + this.radius + 'px) ' + this.rotateFn + '(' + this.rotation + 'deg)');
	};

	return Carousel3D;

}])

//Directive to create a new 3d carousel
Carousel3D.directive('carousel3d', ['$window', '$location', 'builder', '$document',
	function($window, $location, builder, $document){

	var carousel, container;

	return {
		restrict: 'E',
		transclude: true,
		scope: {
			panels: '=',
			rotate: '=',
			rotateto: '=',
			toggleAxis: '=',
			actOnAllPanels: '=',
		},
		link: function($scope, element, attrs) {

			carousel = new builder(element);
			container = angular.element(element).children()[0];
			$scope.current_index = 0;
			angular.element(container).css('height', $window.innerHeight * attrs.percentHeight || 0.8)

			$scope.$watch('panels', function(newValue, oldValue) {
                if (newValue)
                    $scope.changeNumberOfPanels(newValue.length);
                if (newValue.length < 3) {
                	$scope.hideBackface = true;
                } else {
                	$scope.hideBackface = false;
                }
            }, true);

			setTimeout( function(){
				// populate on startup
				$scope.changeNumberOfPanels($scope.panels.length);
				angular.element(element).addClass('ready');
			}, 0);

		},
		controller : ['$scope', function($scope){

			$scope.actOnAllPanels = function(key, value){
				for (var i = 0; i < $scope.panels.length; i++) {
					$scope.panels[i][key] = value;
				};
			}

			$scope.rotate = function(increment){
				$scope.current_index = $scope.current_index + increment;
				if ($scope.current_index > $scope.panels.length - 1) {
					$scope.current_index = 0;
				};
				carousel.rotation += carousel.theta * increment * -1;
				carousel.transform();
			}

			$scope.rotateto = function(index){
				var increment;
				if (index === $scope.current_index) {
					return
				} else if ($scope.current_index <  index) {
					increment = index - $scope.current_index;
				} else {
					increment =  index - $scope.current_index;
				}

				$scope.current_index = $scope.current_index + increment
				if ($scope.current_index > $scope.panels.length -1) {
					$scope.current_index = 0;
				};

				carousel.rotation += carousel.theta * increment * -1;
				carousel.transform();
			}

			$scope.toggleAxis = function(){
				carousel.isHorizontal = !carousel.isHorizontal;
				carousel.modify();
			}

			$scope.changeNumberOfPanels = function(numPanels){
				carousel.panelCount = numPanels || $scope.panelCount;
				carousel.modify();
			}

			$scope.toggleBackface = function(){
				carousel.element.toggleClass('panels-backface-invisible');
			}

		}],
		templateUrl: '/partials/carousel.html'
	};

}])

.directive('panel3d', function() {
  return {
    require: '^carousel3d',
    restrict: 'E',
    transclude: true,
    scope: {
      panelData : '='
    },
    link: function(scope, element, attrs, carouselCtrl) {
      scope.panel = scope.panelData
      console.log(scope.panelData);
    },
    templateUrl: 'panel.html'
  };
});