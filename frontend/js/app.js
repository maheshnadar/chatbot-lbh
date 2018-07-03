// Link all the JS Docs here
var myApp = angular.module('myApp', [
    'ui.router',
    'pascalprecht.translate',
    'angulartics',
    'angulartics.google.analytics',
    'ui.bootstrap',
    'ngAnimate',
    'ngSanitize',
    'angular-flexslider',
    'ui.swiper',
    'angularPromiseButtons',
    'toastr',
    'ngCookies',
    'ngIdle',
    'app.directives',
    'jlareau.bowser',
])

var isproduction = false;

// Define all the routes below
myApp.config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, $sceDelegateProvider,IdleProvider) {
    var tempateURL = "views/template/template.html"; //Default Template URL
    //$httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    
        
    IdleProvider.idle(1); // 1sec idle
    IdleProvider.timeout(12*60*60); // in seconds
    //$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    //$httpProvider.defaults.headers.post['X-CSRFToken'] = $.jStorage.get("csrftoken")
    //$httpProvider.defaults.headers.common['X-CSRFToken'] = '{{ csrf_token|escapejs }}';

    //  $httpProvider.defaults.headers.post['X-CSRFToken'] = $cookies['csrftoken'];
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain. **.
    ]);
    $sceDelegateProvider.resourceUrlBlacklist([
        ''
    ]);
    // for http request with session
    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: tempateURL,
            controller: 'HomeCtrl'
        })
        .state('login', {
            url: "/login",
            templateUrl: tempateURL,
            controller: 'LoginCtrl'
        })
        .state('dashboard', {
            url: "/dashboard",
            templateUrl: tempateURL,
            controller: 'Dashboard5Ctrl'
        })
        .state('agentdashboard', {
            url: "/agentdashboard",
            templateUrl: tempateURL,
            controller: 'AgentdashboardCtrl'
        })
        .state('form', {
            url: "/form",
            templateUrl: tempateURL,
            controller: 'FormCtrl'
        })
        .state('msgform', {
            url: "/msgform",
            templateUrl: tempateURL,
            controller: 'MsgFormCtrl'
        })
        .state('grid', {
            url: "/grid",
            templateUrl: tempateURL,
            controller: 'GridCtrl'
        })
        .state('hotkeys', {
            url: "/hotkeys",
            templateUrl: tempateURL,
            controller: 'HotKeysCtrl'
        });
    $urlRouterProvider.otherwise("/");
    $locationProvider.html5Mode(isproduction);
});
myApp.run(['$http', '$cookies','Idle','$rootScope','bowser','$window', function ($http,$cookies,Idle,$rootScope,bowser,$window) {

    //$http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    //$http.defaults.headers.post['X-CSRFToken'] = $cookies.get("csrftoken");
    $http.defaults.headers.put['X-CSRFToken'] = $cookies.csrftoken;
    // $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    if ( bowser.msie )
        $rootScope.browser = "msie";
    if ( bowser.firefox )
        $rootScope.browser = "firefox";
    if ( bowser.chrome )
        $rootScope.browser = "chrome";
    if ( bowser.safari )
        $rootScope.browser = "safari";
    if ( bowser.opera )
        $rootScope.browser = "opera";
    if ( bowser.android )
        $rootScope.browser = "android"; //native
    if ( bowser.ios )
        $rootScope.browser = "ios"; //native
    if ( bowser.samsungBrowser )
        $rootScope.browser = "samsungBrowser"; //native
    if ( bowser.msedge )
        $rootScope.browser = "msedge";
    //console.log($rootScope.browser);
    $rootScope.transcript="";
    $(document).on('click', '.chat-body .changedthbg', function () {
        var stage = $(this).attr("data-bgstage");
        //console.log(stage);
        $(".stage" + stage).css('background-color', '#fff');
        $(".stage" + stage).css('color', '#6B002A');

        $(this).css('background-color', '#6B002A');
        $(this).css('color', '#fff');
    });
    Idle.watch();
    $(document).on('click', '.blink_me ', function () {
        //  $(this).removeClass("blink_me");
        $(this).hide();
        // console.log("button click");
    });
    $window.onbeforeunload = function () {
        // handle the exit event
        //$rootScope.setdisconnectsocket1();
    //   if($.jStrorage.get("access_role")=="livechat")
    //   {
    //       alert("hiiiiii");
    //   }
        // alert("reload");
    };
  
//     window.onload = function(e)
// {
//    alert("Byyyyy");
// };





}]);

// For Language JS
myApp.config(function ($translateProvider) {
    $translateProvider.translations('en', LanguageEnglish);
    $translateProvider.translations('hi', LanguageHindi);
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escape');
});