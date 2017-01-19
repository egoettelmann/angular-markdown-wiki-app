var wikiApp = angular.module('wikiApp', ['ui.router']);

wikiApp.config(['$provide', '$stateProvider', '$urlRouterProvider', function($provide, $stateProvider, $urlRouterProvider) {

    $provide.decorator('$templateFactory', ['$delegate', function($delegate) {
        var fromUrl = angular.bind($delegate, $delegate.fromUrl);
        $delegate.fromUrl = function (url, params) {
            if (url !== null && angular.isDefined(url) && angular.isString(url)) {
                url += (url.indexOf("?") === -1 ? "?" : "&");
                url += "v=" + Date.now().toString();;
            }

            return fromUrl(url, params);
        };

        return $delegate;
    }]);
	
	function addRoutes(routesList, parents) {
		angular.forEach(routesList, function(children, route) {
			var routeObj = undefined;
			if (!isEmpty(children)) {
				routeObj = formatAbstractRoute(route, parents);
				var parentsList = angular.copy(parents);
				parentsList.push(route);
				addRoutes(children, parentsList);
			} else {
				routeObj = formatConcreteRoute(route, parents);
			}
			$stateProvider.state(routeObj);
		});
	}
	addRoutes(routes, []);
	
	$urlRouterProvider.otherwise(defaultRoute);

}]);

wikiApp.run(['$rootScope', function($rootScope) {
	
	$rootScope.goToTop = function() {
		document.body.scrollTop = document.documentElement.scrollTop = 0;
	};
	
	$rootScope.routes = routes;
	
	$rootScope.formatRouteDisplayName = function(routeName) {
		var displayName = routeName;
		displayName = displayName.split('_').join(' ');
		return displayName.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	};
	
	$rootScope.isEmpty = isEmpty;
	
	$rootScope.$on('$stateChangeSuccess', function() {
		$rootScope.goToTop();
	});
	
}]);

function formatConcreteRoute(routeName, parents) {
	var prefix = '';
	var template = '';
	angular.forEach(parents, function(parent) {
		prefix += parent + '.';
		template += parent + '/';
	});
	return {
		name: prefix + routeName,
		url: '/' + routeName,
		templateUrl: 'app/' + template + routeName + '.html'
	};
}

function formatAbstractRoute(routeName, parents) {
	var prefix = '';
	angular.forEach(parents, function(parent) {
		prefix += prefix + '.';
	});
	return {
		name: prefix + routeName,
		url: '/' + routeName,
		abstract: true,
		template: '<ui-view/>'
	};
};

function isEmpty(obj) {
   	for (var i in obj) if (obj.hasOwnProperty(i)) return false;
   	return true;
}