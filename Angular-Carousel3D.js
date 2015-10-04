// API wrapper to get edmodo results in angular
var Carousel3D = angular.module('Carousel3D', ['ngTouch', 'EdmodoAngular'])

Carousel3D.factory('builder', [ '$window', function($window){

	var transformProp = Modernizr.prefixed('transform');

	function Carousel3D ( el ) {
		this.element = angular.element(angular.element(el).find('div'));
		this.rotation = 0;
		this.panelCount = 0;
		this.totalPanelCount = this.element.children().length;
		this.theta = 0;

		this.isHorizontal = false;

	}

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
			panel = angular.element(this.element.children()[i]);
			angle = this.theta * i;
			panel.css('opacity', 1);
			panel.css('background-color', 'hsla(' + angle + ', 100%, 100%, 0.95)');
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


Carousel3D.directive('carousel3d', [ '$window', '$location', 'builder', '$document', 'edmodoApi',
	function($window, $location, builder, $document, edmodoApi){
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			carousel: '=',
			rotate: '=',
			rotateto: '=',
			toggleAxis: '=',
			showSubmissions: '=',
		},
		link: function($scope, element, attrs) {

			var carousel = new builder(element);
			var container = angular.element(element).children()[0];
			var edmodoAPI = new edmodoApi(null, null)
			$scope.current_index = 0;
			angular.element(container).css('height', $window.innerHeight * attrs.percentHeight || 0.8)

			$scope.closeAllAssigments = function(){
				for (var i = 0; i < $scope.carousel.length; i++) {
					$scope.carousel[i].submissionView = false;
					$scope.carousel[i].submissions = [];
				};
			}

			$scope.changePath = function(assignment_id){
				if (assignment_id) {
					$location.search('assignment_id', assignment_id)
				} else {
					$location.search('assignment_id', null)
				}
			}

			$scope.rotate = function(increment){
				$scope.current_index = $scope.current_index + increment;
				if ($scope.current_index > $scope.carousel.length -1) {
					$scope.current_index = 0;
				};
				carousel.rotation += carousel.theta * increment * -1;
				carousel.transform();
				$scope.closeAllAssigments()
				var pane = $scope.carousel[$scope.current_index]
				if (pane && pane.id) {
					$scope.changePath(pane.id)
				} else {
					$scope.changePath(null)
				}
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
				if ($scope.current_index > $scope.carousel.length -1) {
					$scope.current_index = 0;
				};

				var pane = $scope.carousel[$scope.current_index]
				if (pane && pane.id) {
					$scope.changePath(pane.id)
				} else {
					$scope.changePath(null)
				}
				$scope.closeAllAssigments()
				carousel.rotation += carousel.theta * increment * -1;
				carousel.transform();
			}

			$scope.toggleAxis = function(){
				carousel.isHorizontal = !carousel.isHorizontal;
				carousel.modify();
			}

			$scope.showSubmissions = function(assignment_id, page, per_page, loading){
				$scope.submissionLoading = loading;
				edmodoAPI.getSubmissions({assignment_id : assignment_id, page : 0, per_page : 100 }, function(result){
					$scope.submissions = result;
					$scope.submissionLoading = false;
				});
			}

			$scope.changeNumberOfPanels = function(numPanels){
				carousel.panelCount = numPanels || $scope.panelCount;
				carousel.modify();
			}

			$scope.toggleBackface = function(){
				carousel.element.toggleClass('panels-backface-invisible');
			}

			$scope.$watch('carousel', function(newValue, oldValue) {
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
				$scope.changeNumberOfPanels($scope.carousel.length);
				angular.element(element).addClass('ready');
			}, 0);

		},
		templateUrl: '/partials/carousel.html'
	};

}])