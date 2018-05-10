
window.App = {};

window.App.Utils = (function () {

  var
    lastSound = 0;

  return {

    strLen: function (text) {
      return text.length;
    },

    trimStr: function (text) {
      return text.trim();
    },

    strSearch: function (text, query) {
      return text.search(query);
    },

    splitStr: function (text, separator) {
      return text.split(separator);
    },

    subStr: function (text, start, count) {
      return text.substr(start, count);
    },

    strReplace: function (text, from, to) {
      return text.replace(from, to);
    },

    strReplaceAll: function (text, from, to) {
      return text.split(from).join(to);
    },

    playSound: function (mp3Url, oggUrl) {
      if (lastSound === 0) {
        lastSound = new Audio();
      }
      if (lastSound.canPlayType('audio/mpeg')) {
        lastSound.src = mp3Url;
        lastSound.type = 'audio/mpeg';
      } else {
        lastSound.src = oggUrl;
        lastSound.type = 'audio/ogg';
      }
      lastSound.play();
    },

    stopSound: function () {
      lastSound.pause();
      lastSound.currentTime = 0.0;
    },

    sleep: function (ms) {
      var
        start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > ms){
          break;
        }
      }
    }
  };
})();

window.App.Modal = (function () {

  var
    stack = [],
    current = 0;

  return {

    insert: function (name) {
      current = stack.length;
      stack[current] = {};
      stack[current].name = name;
      stack[current].instance = null;
      return stack[current];
    },

    getCurrent: function () {
      if (stack[current]) {
        return stack[current].instance;
      } else {
        return null;
      }
    },
    
    removeCurrent: function () {
      stack.splice(current, 1);
      current = current - 1;
      current = (current < 0) ? 0 : current;
    },

    closeAll: function () {
      for (var i = stack.length-1; i >= 0; i--) {
        stack[i].instance.dismiss();
      }
      stack = [];
      current = 0;
    }
  };
})();

window.App.Debugger = (function () {

  return {

    exists: function () {
      return (typeof window.external === 'object')
       && ('hello' in window.external);
    },

    log: function (text, aType, lineNum) {
      if (window.App.Debugger.exists()) {
        window.external.log('' + text, aType || 'info', lineNum || 0);
      } else {
        console.log(text);
      }
    },

    watch: function (varName, newValue, oldValue) {
      if (window.App.Debugger.exists()) {
        if (angular.isArray(newValue)) {
          window.external.watch('', varName, newValue.toString(), 'array');
        } else if (angular.isObject(newValue)) {
          angular.forEach(newValue, function (value, key) {
            if (!angular.isFunction (value)) {
              try {
                window.external.watch(varName, key, value.toString(), typeof value);
              } 
              catch(exception) {}
            }
          });
        } else if (angular.isString(newValue) || angular.isNumber(newValue)) {
          window.external.watch('', varName, newValue.toString(), typeof newValue);
        }
      }
    }
  };
})();

window.App.Module = angular.module
(
  'AppModule',
  [
    'ngRoute',
    'ngTouch',
    'ngAnimate',
    'ngSanitize',
    'blockUI',
    'chart.js',
    'ngOnload',
    'ui.bootstrap',
    'angular-canvas-gauge',
    'com.2fdevs.videogular',
    'com.2fdevs.videogular.plugins.controls',
    'AppCtrls'
  ]
);

window.App.Module.run(function () {
  window.FastClick.attach(document.body);
});

window.App.Module.directive('ngImageLoad',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('load', function (event) {
          var 
            fn = $parse(attrs.ngImageLoad);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('ngImageError',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('error', function (event) {
          var 
            fn = $parse(attrs.ngImageError);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('ngContextMenu',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('contextmenu', function (event) {
          var
            fn = $parse(attrs.ngContextMenu);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('bindFile',
[
  function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function ($scope, el, attrs, ngModel) {
        el.bind('change', function (event) {
          ngModel.$setViewValue(event.target.files[0]);
          $scope.$apply();
        });

        $scope.$watch(function () {
          return ngModel.$viewValue;
        }, function (value) {
          if (!value) {
            el.val('');
          }
        });
      }
    };
  }
]);

window.App.Module.config
([
  '$compileProvider',

  function ($compileProvider) {
    $compileProvider.debugInfoEnabled(window.App.Debugger.exists());
    $compileProvider.imgSrcSanitizationWhitelist
     (/^\s*(https?|blob|ftp|mailto|file|tel|app|data:image|moz-extension|chrome-extension|ms-appdata|ms-appx-web):/);
  }
]);

window.App.Module.config
([
  '$httpProvider',

  function ($httpProvider) {
    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }
    if (!$httpProvider.defaults.headers.post) {
      $httpProvider.defaults.headers.post = {};
    }
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    $httpProvider.defaults.headers.post['Content-Type'] = undefined;
    $httpProvider.defaults.transformRequest.unshift(function (data) {
      var
        frmData = new FormData();
      angular.forEach(data, function (value, key) {
        frmData.append(key, value);
      });
      return frmData;
    });
}]);

window.App.Module.config
([
  '$provide',

  function ($provide) {
    $provide.decorator('$exceptionHandler',
    ['$injector',
      function ($injector) {
        return function (exception, cause) {
          var
            $rs = $injector.get('$rootScope');

          if (!angular.isUndefined(cause)) {
            exception.message += ' (caused by "'+cause+'")';
          }

          $rs.App.LastError = exception.message;
          $rs.OnAppError();
          $rs.App.LastError = '';

          if (window.App.Debugger.exists()) {
            throw exception;
          } else {
            if (window.console) {
              window.console.error(exception);
            }
          }
        };
      }
    ]);
  }
]);

window.App.Module.config
([
  'blockUIConfig',

  function (blockUIConfig) {
    blockUIConfig.delay = 0;
    blockUIConfig.autoBlock = false;
    blockUIConfig.resetOnException = true;
    blockUIConfig.message = 'Please wait';
    blockUIConfig.autoInjectBodyBlock = false;
    blockUIConfig.blockBrowserNavigation = true;
  }
]);

window.App.Module.config
([
  '$routeProvider',

  function ($routeProvider) {
    $routeProvider.otherwise({redirectTo: "/Mainview"})
    .when("/Mainview", {controller: "MainviewCtrl", templateUrl: "app/views/Mainview.html"})
    .when("/Calendar", {controller: "CalendarCtrl", templateUrl: "app/views/Calendar.html"})
    .when("/RedCafe", {controller: "RedCafeCtrl", templateUrl: "app/views/RedCafe.html"})
    .when("/SocialNetworks", {controller: "SocialNetworksCtrl", templateUrl: "app/views/SocialNetworks.html"})
    .when("/FAQ", {controller: "FAQCtrl", templateUrl: "app/views/FAQ.html"})
    .when("/DEVstuff", {controller: "DEVstuffCtrl", templateUrl: "app/views/DEVstuff.html"})
    .when("/DEVbuttons", {controller: "DEVbuttonsCtrl", templateUrl: "app/views/DEVbuttons.html"})
    .when("/DEVinputs1", {controller: "DEVinputs1Ctrl", templateUrl: "app/views/DEVinputs1.html"})
    .when("/DEVaddition", {controller: "DEVadditionCtrl", templateUrl: "app/views/DEVaddition.html"});
  }
]);

window.App.Module.service
(
  'AppEventsService',

  ['$rootScope',

  function ($rootScope) {

    function setAppHideEvent() {
      window.document.addEventListener('visibilitychange', function (event) {
        if (window.document.hidden) {
          window.App.Event = event;
          $rootScope.OnAppHide();
          $rootScope.$apply();
        }
      }, false);
    }
    
    function setAppShowEvent() {
      window.document.addEventListener('visibilitychange', function (event) {
        if (!window.document.hidden) {
          window.App.Event = event;
          $rootScope.OnAppShow();
          $rootScope.$apply();
        }
      }, false);
    }    

    function setAppOnlineEvent() {
      window.addEventListener('online', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOnline();
      }, false);
    }

    function setAppOfflineEvent() {
      window.addEventListener('offline', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOffline();
      }, false);
    }

    function setAppResizeEvent() {
      window.addEventListener('resize', function (event) {
        window.App.Event = event;
        $rootScope.OnAppResize();
      }, false);
    }

    function setAppPauseEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('pause', function (event) {
          window.App.Event = event;
          $rootScope.OnAppPause();
          $rootScope.$apply();
        }, false);
      }
    }

    function setAppReadyEvent() {
      if (window.App.Cordova) {
        angular.element(window.document).ready(function (event) {
          window.App.Event = event;
          $rootScope.OnAppReady();
        });
      } else {
        document.addEventListener('deviceready', function (event) {
          window.App.Event = event;
          $rootScope.OnAppReady();
        }, false);
      }
    }

    function setAppResumeEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('resume', function (event) {
          window.App.Event = event;
          $rootScope.OnAppResume();
          $rootScope.$apply();
        }, false);
      }
    }

    function setAppBackButtonEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('backbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppBackButton();
        }, false);
      }
    }

    function setAppMenuButtonEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('deviceready', function (event) {
          // http://stackoverflow.com/q/30309354
          navigator.app.overrideButton('menubutton', true);
          document.addEventListener('menubutton', function (event) {
            window.App.Event = event;
            $rootScope.OnAppMenuButton();
          }, false);
        }, false);
      }
    }

    function setAppOrientationEvent() {
      window.addEventListener('orientationchange', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOrientation();
      }, false);
    }

    function setAppVolumeUpEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('volumeupbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppVolumeUpButton();
        }, false);
      }
    }

    function setAppVolumeDownEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('volumedownbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppVolumeDownButton();
        }, false);
      }
    }

    function setAppKeyUpEvent() {
      document.addEventListener('keyup', function (event) {
        window.App.Event = event;
        $rootScope.OnAppKeyUp();
      }, false);
    }

    function setAppKeyDownEvent() {
      document.addEventListener('keydown', function (event) {
        window.App.Event = event;
        $rootScope.OnAppKeyDown();
      }, false);
    }

    function setAppMouseUpEvent() {
      document.addEventListener('mouseup', function (event) {
        window.App.Event = event;
        $rootScope.OnAppMouseUp();
      }, false);
    }

    function setAppMouseDownEvent() {
      document.addEventListener('mousedown', function (event) {
        window.App.Event = event;
        $rootScope.OnAppMouseDown();
      }, false);
    }

    function setAppViewChangeEvent() {
      angular.element(window.document).ready(function (event) {
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
          window.App.Event = event;
          $rootScope.App.NextView = next.substring(next.lastIndexOf('/') + 1);
          $rootScope.App.PrevView = current.substring(current.lastIndexOf('/') + 1);
          $rootScope.OnAppViewChange();
        });
      });
    }
    
    function setAppWebExtMsgEvent() {
      if (window.chrome) {
        window.chrome.runtime.onMessage.addListener(function (message, sender, responseFunc) {
          $rootScope.App.WebExtMessage = message;
          $rootScope.OnAppWebExtensionMsg();
        });
      }    
    }    

    return {
      init : function () {
        //setAppHideEvent();
        //setAppShowEvent();
        //setAppReadyEvent();
        //setAppPauseEvent();
        //setAppKeyUpEvent();
        //setAppResumeEvent();
        //setAppResizeEvent();
        //setAppOnlineEvent();
        //setAppKeyDownEvent();
        //setAppMouseUpEvent();
        //setAppOfflineEvent();
        //setAppVolumeUpEvent();
        //setAppMouseDownEvent();
        //setAppVolumeDownEvent();
        //setAppBackButtonEvent();
        //setAppMenuButtonEvent();
        //setAppViewChangeEvent();
        //setAppOrientationEvent();
        //setAppWebExtMsgEvent();
      }
    };
  }
]);

window.App.Module.service
(
  'AppGlobalsService',

  ['$rootScope', '$filter',

  function ($rootScope, $filter) {

    var setGlobals = function () {    
      $rootScope.App = {};
      var s = function (name, method) {
        Object.defineProperty($rootScope.App, name, { get: method });
      };      
      s('Online', function () { return navigator.onLine; });
      s('WeekDay', function () { return new Date().getDay(); });
      s('Event', function () { return window.App.Event || ''; });
      s('OuterWidth', function () { return window.outerWidth; });
      s('InnerWidth', function () { return window.innerWidth; });
      s('InnerHeight', function () { return window.innerHeight; });
      s('OuterHeight', function () { return window.outerHeight; });
      s('Timestamp', function () { return new Date().getTime(); });
      s('Day', function () { return $filter('date')(new Date(), 'dd'); });
      s('Hour', function () { return $filter('date')(new Date(), 'hh'); });
      s('Week', function () { return $filter('date')(new Date(), 'ww'); });
      s('Month', function () { return $filter('date')(new Date(), 'MM'); });
      s('Year', function () { return $filter('date')(new Date(), 'yyyy'); });
      s('Hour24', function () { return $filter('date')(new Date(), 'HH'); });
      s('Minutes', function () { return $filter('date')(new Date(), 'mm'); });
      s('Seconds', function () { return $filter('date')(new Date(), 'ss'); });
      s('DayShort', function () { return $filter('date')(new Date(), 'd'); });
      s('WeekShort', function () { return $filter('date')(new Date(), 'w'); });
      s('HourShort', function () { return $filter('date')(new Date(), 'h'); });
      s('YearShort', function () { return $filter('date')(new Date(), 'yy'); });
      s('MonthShort', function () { return $filter('date')(new Date(), 'M'); });
      s('Hour24Short', function () { return $filter('date')(new Date(), 'H'); });
      s('Fullscreen', function () { return window.BigScreen.element !== null; });
      s('MinutesShort', function () { return $filter('date')(new Date(), 'm'); });
      s('SecondsShort', function () { return $filter('date')(new Date(), 's'); });
      s('Milliseconds', function () { return $filter('date')(new Date(), 'sss'); });
      s('Cordova', function () {  return angular.isUndefined(window.App.Cordova) ? 'true' : 'false'; });
      s('Orientation', function () { return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait'; });
      s('ActiveControl', function () { return (window.document.activeElement !== null) ? window.document.activeElement.id : ''; });

      
$rootScope.App.DialogView = "";
$rootScope.App.IdleIsIdling = "false";
$rootScope.App.IdleIsRunning = "false";
$rootScope.App.ID = "com.camwhaler.wvcapp";
$rootScope.App.Name = "Wabash Valley College App";
$rootScope.App.ShortName = "WVC App";
$rootScope.App.Version = "1.0.0";
$rootScope.App.Description = "App for WVC services";
$rootScope.App.AuthorName = "Cameron";
$rootScope.App.AuthorEmail = "";
$rootScope.App.AuthorUrl = "";
$rootScope.App.LanguageCode = "en";
$rootScope.App.TextDirection = "ltr";
$rootScope.App.BuildNumber = 0;
$rootScope.App.Scaled = "scaled";
$rootScope.App.Theme = "Default";
$rootScope.App.Themes = ["Default"];
if ($rootScope.App.Themes.indexOf("Default") == -1) { $rootScope.App.Themes.push("Default"); }
    };

    return {
      init : function () {
        setGlobals();
      }
    };
  }
]);

window.App.Module.service
(
  'AppControlsService',

  ['$rootScope', '$http', '$sce',

  function ($rootScope, $http, $sce) {

    var setControlVars = function () {
      

$rootScope.CalenderMainPage = {};
$rootScope.CalenderMainPage.ABRole = 2001;
$rootScope.CalenderMainPage.Hidden = "";
$rootScope.CalenderMainPage.Title = "";
$rootScope.CalenderMainPage.TabIndex = -1;
$rootScope.CalenderMainPage.TooltipText = "";
$rootScope.CalenderMainPage.TooltipPos = "top";
$rootScope.CalenderMainPage.PopoverText = "";
$rootScope.CalenderMainPage.PopoverTitle = "";
$rootScope.CalenderMainPage.PopoverEvent = "mouseenter";
$rootScope.CalenderMainPage.PopoverPos = "top";
$rootScope.CalenderMainPage.Badge = "";
$rootScope.CalenderMainPage.Icon = "fa fa-calendar";
$rootScope.CalenderMainPage.Text = "Calender";
$rootScope.CalenderMainPage.Class = "btn btn-primary btn-md ";
$rootScope.CalenderMainPage.Disabled = "";

$rootScope.RedCafeMainPage = {};
$rootScope.RedCafeMainPage.ABRole = 2001;
$rootScope.RedCafeMainPage.Hidden = "";
$rootScope.RedCafeMainPage.Title = "";
$rootScope.RedCafeMainPage.TabIndex = -1;
$rootScope.RedCafeMainPage.TooltipText = "";
$rootScope.RedCafeMainPage.TooltipPos = "top";
$rootScope.RedCafeMainPage.PopoverText = "";
$rootScope.RedCafeMainPage.PopoverTitle = "";
$rootScope.RedCafeMainPage.PopoverEvent = "mouseenter";
$rootScope.RedCafeMainPage.PopoverPos = "top";
$rootScope.RedCafeMainPage.Badge = "";
$rootScope.RedCafeMainPage.Icon = "";
$rootScope.RedCafeMainPage.Text = "Red Cafe";
$rootScope.RedCafeMainPage.Class = "btn btn-primary btn-md ";
$rootScope.RedCafeMainPage.Disabled = "";

$rootScope.Entrata = {};
$rootScope.Entrata.ABRole = 2001;
$rootScope.Entrata.Hidden = "";
$rootScope.Entrata.Title = "";
$rootScope.Entrata.TabIndex = -1;
$rootScope.Entrata.TooltipText = "";
$rootScope.Entrata.TooltipPos = "top";
$rootScope.Entrata.PopoverText = "";
$rootScope.Entrata.PopoverTitle = "";
$rootScope.Entrata.PopoverEvent = "mouseenter";
$rootScope.Entrata.PopoverPos = "top";
$rootScope.Entrata.Badge = "";
$rootScope.Entrata.Icon = "";
$rootScope.Entrata.Text = "Entrata";
$rootScope.Entrata.Class = "btn btn-primary btn-md ";
$rootScope.Entrata.Disabled = "";

$rootScope.MainMainPage = {};
$rootScope.MainMainPage.ABRole = 2001;
$rootScope.MainMainPage.Hidden = "";
$rootScope.MainMainPage.Title = "";
$rootScope.MainMainPage.TabIndex = -1;
$rootScope.MainMainPage.TooltipText = "";
$rootScope.MainMainPage.TooltipPos = "top";
$rootScope.MainMainPage.PopoverText = "";
$rootScope.MainMainPage.PopoverTitle = "";
$rootScope.MainMainPage.PopoverEvent = "mouseenter";
$rootScope.MainMainPage.PopoverPos = "top";
$rootScope.MainMainPage.Badge = "";
$rootScope.MainMainPage.Icon = "";
$rootScope.MainMainPage.Text = "WVC";
$rootScope.MainMainPage.Class = "btn btn-primary btn-md ";
$rootScope.MainMainPage.Disabled = "";

$rootScope.Stuff2 = {};
$rootScope.Stuff2.ABRole = 2001;
$rootScope.Stuff2.Hidden = "";
$rootScope.Stuff2.Title = "";
$rootScope.Stuff2.TabIndex = -1;
$rootScope.Stuff2.TooltipText = "";
$rootScope.Stuff2.TooltipPos = "top";
$rootScope.Stuff2.PopoverText = "";
$rootScope.Stuff2.PopoverTitle = "";
$rootScope.Stuff2.PopoverEvent = "mouseenter";
$rootScope.Stuff2.PopoverPos = "top";
$rootScope.Stuff2.Badge = "";
$rootScope.Stuff2.Icon = "";
$rootScope.Stuff2.Text = "FAQ";
$rootScope.Stuff2.Class = "btn btn-primary btn-md ";
$rootScope.Stuff2.Disabled = "";

$rootScope.CampusMap = {};
$rootScope.CampusMap.ABRole = 2001;
$rootScope.CampusMap.Hidden = "";
$rootScope.CampusMap.Title = "";
$rootScope.CampusMap.TabIndex = -1;
$rootScope.CampusMap.TooltipText = "";
$rootScope.CampusMap.TooltipPos = "top";
$rootScope.CampusMap.PopoverText = "";
$rootScope.CampusMap.PopoverTitle = "";
$rootScope.CampusMap.PopoverEvent = "mouseenter";
$rootScope.CampusMap.PopoverPos = "top";
$rootScope.CampusMap.Badge = "";
$rootScope.CampusMap.Icon = "";
$rootScope.CampusMap.Text = "Campus Map";
$rootScope.CampusMap.Class = "btn btn-primary btn-md ";
$rootScope.CampusMap.Disabled = "";

$rootScope.Stuff4 = {};
$rootScope.Stuff4.ABRole = 2001;
$rootScope.Stuff4.Hidden = "";
$rootScope.Stuff4.Title = "";
$rootScope.Stuff4.TabIndex = -1;
$rootScope.Stuff4.TooltipText = "";
$rootScope.Stuff4.TooltipPos = "top";
$rootScope.Stuff4.PopoverText = "";
$rootScope.Stuff4.PopoverTitle = "";
$rootScope.Stuff4.PopoverEvent = "mouseenter";
$rootScope.Stuff4.PopoverPos = "top";
$rootScope.Stuff4.Badge = "";
$rootScope.Stuff4.Icon = "";
$rootScope.Stuff4.Text = "Social Networks";
$rootScope.Stuff4.Class = "btn btn-primary btn-md ";
$rootScope.Stuff4.Disabled = "";

$rootScope.Button8 = {};
$rootScope.Button8.ABRole = 2001;
$rootScope.Button8.Hidden = "";
$rootScope.Button8.Title = "";
$rootScope.Button8.TabIndex = -1;
$rootScope.Button8.TooltipText = "";
$rootScope.Button8.TooltipPos = "top";
$rootScope.Button8.PopoverText = "";
$rootScope.Button8.PopoverTitle = "";
$rootScope.Button8.PopoverEvent = "mouseenter";
$rootScope.Button8.PopoverPos = "top";
$rootScope.Button8.Badge = "";
$rootScope.Button8.Icon = "";
$rootScope.Button8.Text = "DEV Stuff";
$rootScope.Button8.Class = "btn btn-primary btn-md ";
$rootScope.Button8.Disabled = "";

$rootScope.Button7 = {};
$rootScope.Button7.ABRole = 2001;
$rootScope.Button7.Hidden = "";
$rootScope.Button7.Title = "";
$rootScope.Button7.TabIndex = -1;
$rootScope.Button7.TooltipText = "";
$rootScope.Button7.TooltipPos = "top";
$rootScope.Button7.PopoverText = "";
$rootScope.Button7.PopoverTitle = "";
$rootScope.Button7.PopoverEvent = "mouseenter";
$rootScope.Button7.PopoverPos = "top";
$rootScope.Button7.Badge = "";
$rootScope.Button7.Icon = "";
$rootScope.Button7.Text = "Back";
$rootScope.Button7.Class = "btn btn-primary btn-md ";
$rootScope.Button7.Disabled = "";

$rootScope.Button2 = {};
$rootScope.Button2.ABRole = 2001;
$rootScope.Button2.Hidden = "";
$rootScope.Button2.Title = "";
$rootScope.Button2.TabIndex = -1;
$rootScope.Button2.TooltipText = "";
$rootScope.Button2.TooltipPos = "top";
$rootScope.Button2.PopoverText = "";
$rootScope.Button2.PopoverTitle = "";
$rootScope.Button2.PopoverEvent = "mouseenter";
$rootScope.Button2.PopoverPos = "top";
$rootScope.Button2.Badge = "";
$rootScope.Button2.Icon = "";
$rootScope.Button2.Text = "Menu";
$rootScope.Button2.Class = "btn btn-primary btn-md ";
$rootScope.Button2.Disabled = "";

$rootScope.OrderMeal = {};
$rootScope.OrderMeal.ABRole = 2001;
$rootScope.OrderMeal.Hidden = "";
$rootScope.OrderMeal.Title = "";
$rootScope.OrderMeal.TabIndex = -1;
$rootScope.OrderMeal.TooltipText = "";
$rootScope.OrderMeal.TooltipPos = "top";
$rootScope.OrderMeal.PopoverText = "";
$rootScope.OrderMeal.PopoverTitle = "";
$rootScope.OrderMeal.PopoverEvent = "mouseenter";
$rootScope.OrderMeal.PopoverPos = "top";
$rootScope.OrderMeal.Badge = "";
$rootScope.OrderMeal.Icon = "";
$rootScope.OrderMeal.Text = "Order";
$rootScope.OrderMeal.Class = "btn btn-primary btn-md ";
$rootScope.OrderMeal.Disabled = "";

$rootScope.Back = {};
$rootScope.Back.ABRole = 2001;
$rootScope.Back.Hidden = "";
$rootScope.Back.Title = "";
$rootScope.Back.TabIndex = -1;
$rootScope.Back.TooltipText = "";
$rootScope.Back.TooltipPos = "top";
$rootScope.Back.PopoverText = "";
$rootScope.Back.PopoverTitle = "";
$rootScope.Back.PopoverEvent = "mouseenter";
$rootScope.Back.PopoverPos = "top";
$rootScope.Back.Badge = "";
$rootScope.Back.Icon = "";
$rootScope.Back.Text = "Back";
$rootScope.Back.Class = "btn btn-primary btn-md ";
$rootScope.Back.Disabled = "";

$rootScope.socialbutton1 = {};
$rootScope.socialbutton1.ABRole = 2001;
$rootScope.socialbutton1.Hidden = "";
$rootScope.socialbutton1.Title = "";
$rootScope.socialbutton1.TabIndex = -1;
$rootScope.socialbutton1.TooltipText = "";
$rootScope.socialbutton1.TooltipPos = "top";
$rootScope.socialbutton1.PopoverText = "";
$rootScope.socialbutton1.PopoverTitle = "";
$rootScope.socialbutton1.PopoverEvent = "mouseenter";
$rootScope.socialbutton1.PopoverPos = "top";
$rootScope.socialbutton1.Badge = "";
$rootScope.socialbutton1.Icon = "";
$rootScope.socialbutton1.Text = "Facebook";
$rootScope.socialbutton1.Class = "btn btn-primary btn-md ";
$rootScope.socialbutton1.Disabled = "";

$rootScope.Button3 = {};
$rootScope.Button3.ABRole = 2001;
$rootScope.Button3.Hidden = "";
$rootScope.Button3.Title = "";
$rootScope.Button3.TabIndex = -1;
$rootScope.Button3.TooltipText = "";
$rootScope.Button3.TooltipPos = "top";
$rootScope.Button3.PopoverText = "";
$rootScope.Button3.PopoverTitle = "";
$rootScope.Button3.PopoverEvent = "mouseenter";
$rootScope.Button3.PopoverPos = "top";
$rootScope.Button3.Badge = "";
$rootScope.Button3.Icon = "";
$rootScope.Button3.Text = "Instagram";
$rootScope.Button3.Class = "btn btn-primary btn-md ";
$rootScope.Button3.Disabled = "";

$rootScope.Button4 = {};
$rootScope.Button4.ABRole = 2001;
$rootScope.Button4.Hidden = "";
$rootScope.Button4.Title = "";
$rootScope.Button4.TabIndex = -1;
$rootScope.Button4.TooltipText = "";
$rootScope.Button4.TooltipPos = "top";
$rootScope.Button4.PopoverText = "";
$rootScope.Button4.PopoverTitle = "";
$rootScope.Button4.PopoverEvent = "mouseenter";
$rootScope.Button4.PopoverPos = "top";
$rootScope.Button4.Badge = "";
$rootScope.Button4.Icon = "";
$rootScope.Button4.Text = "Snapchat";
$rootScope.Button4.Class = "btn btn-primary btn-md ";
$rootScope.Button4.Disabled = "";

$rootScope.Button5 = {};
$rootScope.Button5.ABRole = 2001;
$rootScope.Button5.Hidden = "";
$rootScope.Button5.Title = "";
$rootScope.Button5.TabIndex = -1;
$rootScope.Button5.TooltipText = "";
$rootScope.Button5.TooltipPos = "top";
$rootScope.Button5.PopoverText = "";
$rootScope.Button5.PopoverTitle = "";
$rootScope.Button5.PopoverEvent = "mouseenter";
$rootScope.Button5.PopoverPos = "top";
$rootScope.Button5.Badge = "";
$rootScope.Button5.Icon = "";
$rootScope.Button5.Text = "Twitter";
$rootScope.Button5.Class = "btn btn-primary btn-md ";
$rootScope.Button5.Disabled = "";

$rootScope.Button6 = {};
$rootScope.Button6.ABRole = 2001;
$rootScope.Button6.Hidden = "";
$rootScope.Button6.Title = "";
$rootScope.Button6.TabIndex = -1;
$rootScope.Button6.TooltipText = "";
$rootScope.Button6.TooltipPos = "top";
$rootScope.Button6.PopoverText = "";
$rootScope.Button6.PopoverTitle = "";
$rootScope.Button6.PopoverEvent = "mouseenter";
$rootScope.Button6.PopoverPos = "top";
$rootScope.Button6.Badge = "";
$rootScope.Button6.Icon = "";
$rootScope.Button6.Text = "Back";
$rootScope.Button6.Class = "btn btn-primary btn-md ";
$rootScope.Button6.Disabled = "";

$rootScope.Button1 = {};
$rootScope.Button1.ABRole = 2001;
$rootScope.Button1.Hidden = "";
$rootScope.Button1.Title = "";
$rootScope.Button1.TabIndex = -1;
$rootScope.Button1.TooltipText = "";
$rootScope.Button1.TooltipPos = "top";
$rootScope.Button1.PopoverText = "";
$rootScope.Button1.PopoverTitle = "";
$rootScope.Button1.PopoverEvent = "mouseenter";
$rootScope.Button1.PopoverPos = "top";
$rootScope.Button1.Badge = "";
$rootScope.Button1.Icon = "";
$rootScope.Button1.Text = "Section 1";
$rootScope.Button1.Class = "btn btn-primary btn-md ";
$rootScope.Button1.Disabled = "";

$rootScope.Button11 = {};
$rootScope.Button11.ABRole = 2001;
$rootScope.Button11.Hidden = "";
$rootScope.Button11.Title = "";
$rootScope.Button11.TabIndex = -1;
$rootScope.Button11.TooltipText = "";
$rootScope.Button11.TooltipPos = "top";
$rootScope.Button11.PopoverText = "";
$rootScope.Button11.PopoverTitle = "";
$rootScope.Button11.PopoverEvent = "mouseenter";
$rootScope.Button11.PopoverPos = "top";
$rootScope.Button11.Badge = "";
$rootScope.Button11.Icon = "";
$rootScope.Button11.Text = "Section 1";
$rootScope.Button11.Class = "btn btn-primary btn-md ";
$rootScope.Button11.Disabled = "";

$rootScope.Button12 = {};
$rootScope.Button12.ABRole = 2001;
$rootScope.Button12.Hidden = "";
$rootScope.Button12.Title = "";
$rootScope.Button12.TabIndex = -1;
$rootScope.Button12.TooltipText = "";
$rootScope.Button12.TooltipPos = "top";
$rootScope.Button12.PopoverText = "";
$rootScope.Button12.PopoverTitle = "";
$rootScope.Button12.PopoverEvent = "mouseenter";
$rootScope.Button12.PopoverPos = "top";
$rootScope.Button12.Badge = "";
$rootScope.Button12.Icon = "";
$rootScope.Button12.Text = "Section 2";
$rootScope.Button12.Class = "btn btn-primary btn-md ";
$rootScope.Button12.Disabled = "";

$rootScope.Button13 = {};
$rootScope.Button13.ABRole = 2001;
$rootScope.Button13.Hidden = "";
$rootScope.Button13.Title = "";
$rootScope.Button13.TabIndex = -1;
$rootScope.Button13.TooltipText = "";
$rootScope.Button13.TooltipPos = "top";
$rootScope.Button13.PopoverText = "";
$rootScope.Button13.PopoverTitle = "";
$rootScope.Button13.PopoverEvent = "mouseenter";
$rootScope.Button13.PopoverPos = "top";
$rootScope.Button13.Badge = "";
$rootScope.Button13.Icon = "";
$rootScope.Button13.Text = "Section 3";
$rootScope.Button13.Class = "btn btn-primary btn-md ";
$rootScope.Button13.Disabled = "";

$rootScope.Button14 = {};
$rootScope.Button14.ABRole = 2001;
$rootScope.Button14.Hidden = "";
$rootScope.Button14.Title = "";
$rootScope.Button14.TabIndex = -1;
$rootScope.Button14.TooltipText = "";
$rootScope.Button14.TooltipPos = "top";
$rootScope.Button14.PopoverText = "";
$rootScope.Button14.PopoverTitle = "";
$rootScope.Button14.PopoverEvent = "mouseenter";
$rootScope.Button14.PopoverPos = "top";
$rootScope.Button14.Badge = "";
$rootScope.Button14.Icon = "";
$rootScope.Button14.Text = "Section 4";
$rootScope.Button14.Class = "btn btn-primary btn-md ";
$rootScope.Button14.Disabled = "";

$rootScope.Button15 = {};
$rootScope.Button15.ABRole = 2001;
$rootScope.Button15.Hidden = "";
$rootScope.Button15.Title = "";
$rootScope.Button15.TabIndex = -1;
$rootScope.Button15.TooltipText = "";
$rootScope.Button15.TooltipPos = "top";
$rootScope.Button15.PopoverText = "";
$rootScope.Button15.PopoverTitle = "";
$rootScope.Button15.PopoverEvent = "mouseenter";
$rootScope.Button15.PopoverPos = "top";
$rootScope.Button15.Badge = "";
$rootScope.Button15.Icon = "";
$rootScope.Button15.Text = "Section 5";
$rootScope.Button15.Class = "btn btn-primary btn-md ";
$rootScope.Button15.Disabled = "";

$rootScope.Button16 = {};
$rootScope.Button16.ABRole = 2001;
$rootScope.Button16.Hidden = "";
$rootScope.Button16.Title = "";
$rootScope.Button16.TabIndex = -1;
$rootScope.Button16.TooltipText = "";
$rootScope.Button16.TooltipPos = "top";
$rootScope.Button16.PopoverText = "";
$rootScope.Button16.PopoverTitle = "";
$rootScope.Button16.PopoverEvent = "mouseenter";
$rootScope.Button16.PopoverPos = "top";
$rootScope.Button16.Badge = "";
$rootScope.Button16.Icon = "";
$rootScope.Button16.Text = "Section 6";
$rootScope.Button16.Class = "btn btn-primary btn-md ";
$rootScope.Button16.Disabled = "";

$rootScope.Button17 = {};
$rootScope.Button17.ABRole = 2001;
$rootScope.Button17.Hidden = "";
$rootScope.Button17.Title = "";
$rootScope.Button17.TabIndex = -1;
$rootScope.Button17.TooltipText = "";
$rootScope.Button17.TooltipPos = "top";
$rootScope.Button17.PopoverText = "";
$rootScope.Button17.PopoverTitle = "";
$rootScope.Button17.PopoverEvent = "mouseenter";
$rootScope.Button17.PopoverPos = "top";
$rootScope.Button17.Badge = "";
$rootScope.Button17.Icon = "";
$rootScope.Button17.Text = "Back";
$rootScope.Button17.Class = "btn btn-primary btn-md ";
$rootScope.Button17.Disabled = "";

$rootScope.Button9 = {};
$rootScope.Button9.ABRole = 2001;
$rootScope.Button9.Hidden = "";
$rootScope.Button9.Title = "";
$rootScope.Button9.TabIndex = -1;
$rootScope.Button9.TooltipText = "";
$rootScope.Button9.TooltipPos = "top";
$rootScope.Button9.PopoverText = "";
$rootScope.Button9.PopoverTitle = "";
$rootScope.Button9.PopoverEvent = "mouseenter";
$rootScope.Button9.PopoverPos = "top";
$rootScope.Button9.Badge = "";
$rootScope.Button9.Icon = "";
$rootScope.Button9.Text = "1";
$rootScope.Button9.Class = "btn btn-primary btn-md ";
$rootScope.Button9.Disabled = "";

$rootScope.Button24 = {};
$rootScope.Button24.ABRole = 2001;
$rootScope.Button24.Hidden = "";
$rootScope.Button24.Title = "";
$rootScope.Button24.TabIndex = -1;
$rootScope.Button24.TooltipText = "";
$rootScope.Button24.TooltipPos = "top";
$rootScope.Button24.PopoverText = "";
$rootScope.Button24.PopoverTitle = "";
$rootScope.Button24.PopoverEvent = "mouseenter";
$rootScope.Button24.PopoverPos = "top";
$rootScope.Button24.Badge = "";
$rootScope.Button24.Icon = "";
$rootScope.Button24.Text = "Inputs";
$rootScope.Button24.Class = "btn btn-primary btn-md ";
$rootScope.Button24.Disabled = "";

$rootScope.Button25 = {};
$rootScope.Button25.ABRole = 2001;
$rootScope.Button25.Hidden = "";
$rootScope.Button25.Title = "";
$rootScope.Button25.TabIndex = -1;
$rootScope.Button25.TooltipText = "";
$rootScope.Button25.TooltipPos = "top";
$rootScope.Button25.PopoverText = "";
$rootScope.Button25.PopoverTitle = "";
$rootScope.Button25.PopoverEvent = "mouseenter";
$rootScope.Button25.PopoverPos = "top";
$rootScope.Button25.Badge = "";
$rootScope.Button25.Icon = "";
$rootScope.Button25.Text = "1";
$rootScope.Button25.Class = "btn btn-primary btn-md ";
$rootScope.Button25.Disabled = "";

$rootScope.Button28 = {};
$rootScope.Button28.ABRole = 2001;
$rootScope.Button28.Hidden = "";
$rootScope.Button28.Title = "";
$rootScope.Button28.TabIndex = -1;
$rootScope.Button28.TooltipText = "";
$rootScope.Button28.TooltipPos = "top";
$rootScope.Button28.PopoverText = "";
$rootScope.Button28.PopoverTitle = "";
$rootScope.Button28.PopoverEvent = "mouseenter";
$rootScope.Button28.PopoverPos = "top";
$rootScope.Button28.Badge = "";
$rootScope.Button28.Icon = "";
$rootScope.Button28.Text = "Addiontional";
$rootScope.Button28.Class = "btn btn-primary btn-md ";
$rootScope.Button28.Disabled = "";

$rootScope.Button29 = {};
$rootScope.Button29.ABRole = 2001;
$rootScope.Button29.Hidden = "";
$rootScope.Button29.Title = "";
$rootScope.Button29.TabIndex = -1;
$rootScope.Button29.TooltipText = "";
$rootScope.Button29.TooltipPos = "top";
$rootScope.Button29.PopoverText = "";
$rootScope.Button29.PopoverTitle = "";
$rootScope.Button29.PopoverEvent = "mouseenter";
$rootScope.Button29.PopoverPos = "top";
$rootScope.Button29.Badge = "";
$rootScope.Button29.Icon = "";
$rootScope.Button29.Text = "1";
$rootScope.Button29.Class = "btn btn-primary btn-md ";
$rootScope.Button29.Disabled = "";

$rootScope.Button34 = {};
$rootScope.Button34.ABRole = 2001;
$rootScope.Button34.Hidden = "";
$rootScope.Button34.Title = "";
$rootScope.Button34.TabIndex = -1;
$rootScope.Button34.TooltipText = "";
$rootScope.Button34.TooltipPos = "top";
$rootScope.Button34.PopoverText = "";
$rootScope.Button34.PopoverTitle = "";
$rootScope.Button34.PopoverEvent = "mouseenter";
$rootScope.Button34.PopoverPos = "top";
$rootScope.Button34.Badge = "";
$rootScope.Button34.Icon = "";
$rootScope.Button34.Text = "1";
$rootScope.Button34.Class = "btn btn-primary btn-md ";
$rootScope.Button34.Disabled = "";

$rootScope.Button35 = {};
$rootScope.Button35.ABRole = 2001;
$rootScope.Button35.Hidden = "";
$rootScope.Button35.Title = "";
$rootScope.Button35.TabIndex = -1;
$rootScope.Button35.TooltipText = "";
$rootScope.Button35.TooltipPos = "top";
$rootScope.Button35.PopoverText = "";
$rootScope.Button35.PopoverTitle = "";
$rootScope.Button35.PopoverEvent = "mouseenter";
$rootScope.Button35.PopoverPos = "top";
$rootScope.Button35.Badge = "";
$rootScope.Button35.Icon = "";
$rootScope.Button35.Text = "1";
$rootScope.Button35.Class = "btn btn-primary btn-md ";
$rootScope.Button35.Disabled = "";

$rootScope.Button36 = {};
$rootScope.Button36.ABRole = 2001;
$rootScope.Button36.Hidden = "";
$rootScope.Button36.Title = "";
$rootScope.Button36.TabIndex = -1;
$rootScope.Button36.TooltipText = "";
$rootScope.Button36.TooltipPos = "top";
$rootScope.Button36.PopoverText = "";
$rootScope.Button36.PopoverTitle = "";
$rootScope.Button36.PopoverEvent = "mouseenter";
$rootScope.Button36.PopoverPos = "top";
$rootScope.Button36.Badge = "";
$rootScope.Button36.Icon = "";
$rootScope.Button36.Text = "1";
$rootScope.Button36.Class = "btn btn-primary btn-md ";
$rootScope.Button36.Disabled = "";

$rootScope.Button37 = {};
$rootScope.Button37.ABRole = 2001;
$rootScope.Button37.Hidden = "";
$rootScope.Button37.Title = "";
$rootScope.Button37.TabIndex = -1;
$rootScope.Button37.TooltipText = "";
$rootScope.Button37.TooltipPos = "top";
$rootScope.Button37.PopoverText = "";
$rootScope.Button37.PopoverTitle = "";
$rootScope.Button37.PopoverEvent = "mouseenter";
$rootScope.Button37.PopoverPos = "top";
$rootScope.Button37.Badge = "";
$rootScope.Button37.Icon = "";
$rootScope.Button37.Text = "1";
$rootScope.Button37.Class = "btn btn-primary btn-md ";
$rootScope.Button37.Disabled = "";

$rootScope.Button38 = {};
$rootScope.Button38.ABRole = 2001;
$rootScope.Button38.Hidden = "";
$rootScope.Button38.Title = "";
$rootScope.Button38.TabIndex = -1;
$rootScope.Button38.TooltipText = "";
$rootScope.Button38.TooltipPos = "top";
$rootScope.Button38.PopoverText = "";
$rootScope.Button38.PopoverTitle = "";
$rootScope.Button38.PopoverEvent = "mouseenter";
$rootScope.Button38.PopoverPos = "top";
$rootScope.Button38.Badge = "";
$rootScope.Button38.Icon = "";
$rootScope.Button38.Text = "1";
$rootScope.Button38.Class = "btn btn-primary btn-md ";
$rootScope.Button38.Disabled = "";

$rootScope.Button39 = {};
$rootScope.Button39.ABRole = 2001;
$rootScope.Button39.Hidden = "";
$rootScope.Button39.Title = "";
$rootScope.Button39.TabIndex = -1;
$rootScope.Button39.TooltipText = "";
$rootScope.Button39.TooltipPos = "top";
$rootScope.Button39.PopoverText = "";
$rootScope.Button39.PopoverTitle = "";
$rootScope.Button39.PopoverEvent = "mouseenter";
$rootScope.Button39.PopoverPos = "top";
$rootScope.Button39.Badge = "";
$rootScope.Button39.Icon = "";
$rootScope.Button39.Text = "1";
$rootScope.Button39.Class = "btn btn-primary btn-md ";
$rootScope.Button39.Disabled = "";

$rootScope.Button40 = {};
$rootScope.Button40.ABRole = 2001;
$rootScope.Button40.Hidden = "";
$rootScope.Button40.Title = "";
$rootScope.Button40.TabIndex = -1;
$rootScope.Button40.TooltipText = "";
$rootScope.Button40.TooltipPos = "top";
$rootScope.Button40.PopoverText = "";
$rootScope.Button40.PopoverTitle = "";
$rootScope.Button40.PopoverEvent = "mouseenter";
$rootScope.Button40.PopoverPos = "top";
$rootScope.Button40.Badge = "";
$rootScope.Button40.Icon = "";
$rootScope.Button40.Text = "1";
$rootScope.Button40.Class = "btn btn-primary btn-md ";
$rootScope.Button40.Disabled = "";

$rootScope.Button41 = {};
$rootScope.Button41.ABRole = 2001;
$rootScope.Button41.Hidden = "";
$rootScope.Button41.Title = "";
$rootScope.Button41.TabIndex = -1;
$rootScope.Button41.TooltipText = "";
$rootScope.Button41.TooltipPos = "top";
$rootScope.Button41.PopoverText = "";
$rootScope.Button41.PopoverTitle = "";
$rootScope.Button41.PopoverEvent = "mouseenter";
$rootScope.Button41.PopoverPos = "top";
$rootScope.Button41.Badge = "";
$rootScope.Button41.Icon = "";
$rootScope.Button41.Text = "1";
$rootScope.Button41.Class = "btn btn-primary btn-md ";
$rootScope.Button41.Disabled = "";

$rootScope.Button43 = {};
$rootScope.Button43.ABRole = 2001;
$rootScope.Button43.Hidden = "";
$rootScope.Button43.Title = "";
$rootScope.Button43.TabIndex = -1;
$rootScope.Button43.TooltipText = "";
$rootScope.Button43.TooltipPos = "top";
$rootScope.Button43.PopoverText = "";
$rootScope.Button43.PopoverTitle = "";
$rootScope.Button43.PopoverEvent = "mouseenter";
$rootScope.Button43.PopoverPos = "top";
$rootScope.Button43.Badge = "";
$rootScope.Button43.Icon = "";
$rootScope.Button43.Text = "Buttons";
$rootScope.Button43.Class = "btn btn-primary btn-md ";
$rootScope.Button43.Disabled = "";

$rootScope.Button44 = {};
$rootScope.Button44.ABRole = 2001;
$rootScope.Button44.Hidden = "";
$rootScope.Button44.Title = "";
$rootScope.Button44.TabIndex = -1;
$rootScope.Button44.TooltipText = "";
$rootScope.Button44.TooltipPos = "top";
$rootScope.Button44.PopoverText = "";
$rootScope.Button44.PopoverTitle = "";
$rootScope.Button44.PopoverEvent = "mouseenter";
$rootScope.Button44.PopoverPos = "top";
$rootScope.Button44.Badge = "";
$rootScope.Button44.Icon = "";
$rootScope.Button44.Text = "Back";
$rootScope.Button44.Class = "btn btn-primary btn-md ";
$rootScope.Button44.Disabled = "";

$rootScope.Button10 = {};
$rootScope.Button10.ABRole = 2001;
$rootScope.Button10.Hidden = "";
$rootScope.Button10.Title = "";
$rootScope.Button10.TabIndex = -1;
$rootScope.Button10.TooltipText = "";
$rootScope.Button10.TooltipPos = "top";
$rootScope.Button10.PopoverText = "";
$rootScope.Button10.PopoverTitle = "";
$rootScope.Button10.PopoverEvent = "mouseenter";
$rootScope.Button10.PopoverPos = "top";
$rootScope.Button10.Badge = "";
$rootScope.Button10.Icon = "";
$rootScope.Button10.Text = "Button";
$rootScope.Button10.Class = "btn btn-primary btn-md ";
$rootScope.Button10.Disabled = "";

$rootScope.Button18 = {};
$rootScope.Button18.ABRole = 2003;
$rootScope.Button18.Hidden = "";
$rootScope.Button18.Checked = "checked";
$rootScope.Button18.Title = "";
$rootScope.Button18.TabIndex = 3;
$rootScope.Button18.TooltipText = "";
$rootScope.Button18.TooltipPos = "top";
$rootScope.Button18.PopoverText = "";
$rootScope.Button18.PopoverTitle = "";
$rootScope.Button18.PopoverEvent = "mouseenter";
$rootScope.Button18.PopoverPos = "top";
$rootScope.Button18.Badge = "";
$rootScope.Button18.Icon = "";
$rootScope.Button18.Text = "Toggle";
$rootScope.Button18.Class = "btn btn-primary btn-md 3";
$rootScope.Button18.Disabled = "";

$rootScope.Button42 = {};
$rootScope.Button42.ABRole = 2002;
$rootScope.Button42.Hidden = "";
$rootScope.Button42.Items = [];
$rootScope.Button42.Items.push("5");
$rootScope.Button42.Items.push("3");
$rootScope.Button42.Items.push("1");
$rootScope.Button42.Items.push("56");
$rootScope.Button42.Items.push("6");
$rootScope.Button42.Title = "";
$rootScope.Button42.Alignment = "left";
$rootScope.Button42.TabIndex = -1;
$rootScope.Button42.TooltipText = "";
$rootScope.Button42.TooltipPos = "top";
$rootScope.Button42.PopoverText = "";
$rootScope.Button42.PopoverTitle = "";
$rootScope.Button42.PopoverEvent = "mouseenter";
$rootScope.Button42.PopoverPos = "top";
$rootScope.Button42.Icon = "";
$rootScope.Button42.Text = "Dropdown <i class='fa fa-caret-down'></i>"
$rootScope.Button42.Class = "uib-dropdown-toggle btn btn-primary btn-md ";
$rootScope.Button42.Disabled = "";

$rootScope.Button45 = {};
$rootScope.Button45.ABRole = 2001;
$rootScope.Button45.Hidden = "";
$rootScope.Button45.Title = "";
$rootScope.Button45.TabIndex = -1;
$rootScope.Button45.TooltipText = "";
$rootScope.Button45.TooltipPos = "top";
$rootScope.Button45.PopoverText = "";
$rootScope.Button45.PopoverTitle = "";
$rootScope.Button45.PopoverEvent = "mouseenter";
$rootScope.Button45.PopoverPos = "top";
$rootScope.Button45.Badge = "";
$rootScope.Button45.Icon = "";
$rootScope.Button45.Text = "Back";
$rootScope.Button45.Class = "btn btn-primary btn-md ";
$rootScope.Button45.Disabled = "";

$rootScope.Button19 = {};
$rootScope.Button19.ABRole = 2001;
$rootScope.Button19.Hidden = "";
$rootScope.Button19.Title = "";
$rootScope.Button19.TabIndex = -1;
$rootScope.Button19.TooltipText = "";
$rootScope.Button19.TooltipPos = "top";
$rootScope.Button19.PopoverText = "";
$rootScope.Button19.PopoverTitle = "";
$rootScope.Button19.PopoverEvent = "mouseenter";
$rootScope.Button19.PopoverPos = "top";
$rootScope.Button19.Badge = "";
$rootScope.Button19.Icon = "";
$rootScope.Button19.Text = "Back";
$rootScope.Button19.Class = "btn btn-primary btn-md ";
$rootScope.Button19.Disabled = "";

$rootScope.Input1 = {};
$rootScope.Input1.ABRole = 3001;
$rootScope.Input1.Hidden = "";
$rootScope.Input1.Value = "Input1";
$rootScope.Input1.Title = "";
$rootScope.Input1.TabIndex = -1;
$rootScope.Input1.TooltipText = "";
$rootScope.Input1.TooltipPos = "top";
$rootScope.Input1.PopoverText = "";
$rootScope.Input1.PopoverEvent = "mouseenter";
$rootScope.Input1.PopoverTitle = "";
$rootScope.Input1.PopoverPos = "top";
$rootScope.Input1.PlaceHolder = "";
$rootScope.Input1.Class = "form-control form-control-md ";
$rootScope.Input1.Disabled = "";
$rootScope.Input1.ReadOnly = "";

$rootScope.Input2 = {};
$rootScope.Input2.ABRole = 3002;
$rootScope.Input2.Hidden = "";
$rootScope.Input2.Value = 0;
$rootScope.Input2.Title = "";
$rootScope.Input2.TabIndex = -1;
$rootScope.Input2.TooltipText = "";
$rootScope.Input2.TooltipPos = "top";
$rootScope.Input2.PopoverText = "";
$rootScope.Input2.PopoverEvent = "mouseenter";
$rootScope.Input2.PopoverTitle = "";
$rootScope.Input2.PopoverPos = "top";
$rootScope.Input2.PlaceHolder = "";
$rootScope.Input2.Class = "form-control form-control-md ";
$rootScope.Input2.Disabled = "";
$rootScope.Input2.ReadOnly = "";

$rootScope.Input3 = {};
$rootScope.Input3.ABRole = 3003;
$rootScope.Input3.Hidden = "";
$rootScope.Input3.Value = "Input3";
$rootScope.Input3.Title = "";
$rootScope.Input3.TabIndex = -1;
$rootScope.Input3.TooltipText = "";
$rootScope.Input3.TooltipPos = "top";
$rootScope.Input3.PopoverText = "";
$rootScope.Input3.PopoverEvent = "mouseenter";
$rootScope.Input3.PopoverTitle = "";
$rootScope.Input3.PopoverPos = "top";
$rootScope.Input3.PlaceHolder = "";
$rootScope.Input3.Class = "form-control form-control-md ";
$rootScope.Input3.Disabled = "";
$rootScope.Input3.ReadOnly = "";

$rootScope.Radio3 = {};
$rootScope.Radio3.ABRole = 20003;
$rootScope.Radio3.Hidden = "";
$rootScope.Radio3.Value = "Radio3";
$rootScope.Radio3.Checked = "";
$rootScope.Radio3.Title = "";
$rootScope.Radio3.TabIndex = -1;
$rootScope.Radio3.TooltipText = "";
$rootScope.Radio3.TooltipPos = "top";
$rootScope.Radio3.PopoverText = "";
$rootScope.Radio3.PopoverEvent = "mouseenter";
$rootScope.Radio3.PopoverTitle = "";
$rootScope.Radio3.PopoverPos = "top";
$rootScope.Radio3.Class = "custom-control custom-radio ";
$rootScope.Radio3.Disabled = "";

$rootScope.Checkbox1 = {};
$rootScope.Checkbox1.ABRole = 20002;
$rootScope.Checkbox1.Hidden = "";
$rootScope.Checkbox1.Checked = "checked";
$rootScope.Checkbox1.Title = "";
$rootScope.Checkbox1.TabIndex = -1;
$rootScope.Checkbox1.TooltipText = "";
$rootScope.Checkbox1.TooltipPos = "top";
$rootScope.Checkbox1.PopoverText = "";
$rootScope.Checkbox1.PopoverEvent = "mouseenter";
$rootScope.Checkbox1.PopoverTitle = "";
$rootScope.Checkbox1.PopoverPos = "top";
$rootScope.Checkbox1.Class = "custom-control custom-checkbox ";
$rootScope.Checkbox1.Disabled = "";

$rootScope.Input4 = {};
$rootScope.Input4.ABRole = 3005;
$rootScope.Input4.Hidden = "";
$rootScope.Input4.Value = "Input4";
$rootScope.Input4.Title = "";
$rootScope.Input4.TabIndex = -1;
$rootScope.Input4.TooltipText = "";
$rootScope.Input4.TooltipPos = "top";
$rootScope.Input4.PopoverText = "";
$rootScope.Input4.PopoverEvent = "mouseenter";
$rootScope.Input4.PopoverTitle = "";
$rootScope.Input4.PopoverPos = "top";
$rootScope.Input4.PlaceHolder = "";
$rootScope.Input4.Class = "form-control form-control-md ";
$rootScope.Input4.Disabled = "";
$rootScope.Input4.ReadOnly = "";

$rootScope.Input5 = {};
$rootScope.Input5.ABRole = 3008;
$rootScope.Input5.Hidden = "";
$rootScope.Input5.Value = "";
$rootScope.Input5.Title = "";
$rootScope.Input5.TabIndex = -1;
$rootScope.Input5.TooltipText = "";
$rootScope.Input5.TooltipPos = "top";
$rootScope.Input5.PopoverText = "";
$rootScope.Input5.PopoverEvent = "mouseenter";
$rootScope.Input5.PopoverTitle = "";
$rootScope.Input5.PopoverPos = "top";
$rootScope.Input5.PlaceHolder = "";
$rootScope.Input5.Class = "form-control form-control-md ";
$rootScope.Input5.Disabled = "";
$rootScope.Input5.ReadOnly = "";

$rootScope.Input6 = {};
$rootScope.Input6.ABRole = 3009;
$rootScope.Input6.Hidden = "";
$rootScope.Input6.Value = moment("2018-05-02").toDate();
$rootScope.Input6.Title = "";
$rootScope.Input6.TabIndex = -1;
$rootScope.Input6.TooltipText = "";
$rootScope.Input6.TooltipPos = "top";
$rootScope.Input6.PopoverText = "";
$rootScope.Input6.PopoverEvent = "mouseenter";
$rootScope.Input6.PopoverTitle = "";
$rootScope.Input6.PopoverPos = "top";
$rootScope.Input6.PlaceHolder = "";
$rootScope.Input6.Class = "form-control form-control-md ";
$rootScope.Input6.Disabled = "";
$rootScope.Input6.ReadOnly = "";

$rootScope.Input7 = {};
$rootScope.Input7.ABRole = 3004;
$rootScope.Input7.Hidden = "";
$rootScope.Input7.Value = "Input7";
$rootScope.Input7.Title = "";
$rootScope.Input7.TabIndex = -1;
$rootScope.Input7.TooltipText = "";
$rootScope.Input7.TooltipPos = "top";
$rootScope.Input7.PopoverText = "";
$rootScope.Input7.PopoverEvent = "mouseenter";
$rootScope.Input7.PopoverTitle = "";
$rootScope.Input7.PopoverPos = "top";
$rootScope.Input7.PlaceHolder = "";
$rootScope.Input7.Class = "form-control form-control-md ";
$rootScope.Input7.Disabled = "";
$rootScope.Input7.ReadOnly = "";

$rootScope.Range1 = {};
$rootScope.Range1.ABRole = 3007;
$rootScope.Range1.Hidden = "";
$rootScope.Range1.Min = "0";
$rootScope.Range1.Max = "100";
$rootScope.Range1.Step = "1";
$rootScope.Range1.Value = 50;
$rootScope.Range1.Orient = "";
$rootScope.Range1.Title = "";
$rootScope.Range1.TabIndex = -1;
$rootScope.Range1.TooltipText = "";
$rootScope.Range1.TooltipPos = "top";
$rootScope.Range1.PopoverText = "";
$rootScope.Range1.PopoverEvent = "mouseenter";
$rootScope.Range1.PopoverTitle = "";
$rootScope.Range1.PopoverPos = "top";
$rootScope.Range1.Class = "form-control ";
$rootScope.Range1.Disabled = "";

$rootScope.Input8 = {};
$rootScope.Input8.ABRole = 20001;
$rootScope.Input8.Hidden = "";
$rootScope.Input8.Url = "";
$rootScope.Input8.Data = "";
$rootScope.Input8.Value = null;
$rootScope.Input8.Title = "";
$rootScope.Input8.Accept = "";
$rootScope.Input8.TabIndex = -1;
$rootScope.Input8.TooltipText = "";
$rootScope.Input8.TooltipPos = "top";
$rootScope.Input8.PopoverText = "";
$rootScope.Input8.PopoverEvent = "mouseenter";
$rootScope.Input8.PopoverTitle = "";
$rootScope.Input8.PopoverPos = "top";
$rootScope.Input8.Class = "form-control form-control-md ";
$rootScope.Input8.Disabled = "";

$rootScope.Input9 = {};
$rootScope.Input9.ABRole = 3006;
$rootScope.Input9.Hidden = "";
$rootScope.Input9.Value = "#ffffff";
$rootScope.Input9.Title = "";
$rootScope.Input9.TabIndex = -1;
$rootScope.Input9.TooltipText = "";
$rootScope.Input9.TooltipPos = "top";
$rootScope.Input9.PopoverText = "";
$rootScope.Input9.PopoverEvent = "mouseenter";
$rootScope.Input9.PopoverTitle = "";
$rootScope.Input9.PopoverPos = "top";
$rootScope.Input9.PlaceHolder = "";
$rootScope.Input9.Class = "form-control form-control-md ";
$rootScope.Input9.Disabled = "";
$rootScope.Input9.ReadOnly = "";

$rootScope.Textarea1 = {};
$rootScope.Textarea1.ABRole = 9001;
$rootScope.Textarea1.Hidden = "";
$rootScope.Textarea1.Value = "Textarea1";
$rootScope.Textarea1.Title = "";
$rootScope.Textarea1.TabIndex = -1;
$rootScope.Textarea1.TooltipText = "";
$rootScope.Textarea1.TooltipPos = "top";
$rootScope.Textarea1.PopoverText = "";
$rootScope.Textarea1.PopoverEvent = "mouseenter";
$rootScope.Textarea1.PopoverTitle = "";
$rootScope.Textarea1.PopoverPos = "top";
$rootScope.Textarea1.PlaceHolder = "";
$rootScope.Textarea1.Class = "form-control form-control-md ";
$rootScope.Textarea1.Disabled = "";
$rootScope.Textarea1.ReadOnly = "";

$rootScope.Select1 = {};
$rootScope.Select1.ABRole = 20004;
$rootScope.Select1.Hidden = "";
$rootScope.Select1.Items = [];
$rootScope.Select1.ItemIndex = 0;
$rootScope.Select1.Title = "";
$rootScope.Select1.TabIndex = -1;
$rootScope.Select1.TooltipText = "";
$rootScope.Select1.TooltipPos = "top";
$rootScope.Select1.PopoverText = "";
$rootScope.Select1.PopoverEvent = "mouseenter";
$rootScope.Select1.PopoverTitle = "";
$rootScope.Select1.PopoverPos = "top";
$rootScope.Select1.Class = "custom-select custom-select-md ";
$rootScope.Select1.Disabled = "";

$rootScope.Select2 = {};
$rootScope.Select2.ABRole = 20005;
$rootScope.Select2.Hidden = "";
$rootScope.Select2.Items = [];
$rootScope.Select2.SelItems = [];
$rootScope.Select2.Title = "";
$rootScope.Select2.TabIndex = -1;
$rootScope.Select2.TooltipText = "";
$rootScope.Select2.TooltipPos = "top";
$rootScope.Select2.PopoverText = "";
$rootScope.Select2.PopoverEvent = "mouseenter";
$rootScope.Select2.PopoverTitle = "";
$rootScope.Select2.PopoverPos = "top";
$rootScope.Select2.Class = "form-control form-control-md ";
$rootScope.Select2.Disabled = "";

$rootScope.Typeahead1 = {};
$rootScope.Typeahead1.ABRole = 20006;
$rootScope.Typeahead1.Hidden = "";
$rootScope.Typeahead1.Items = [];
$rootScope.Typeahead1.Value = "Typeahead1";
$rootScope.Typeahead1.PlaceHolder = "";
$rootScope.Typeahead1.Title = "";
$rootScope.Typeahead1.TabIndex = -1;
$rootScope.Typeahead1.TooltipText = "";
$rootScope.Typeahead1.TooltipPos = "top";
$rootScope.Typeahead1.PopoverText = "";
$rootScope.Typeahead1.PopoverEvent = "mouseenter";
$rootScope.Typeahead1.PopoverTitle = "";
$rootScope.Typeahead1.PopoverPos = "top";
$rootScope.Typeahead1.Class = "form-control form-control-md ";
$rootScope.Typeahead1.Disabled = "";

$rootScope.Button20 = {};
$rootScope.Button20.ABRole = 2001;
$rootScope.Button20.Hidden = "";
$rootScope.Button20.Title = "";
$rootScope.Button20.TabIndex = -1;
$rootScope.Button20.TooltipText = "";
$rootScope.Button20.TooltipPos = "top";
$rootScope.Button20.PopoverText = "";
$rootScope.Button20.PopoverTitle = "";
$rootScope.Button20.PopoverEvent = "mouseenter";
$rootScope.Button20.PopoverPos = "top";
$rootScope.Button20.Badge = "";
$rootScope.Button20.Icon = "";
$rootScope.Button20.Text = "Back";
$rootScope.Button20.Class = "btn btn-primary btn-md ";
$rootScope.Button20.Disabled = "";

$rootScope.Label1 = {};
$rootScope.Label1.ABRole = 6002;
$rootScope.Label1.Hidden = "";
$rootScope.Label1.Class = "";
$rootScope.Label1.Text = "Label1";
$rootScope.Label1.Input = "";
$rootScope.Label1.Title = "";
$rootScope.Label1.TooltipText = "";
$rootScope.Label1.TooltipPos = "top";
$rootScope.Label1.PopoverText = "";
$rootScope.Label1.PopoverEvent = "mouseenter";
$rootScope.Label1.PopoverTitle = "";
$rootScope.Label1.PopoverPos = "top";
$rootScope.Label1.Icon = "";

$rootScope.Image1 = {};
$rootScope.Image1.ABRole = 8001;
$rootScope.Image1.Hidden = "";
$rootScope.Image1.Image = "";
$rootScope.Image1.Class = "";
$rootScope.Image1.Title = "";
$rootScope.Image1.TooltipText = "";
$rootScope.Image1.TooltipPos = "top";
$rootScope.Image1.PopoverText = "";
$rootScope.Image1.PopoverEvent = "mouseenter";
$rootScope.Image1.PopoverTitle = "";
$rootScope.Image1.PopoverPos = "top";

$rootScope.Carousel1 = {};
$rootScope.Carousel1.ABRole = 8002;
$rootScope.Carousel1.Hidden = "";
$rootScope.Carousel1.Interval = 5000;
$rootScope.Carousel1.ImageClasses = "";
$rootScope.Carousel1.Source = [];

$rootScope.Progressbar1 = {};
$rootScope.Progressbar1.ABRole = 5001;
$rootScope.Progressbar1.Hidden = "";
$rootScope.Progressbar1.Title = "";
$rootScope.Progressbar1.BarText = "";
$rootScope.Progressbar1.TooltipText = "";
$rootScope.Progressbar1.TooltipPos = "top";
$rootScope.Progressbar1.PopoverText = "";
$rootScope.Progressbar1.PopoverEvent = "mouseenter";
$rootScope.Progressbar1.PopoverTitle = "";
$rootScope.Progressbar1.PopoverPos = "top";
$rootScope.Progressbar1.Class = "progress-bar bg-success progress-bar-striped progress-bar-animated ";
$rootScope.Progressbar1.Percentage = 100;

$rootScope.HtmlContent1 = {};
$rootScope.HtmlContent1.ABRole = 6001;
$rootScope.HtmlContent1.Hidden = "";
$rootScope.HtmlContent1.Class = "ios-inertial-scroll ";
$rootScope.HtmlContent1.Title = "";
$rootScope.HtmlContent1.TooltipText = "";
$rootScope.HtmlContent1.TooltipPos = "top";
$rootScope.HtmlContent1.PopoverText = "";
$rootScope.HtmlContent1.PopoverEvent = "mouseenter";
$rootScope.HtmlContent1.PopoverTitle = "";
$rootScope.HtmlContent1.PopoverPos = "top";

$rootScope.Report1 = {};
$rootScope.Report1.ABRole = 7001;
$rootScope.Report1.Hidden = "";
$rootScope.Report1.Url = "";
$rootScope.Report1.Loading = "Loading...";
$rootScope.Report1.Class = "ios-inertial-scroll ";
$rootScope.Report1.RowClass = "col-12 col-md-6 col-lg-4 col-xl-4";
$rootScope.Report1.Order = "-1";
$rootScope.Report1.Query = "";
$rootScope.Report1.Record = null;
$rootScope.Report1.Data = "";

$rootScope.Menu1 = {};
$rootScope.Menu1.ABRole = 6003;
$rootScope.Menu1.Hidden = "";
$rootScope.Menu1.Items = [];
$rootScope.Menu1.Class = "list-group ";

$rootScope.Chart1 = {};
$rootScope.Chart1.ABRole = 60006;
$rootScope.Chart1.Hidden = "";
$rootScope.Chart1.Kind = "Pie";
$rootScope.Chart1.Class = "text-center chart-base ";
$rootScope.Chart1.Data = [];
$rootScope.Chart1.Series = [];
$rootScope.Chart1.Labels = [];
$rootScope.Chart1.Animate = false;
$rootScope.Chart1.Legend = false;
$rootScope.Chart1.Responsive = false;
$rootScope.Chart1.AspectRatio = false;
$rootScope.Chart1.Options =
{
animation: $rootScope.Chart1.Animate,
responsive: $rootScope.Chart1.Responsive,
maintainAspectRatio: $rootScope.Chart1.AspectRatio
};

$rootScope.Gauge1 = {};
$rootScope.Gauge1.ABRole = 60007;
$rootScope.Gauge1.Hidden = "";
$rootScope.Gauge1.Class = "text-center ";
$rootScope.Gauge1.Units = "";
$rootScope.Gauge1.Glow = "true";
$rootScope.Gauge1.StrokeTicks = "true";
$rootScope.Gauge1.ValueBoxVisible = "true";
$rootScope.Gauge1.ValueTextVisible = "true";
$rootScope.Gauge1.CircleOuterVisible = "true";
$rootScope.Gauge1.CircleMiddleVisible = "true";
$rootScope.Gauge1.CircleInnerVisible = "true";
$rootScope.Gauge1.Title = "";
$rootScope.Gauge1.Value = 0;
$rootScope.Gauge1.ValueFormat = "3.2";
$rootScope.Gauge1.AnimationDelay = 20;
$rootScope.Gauge1.AnimationDuration = 200;
$rootScope.Gauge1.Width = 184;
$rootScope.Gauge1.Height = 42;
$rootScope.Gauge1.Animation = "";
$rootScope.Gauge1.MinorTicks = 10;
$rootScope.Gauge1.MajorTicks = "0 10 20 30 40 50 60 70 80 90 100";
$rootScope.Gauge1.Highlights = "20 60 #eee, 60 80 #ccc, 80 100 #999";
$rootScope.Gauge1.MinValue = 0;
$rootScope.Gauge1.MaxValue = 100;
$rootScope.Gauge1.PlateColor = "#fff";
$rootScope.Gauge1.TitleColor = "#888";
$rootScope.Gauge1.UnitsColor = "#888";
$rootScope.Gauge1.NumbersColor = "#444";
$rootScope.Gauge1.NeedleStartColor = "rgba(240, 128, 128, 1)";
$rootScope.Gauge1.NeedleEndColor = "rgba(255, 160, 122, .9)";
$rootScope.Gauge1.NeedleShadowUpColor = "rgba(2, 255, 255, 0.2)";
$rootScope.Gauge1.NeedleShadowDownColor = "rgba(188, 143, 143, 0.45)";
$rootScope.Gauge1.NeedleCircleOuterStartColor = "#f0f0f0";
$rootScope.Gauge1.NeedleCircleOuterEndColor = "#ccc";
$rootScope.Gauge1.NeedleCircleInnerStartColor = "#e8e8e8";
$rootScope.Gauge1.NeedleCircleInnerEndColor = "#f5f5f5";
$rootScope.Gauge1.ValueBoxRectStartColor = "#888";
$rootScope.Gauge1.ValueBoxRectEndColor = "#666";
$rootScope.Gauge1.ValueBoxBackgroundColor = "#babab2";
$rootScope.Gauge1.ValueBoxShadowColor = "rgba(0, 0, 0, 1)";
$rootScope.Gauge1.ValueTextForegroundColor = "#444";
$rootScope.Gauge1.ValueTextShadowColor = "rgba(0, 0, 0, 0.3)";
$rootScope.Gauge1.CircleShadowColor = "rgba(0, 0, 0, 0.3)";
$rootScope.Gauge1.CircleOuterStartColor = "#ddd";
$rootScope.Gauge1.CircleOuterEndColor = "#aaa";
$rootScope.Gauge1.CircleMiddleStartColor = "#eee";
$rootScope.Gauge1.CircleMiddleEndColor = "#f0f0f0";
$rootScope.Gauge1.CircleInnerStartColor = "#fafafa";
$rootScope.Gauge1.CircleInnerEndColor = "#ccc";
$rootScope.Gauge1.MinorTicksColor = "#666";
$rootScope.Gauge1.MajorTicksColor = "#444";

$rootScope.MediaPlayer1 = {};
$rootScope.MediaPlayer1.ABRole = 10001;
$rootScope.MediaPlayer1.Hidden = "";
$rootScope.MediaPlayer1.Class = "videogular-container ";
$rootScope.MediaPlayer1.Loop = false;
$rootScope.MediaPlayer1.Autoplay = false;
$rootScope.MediaPlayer1.Sources = [];
$rootScope.MediaPlayer1.Tracks = [];

$rootScope.WebCam1 = {};
$rootScope.WebCam1.ABRole = 10002;
$rootScope.WebCam1.Hidden = "";
$rootScope.WebCam1.Error = "";
$rootScope.WebCam1.VideoWidth = "";
$rootScope.WebCam1.VideoHeight = "";
$rootScope.WebCam1.Class = "";

$rootScope.IFrame1 = {};
$rootScope.IFrame1.ABRole = 4001;
$rootScope.IFrame1.Hidden = "";
$rootScope.IFrame1.Url = "";
$rootScope.IFrame1.Class = "ios-iframe-wrapper ";

$rootScope.Container1 = {};
$rootScope.Container1.ABRole = 1001;
$rootScope.Container1.Hidden = "";
$rootScope.Container1.Title = "";
$rootScope.Container1.TooltipText = "";
$rootScope.Container1.TooltipPos = "top";
$rootScope.Container1.PopoverText = "";
$rootScope.Container1.PopoverTitle = "";
$rootScope.Container1.PopoverEvent = "mouseenter";
$rootScope.Container1.PopoverPos = "top";
$rootScope.Container1.Class = "";
    };

    return {
      init : function () {
        setControlVars();
      }
    };
  }
]);

window.App.Plugins = {};

window.App.Module.service
(
  'AppPluginsService',

  ['$rootScope',

  function ($rootScope) {

    var setupPlugins = function () {
      Object.keys(window.App.Plugins).forEach(function (plugin) {
        if (angular.isFunction (window.App.Plugins[plugin])) {
          plugin = window.App.Plugins[plugin].call();
          if (angular.isFunction (plugin.PluginSetupEvent)) {
            plugin.PluginSetupEvent();
          }
          if (angular.isFunction (plugin.PluginDocumentReadyEvent)) {
            angular.element(window.document).ready(
             plugin.PluginDocumentReadyEvent);
          }
          if (angular.isUndefined(window.App.Cordova) &&
           angular.isFunction (plugin.PluginAppReadyEvent)) {
             document.addEventListener('deviceready',
              plugin.PluginAppReadyEvent, false);
          }
        }
      });
    };

    return {
      init : function () {
        setupPlugins();
      }
    };
  }
]);

window.App.Ctrls = angular.module('AppCtrls', []);

window.App.Ctrls.controller
(
  'AppCtrl',

  ['$scope', '$rootScope', '$location', '$uibModal', '$http', '$sce', '$timeout', '$window', '$document', 'blockUI', '$uibPosition',
    'AppEventsService', 'AppGlobalsService', 'AppControlsService', 'AppPluginsService',

  function ($scope, $rootScope, $location, $uibModal, $http, $sce, $timeout, $window, $document, blockUI, $uibPosition,
   AppEventsService, AppGlobalsService, AppControlsService, AppPluginsService) {

    window.App.Scope = $scope;
    window.App.RootScope = $rootScope;

    AppEventsService.init();
    AppGlobalsService.init();
    AppControlsService.init();
    AppPluginsService.init();

    $scope.showView = function (viewName) {
      window.App.Modal.closeAll();
      $rootScope.App.CurrentView = viewName;      
      $rootScope.App.DialogView = '';
      $location.path(viewName);
    };

    $scope.replaceView = function (viewName) {
      window.App.Modal.closeAll();
      $rootScope.App.DialogView = '';
      $rootScope.App.CurrentView = viewName;            
      $location.path(viewName).replace();
    };

    $scope.showModalView = function (viewName, callback) {
      var
        execCallback = null,
        modal = window.App.Modal.insert(viewName);

      $rootScope.App.DialogView = viewName;

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        windowClass: 'dialogView',
        controller: viewName + 'Ctrl',
        templateUrl: 'app/views/' + viewName + '.html'
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );
    };

    $scope.closeModalView = function (modalResult) {
      var
        modal = window.App.Modal.getCurrent();

      $rootScope.App.DialogView = '';

      if (modal !== null) {
        window.App.Modal.getCurrent().close(modalResult);
      }
    };

    $scope.loadVariables = function (text) {

      var
        setVar = function (name, value) {
          var
            newName = '',
            dotPos = name.indexOf('.');

          if (dotPos !== -1) {
            newName = name.split('.');
            if (newName.length === 2) {
              $rootScope[newName[0].trim()][newName[1].trim()] = value;
            } else if (newName.length === 3) {
              // We support up to 3 levels here
              $rootScope[newName[0].trim()][newName[1].trim()][newName[2].trim()] = value;
            }
          } else {
            $rootScope[name] = value;
          }
        };

      var
        varName = '',
        varValue = '',
        isArray = false,
        text = text || '',
        separatorPos = -1;

      angular.forEach(text.split('\n'), function (value, key) {
        separatorPos = value.indexOf('=');
        if ((value.trim() !== '') && (value.substr(0, 1) !== ';') && (separatorPos !== -1)) {
          varName = value.substr(0, separatorPos).trim();
          if (varName !== '') {
            varValue = value.substr(separatorPos + 1, value.length).trim();
            isArray = varValue.substr(0, 1) === '|';
            if (!isArray) {
              setVar(varName, varValue);
            } else {
              setVar(varName, varValue.substr(1, varValue.length).split('|'));
            }
          }
        }
      });
    };

    $scope.alertBox = function (content, type) {
      var
        aType = type || 'info',
        modal = window.App.Modal.insert('builder/views/alertBox.html');

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: true,
        animation: false,
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/alertBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Content: content
            };
          }
        }
      });
      modal.instance.result.then(null, function () {
        window.App.Modal.removeCurrent();
      });
    };

    $scope.inputBox = function (header, buttons,
     inputVar, defaultVal, type, callback) {
      var
        execCallback = null,
        aType = type || 'info',
        aButtons = buttons || 'Ok|Cancel',
        modal = window.App.Modal.insert('builder/views/inputBox.html');

      $rootScope[inputVar] = defaultVal;

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/inputBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Header: header,
              Buttons: aButtons.split('|'),
              InputVar: $rootScope.inputVar
            };
          }
        }
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult, $rootScope[inputVar]);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );
    };

    $scope.messageBox = function (header,
     content, buttons, type, callback) {
      var
        execCallback = null,
        aType = type || 'info',
        aButtons = buttons || 'Ok',
        modal = window.App.Modal.insert('builder/views/messageBox.html');

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/messageBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Header: header,
              Content: content,
              Buttons: aButtons.split('|')
            };
          }
        }
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );
    };

    $scope.alert = function (title, text) {
      if (window.App.Cordova || !('notification' in navigator)) {
        window.alert(text);
      } else {
        navigator.notification.alert(
         text, null, title, null);
      }
    };

    $scope.confirm = function (title, text, callback) {
      if (window.App.Cordova || !('notification' in navigator)) {
        callback(window.confirm(text));
      } else {
        navigator.notification.confirm
        (
          text,
          function (btnIndex) {
            callback(btnIndex === 1);
          },
          title,
          null
        );
      }
    };

    $scope.prompt = function (title, text, defaultVal, callback) {
      if (window.App.Cordova || !('notification' in navigator)) {
        var
          result = window.prompt(text, defaultVal);
        callback(result !== null, result);
      } else {
        navigator.notification.prompt(
          text,
          function (result) {
            callback(result.buttonIndex === 1, result.input1);
          },
          title,
          null,
          defaultVal
        );
      }
    };

    $scope.beep = function (times) {
      if (window.App.Cordova || !('notification' in navigator)) {
        window.App.Utils.playSound
        (
          'builder/sounds/beep/beep.mp3',
          'builder/sounds/beep/beep.ogg'
        );
      } else {
        navigator.notification.beep(times);
      }
    };

    $scope.vibrate = function (milliseconds) {
      if (window.App.Cordova || !('notification' in navigator)) {
        var
          body = angular.element(document.body);
        body.addClass('animated shake');
        setTimeout(function () {
          body.removeClass('animated shake');
        }, milliseconds);
      } else {
        navigator.vibrate(milliseconds);
      }
    };

    $scope.setLocalOption = function (key, value) {
      window.localStorage.setItem(key, value);
    };

    $scope.getLocalOption = function (key) {
      return window.localStorage.getItem(key) || '';
    };

    $scope.removeLocalOption = function (key) {
      window.localStorage.removeItem(key);
    };

    $scope.clearLocalOptions = function () {
      window.localStorage.clear();
    };

    $scope.log = function (text, lineNum) {
      window.App.Debugger.log(text, lineNum);
    };

    $window.TriggerAppOrientationEvent = function () {
      $rootScope.OnAppOrientation();
      $rootScope.$apply();
    };

    $scope.idleStart = function (seconds) {

      $scope.idleStop();
      $rootScope.App.IdleIsIdling = false;

      if($rootScope.App._IdleSeconds !== seconds) {
        $rootScope.App._IdleSeconds = seconds;
      }

      $document.on('mousemove mousedown mousewheel keydown scroll touchstart touchmove DOMMouseScroll', $scope._resetIdle);

      $rootScope.App.IdleIsRunning = true;

      $rootScope.App._IdleTimer = setTimeout(function () {
        $rootScope.App.IdleIsIdling = true;
        $rootScope.OnAppIdleStart();
        $scope.$apply();
      }, $rootScope.App._IdleSeconds * 1000);
    };

    $scope._resetIdle = function () {
      if($rootScope.App.IdleIsIdling) {
        $rootScope.OnAppIdleEnd();
        $rootScope.App.IdleIsIdling = false;
        $scope.$apply();
      }
      $scope.idleStart($rootScope.App._IdleSeconds);
    };

    $scope.idleStop = function () {
      $document.off('mousemove mousedown mousewheel keydown scroll touchstart touchmove DOMMouseScroll', $scope._resetIdle);
      clearTimeout($rootScope.App._IdleTimer);
      $rootScope.App.IdleIsRunning = false;
    };

    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };

    $scope.openWindow = function (url, showLocation, target) {
      var
        options = 'location=';

      if (showLocation) {
        options += 'yes';
      } else {
        options += 'no';
      }

      if (window.App.Cordova) {
        options += ', width=500, height=500, resizable=yes, scrollbars=yes';
      }

      return window.open(url, target, options);
    };

    $scope.closeWindow = function (winRef) {
      if (angular.isObject(winRef) && angular.isFunction (winRef.close)) {
        winRef.close();
      }
    };    
    
    $scope.fileDownload = function(url, subdir, fileName,
     privatelly, headers, errorCallback, successCallback) {
     
      if (window.App.Cordova) {
        if (angular.isFunction(errorCallback)) { 
          errorCallback('-1'); 
        }
        return;
      }
      
      var
        ft = new FileTransfer(),
        root = privatelly.toString() === 'true' ? cordova.file.dataDirectory :
         (device.platform.toLowerCase() === 'ios') ?
          cordova.file.documentsDirectory : cordova.file.externalRootDirectory;

      window.resolveLocalFileSystemURL(root, function (dir) {
        dir.getDirectory(subdir, { create: true, exclusive: false }, function (downloadDir) {
          downloadDir.getFile(fileName, { create: true, exclusive: false }, function (file) {
            ft.download(url, file.toURL(), function(entry) { 
              if (angular.isFunction(successCallback)) { successCallback(entry.toURL(), entry); } 
            }, 
            function(error) {
              if (angular.isFunction(errorCallback)) { errorCallback(4, error); }               
            }, 
            false, 
            { "headers": angular.isObject(headers) ? headers : {} });
          }, 
          function(error) {
            if (angular.isFunction(errorCallback)) { 
              errorCallback(3, error); 
            }               
          });
        }, 
        function(error) {
          if (angular.isFunction(errorCallback)) { 
            errorCallback(2, error); 
          }               
        });
      }, 
      function(error) {
        if (angular.isFunction(errorCallback)) { 
          errorCallback(1, error); 
        }               
      });
    };        

   
}]);

window.App.Ctrls.controller
(
  'AppDialogsCtrl',

  ['$scope', 'properties',

  function ($scope, properties) {
    $scope.Properties = properties;
  }
]);

window.App.Ctrls.controller
(
  'AppEventsCtrl',

  ['$scope', '$rootScope', '$location', '$uibModal', '$http', '$sce', '$timeout', '$window', '$document', 'blockUI', '$uibPosition',

  function ($scope, $rootScope, $location, $uibModal, $http, $sce, $timeout, $window, $document, blockUI, $uibPosition) {

    $rootScope.OnAppHide = function () {
      //__APP_HIDE_EVENT
    };
    
    $rootScope.OnAppShow = function () {
      //__APP_SHOW_EVENT
    };    

    $rootScope.OnAppReady = function () {
      //__APP_READY_EVENT
    };

    $rootScope.OnAppPause = function () {
      //__APP_PAUSE_EVENT
    };

    $rootScope.OnAppKeyUp = function () {
      //__APP_KEY_UP_EVENT
    };

    $rootScope.OnAppKeyDown = function () {
      //__APP_KEY_DOWN_EVENT
    };

    $rootScope.OnAppMouseUp = function () {
      //__APP_MOUSE_UP_EVENT
    };

    $rootScope.OnAppMouseDown = function () {
      //__APP_MOUSE_DOWN_EVENT
    };

    $rootScope.OnAppError = function () {
      //__APP_ERROR_EVENT
    };

    $rootScope.OnAppResize = function () {
      //__APP_RESIZE_EVENT
    };

    $rootScope.OnAppResume = function () {
      //__APP_RESUME_EVENT
    };

    $rootScope.OnAppOnline = function () {
      //__APP_ONLINE_EVENT
    };

    $rootScope.OnAppOffline = function () {
      //__APP_OFFLINE_EVENT
    };

    $rootScope.OnAppIdleEnd = function () {
      //__APP_IDLE_END_EVENT
    };

    $rootScope.OnAppIdleStart = function () {
      //__APP_IDLE_START_EVENT
    };

    $rootScope.OnAppBackButton = function () {
      //__APP_BACK_BUTTON_EVENT
    };

    $rootScope.OnAppMenuButton = function () {
      //__APP_MENU_BUTTON_EVENT
    };

    $rootScope.OnAppViewChange = function () {
      //__APP_VIEW_CHANGE_EVENT
    };

    $rootScope.OnAppOrientation = function () {
      //__APP_ORIENTATION_EVENT
    };

    $rootScope.OnAppVolumeUpButton = function () {
      //__APP_VOLUME_UP_EVENT
    };

    $rootScope.OnAppVolumeDownButton = function () {
      //__APP_VOLUME_DOWN_EVENT
    };
    
    $rootScope.OnAppWebExtensionMsg = function () {
      //__APP_WEBEXTENSION_MSG_EVENT
    };    
  }
]);

angular.element(window.document).ready(function () {
  angular.bootstrap(window.document, ['AppModule']);
});

window.App.Ctrls.controller("MainviewCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.Mainview = {};
$rootScope.Mainview.ABView = true;

window.App.Mainview = {};
window.App.Mainview.Scope = $scope;
$rootScope.App.CurrentView = "Mainview";

angular.element(window.document).ready(function(event){
angular.element(document.querySelector("body")).addClass($rootScope.App.Theme.toLowerCase());
});

$scope.CalenderMainPageClick = function($event) {
$rootScope.CalenderMainPage.Event = $event;

$scope.alertBox("Calendar is stil being developed", "");

};

$scope.RedCafeMainPageClick = function($event) {
$rootScope.RedCafeMainPage.Event = $event;

$scope.showView("RedCafe");

};

$scope.EntrataClick = function($event) {
$rootScope.Entrata.Event = $event;

$scope.openWindow("https://www.iecc.edu/e4/", "", "");

};

$scope.MainMainPageClick = function($event) {
$rootScope.MainMainPage.Event = $event;

$scope.openWindow("https://www.iecc.edu/page.php?page=WVCH", "", "");

};

$scope.Stuff2Click = function($event) {
$rootScope.Stuff2.Event = $event;

$scope.showView("FAQ");

};

$scope.CampusMapClick = function($event) {
$rootScope.CampusMap.Event = $event;

$scope.alertBox("The Campus Map is not ready yet", "");

};

$scope.Stuff4Click = function($event) {
$rootScope.Stuff4.Event = $event;

$scope.showView("SocialNetworks");

};

$scope.Button8Click = function($event) {
$rootScope.Button8.Event = $event;

$scope.showView("DEVstuff");

};

}]);

window.App.Ctrls.controller("CalendarCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.Calendar = {};
$rootScope.Calendar.ABView = true;

window.App.Calendar = {};
window.App.Calendar.Scope = $scope;

$scope.Button7Click = function($event) {
$rootScope.Button7.Event = $event;

window.history.back();

};

}]);

window.App.Ctrls.controller("RedCafeCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.RedCafe = {};
$rootScope.RedCafe.ABView = true;

window.App.RedCafe = {};
window.App.RedCafe.Scope = $scope;

$scope.Button2Click = function($event) {
$rootScope.Button2.Event = $event;

$scope.alertBox("This feature is not available yet. Coming Soon!", "info");

};

$scope.OrderMealClick = function($event) {
$rootScope.OrderMeal.Event = $event;

$scope.alertBox("This feature is not available yet. Coming Soon!", "info");

};

$scope.BackClick = function($event) {
$rootScope.Back.Event = $event;

window.history.back();

};

}]);

window.App.Ctrls.controller("SocialNetworksCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.SocialNetworks = {};
$rootScope.SocialNetworks.ABView = true;

window.App.SocialNetworks = {};
window.App.SocialNetworks.Scope = $scope;

$scope.Button6Click = function($event) {
$rootScope.Button6.Event = $event;

window.history.back();

};

}]);

window.App.Ctrls.controller("FAQCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.FAQ = {};
$rootScope.FAQ.ABView = true;

window.App.FAQ = {};
window.App.FAQ.Scope = $scope;

$scope.Button17Click = function($event) {
$rootScope.Button17.Event = $event;

window.history.back();

};

}]);

window.App.Ctrls.controller("DEVstuffCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.DEVstuff = {};
$rootScope.DEVstuff.ABView = true;

window.App.DEVstuff = {};
window.App.DEVstuff.Scope = $scope;

$scope.Button24Click = function($event) {
$rootScope.Button24.Event = $event;

$scope.showView("DEVinputs1");

};

$scope.Button28Click = function($event) {
$rootScope.Button28.Event = $event;

$scope.showView("DEVaddition");

};

$scope.Button43Click = function($event) {
$rootScope.Button43.Event = $event;

$scope.showView("DEVbuttons");

};

$scope.Button44Click = function($event) {
$rootScope.Button44.Event = $event;

window.history.back();

};

}]);

window.App.Ctrls.controller("DEVbuttonsCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.DEVbuttons = {};
$rootScope.DEVbuttons.ABView = true;

window.App.DEVbuttons = {};
window.App.DEVbuttons.Scope = $scope;

$rootScope.Button42.ItemClick = function(index) {
  $rootScope.Button42.ItemIndex = index;

};

$scope.Button45Click = function($event) {
$rootScope.Button45.Event = $event;

window.history.back();

};

}]);

window.App.Ctrls.controller("DEVinputs1Ctrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.DEVinputs1 = {};
$rootScope.DEVinputs1.ABView = true;

window.App.DEVinputs1 = {};
window.App.DEVinputs1.Scope = $scope;

$scope.Button19Click = function($event) {
$rootScope.Button19.Event = $event;

window.history.back();

};
$scope.Input8Change = function(event) {
  $rootScope.Input8.Event = event;
};

angular.element(window.document).ready(function(event){
  angular.element(document.getElementById("Input8")).on("change", function(event){
    $rootScope.Input8.Url = URL.createObjectURL(event.target.files[0]);
    $scope.Input8Change(event);
  });
});

}]);

window.App.Ctrls.controller("DEVadditionCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.DEVaddition = {};
$rootScope.DEVaddition.ABView = true;

window.App.DEVaddition = {};
window.App.DEVaddition.Scope = $scope;

$scope.Button20Click = function($event) {
$rootScope.Button20.Event = $event;

window.history.back();

};

$rootScope.Carousel1.Click = function(event, index, source) {
  $rootScope.Carousel1.Event = event;
  $rootScope.Carousel1.Index = index;
  $rootScope.Carousel1.Selected = source;

};

$scope.Report1RowClick = function($event, $index, record) {
$rootScope.Report1.Event = $event;
$rootScope.Report1.Index = $index;
$rootScope.Report1.Record = record;

};

$scope.Report1RowDblClick = function($event, $index, record) {
$rootScope.Report1.Event = $event;
$rootScope.Report1.Index = $index;
$rootScope.Report1.Record = record;

};

$scope.Report1RowSwipeLeft = function($event, $index, record) {
$rootScope.Report1.Event = $event;
$rootScope.Report1.Index = $index;
$rootScope.Report1.Record = record;

};

$scope.Report1RowSwipeRight = function($event, $index, record) {
$rootScope.Report1.Event = $event;
$rootScope.Report1.Index = $index;
$rootScope.Report1.Record = record;

};

$rootScope.Report1.GetData = function() {
if($rootScope.Report1.Url == ""){return;}
$http.get($rootScope.Report1.Url)
.then(function(response) {
$rootScope.Report1.Status = response.status;
$rootScope.Report1.Data = response.data;

},
function(response) {
$rootScope.Report1.Status = response.status || "";
$rootScope.Report1.Data = response.data || "";

});
};
$rootScope.$watch("Report1.Url", function() {
  $rootScope.Report1.GetData();
});

$rootScope.Menu1.ItemClick = function(index) {
  $rootScope.Menu1.ItemIndex = index;

};

$rootScope.Chart1.Click = function(points, event) {
  $rootScope.Chart1.Event = event;
  $rootScope.Chart1.Points = points;

};

$rootScope.MediaPlayer1.onCanPlay = function() {

};

$rootScope.MediaPlayer1.onReady = function(API) {
$rootScope.MediaPlayer1.API = API;

};

$rootScope.MediaPlayer1.onError = function() {
};

$rootScope.MediaPlayer1.onComplete = function() {
};

$rootScope.MediaPlayer1.onUpdate = function() {
};

angular.element(window.document).ready(function(event){
  $rootScope.WebCam1.VideoStream = false;
  $rootScope.WebCam1.Video = document.getElementById("WebCam1");
  $rootScope.WebCam1.Canvas = document.getElementById("WebCam1Canvas");
  $rootScope.WebCam1.CanvasContext = $rootScope.WebCam1.Canvas.getContext("2d");

  $rootScope.WebCam1.Video.onloadedmetadata = function() {
    $rootScope.WebCam1.VideoWidth = this.videoWidth;
    $rootScope.WebCam1.VideoHeight = this.videoHeight;
    $rootScope.WebCam1.Canvas.setAttribute("width", this.videoWidth);
    $rootScope.WebCam1.Canvas.setAttribute("height", this.videoHeight);
    $rootScope.WebCam1.CanvasContext.translate($rootScope.WebCam1.Canvas.width, 0);
    $rootScope.WebCam1.CanvasContext.scale(-1, 1);
  };
});

$rootScope.WebCam1.onSuccess = function(stream) {
  $rootScope.WebCam1.VideoStream = stream;
  $rootScope.WebCam1.Video.src = window.URL.createObjectURL(stream);
};

$rootScope.WebCam1.onError = function(error) {

$rootScope.WebCam1.Error = error;
};

}]);
