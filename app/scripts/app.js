

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
    $routeProvider.otherwise({redirectTo: "/Main"})
    .when("/Main", {controller: "MainCtrl", templateUrl: "app/views/Main.html"})
    .when("/FAQView", {controller: "FAQViewCtrl", templateUrl: "app/views/FAQView.html"})
    .when("/WVCSiteView", {controller: "WVCSiteViewCtrl", templateUrl: "app/views/WVCSiteView.html"})
    .when("/EnrtataSiteView", {controller: "EnrtataSiteViewCtrl", templateUrl: "app/views/EnrtataSiteView.html"});
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
$rootScope.App.ID = "com.WVCtribe";
$rootScope.App.Name = "WVC App";
$rootScope.App.ShortName = "New App 2";
$rootScope.App.Version = "1.0.0";
$rootScope.App.Description = "WVC App for WVC services";
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
      

$rootScope.Image11 = {};
$rootScope.Image11.ABRole = 8001;
$rootScope.Image11.Hidden = "";
$rootScope.Image11.Image = "app/images/stars.jpg";
$rootScope.Image11.Class = "";
$rootScope.Image11.Title = "";
$rootScope.Image11.TooltipText = "";
$rootScope.Image11.TooltipPos = "top";
$rootScope.Image11.PopoverText = "";
$rootScope.Image11.PopoverEvent = "mouseenter";
$rootScope.Image11.PopoverTitle = "";
$rootScope.Image11.PopoverPos = "top";

$rootScope.Image8 = {};
$rootScope.Image8.ABRole = 8001;
$rootScope.Image8.Hidden = "";
$rootScope.Image8.Image = "app/images/yourcalendar.png";
$rootScope.Image8.Class = "";
$rootScope.Image8.Title = "";
$rootScope.Image8.TooltipText = "";
$rootScope.Image8.TooltipPos = "top";
$rootScope.Image8.PopoverText = "";
$rootScope.Image8.PopoverEvent = "mouseenter";
$rootScope.Image8.PopoverTitle = "";
$rootScope.Image8.PopoverPos = "top";

$rootScope.Image6 = {};
$rootScope.Image6.ABRole = 8001;
$rootScope.Image6.Hidden = "";
$rootScope.Image6.Image = "app/images/WVC-RED-CAFE-BACKUP.png";
$rootScope.Image6.Class = "";
$rootScope.Image6.Title = "";
$rootScope.Image6.TooltipText = "";
$rootScope.Image6.TooltipPos = "top";
$rootScope.Image6.PopoverText = "";
$rootScope.Image6.PopoverEvent = "mouseenter";
$rootScope.Image6.PopoverTitle = "";
$rootScope.Image6.PopoverPos = "top";

$rootScope.Image4 = {};
$rootScope.Image4.ABRole = 8001;
$rootScope.Image4.Hidden = "";
$rootScope.Image4.Image = "app/images/entrata.png";
$rootScope.Image4.Class = "";
$rootScope.Image4.Title = "";
$rootScope.Image4.TooltipText = "";
$rootScope.Image4.TooltipPos = "top";
$rootScope.Image4.PopoverText = "";
$rootScope.Image4.PopoverEvent = "mouseenter";
$rootScope.Image4.PopoverTitle = "";
$rootScope.Image4.PopoverPos = "top";

$rootScope.Image12 = {};
$rootScope.Image12.ABRole = 8001;
$rootScope.Image12.Hidden = "";
$rootScope.Image12.Image = "app/images/logo_WVC.png";
$rootScope.Image12.Class = "";
$rootScope.Image12.Title = "";
$rootScope.Image12.TooltipText = "";
$rootScope.Image12.TooltipPos = "top";
$rootScope.Image12.PopoverText = "";
$rootScope.Image12.PopoverEvent = "mouseenter";
$rootScope.Image12.PopoverTitle = "";
$rootScope.Image12.PopoverPos = "top";

$rootScope.FAQImage = {};
$rootScope.FAQImage.ABRole = 8001;
$rootScope.FAQImage.Hidden = "";
$rootScope.FAQImage.Image = "app/images/FAQ_icon.svg.png";
$rootScope.FAQImage.Class = "";
$rootScope.FAQImage.Title = "";
$rootScope.FAQImage.TooltipText = "";
$rootScope.FAQImage.TooltipPos = "top";
$rootScope.FAQImage.PopoverText = "";
$rootScope.FAQImage.PopoverEvent = "mouseenter";
$rootScope.FAQImage.PopoverTitle = "";
$rootScope.FAQImage.PopoverPos = "top";

$rootScope.Image2 = {};
$rootScope.Image2.ABRole = 8001;
$rootScope.Image2.Hidden = "";
$rootScope.Image2.Image = "app/images/maps_dock_icon_by_kaboom88-d32gndf.png";
$rootScope.Image2.Class = "";
$rootScope.Image2.Title = "";
$rootScope.Image2.TooltipText = "";
$rootScope.Image2.TooltipPos = "top";
$rootScope.Image2.PopoverText = "";
$rootScope.Image2.PopoverEvent = "mouseenter";
$rootScope.Image2.PopoverTitle = "";
$rootScope.Image2.PopoverPos = "top";

$rootScope.FAQiFrame = {};
$rootScope.FAQiFrame.ABRole = 4001;
$rootScope.FAQiFrame.Hidden = "";
$rootScope.FAQiFrame.Url = "app/files/FAQ/index.html";
$rootScope.FAQiFrame.Class = "ios-iframe-wrapper ";

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
$rootScope.Button8.Text = "Home";
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
$rootScope.Button9.Text = "Forward";
$rootScope.Button9.Class = "btn btn-primary btn-md ";
$rootScope.Button9.Disabled = "";

$rootScope.WVCSiteiFrame = {};
$rootScope.WVCSiteiFrame.ABRole = 4001;
$rootScope.WVCSiteiFrame.Hidden = "";
$rootScope.WVCSiteiFrame.Url = "https://www.iecc.edu/page.php?page=WVCH";
$rootScope.WVCSiteiFrame.Class = "ios-iframe-wrapper ";

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
$rootScope.Button5.Text = "Home";
$rootScope.Button5.Class = "btn btn-primary btn-md ";
$rootScope.Button5.Disabled = "";

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
$rootScope.Button4.Text = "Back";
$rootScope.Button4.Class = "btn btn-primary btn-md ";
$rootScope.Button4.Disabled = "";

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
$rootScope.Button6.Text = "Forward";
$rootScope.Button6.Class = "btn btn-primary btn-md ";
$rootScope.Button6.Disabled = "";

$rootScope.EntrataiFrame = {};
$rootScope.EntrataiFrame.ABRole = 4001;
$rootScope.EntrataiFrame.Hidden = "";
$rootScope.EntrataiFrame.Url = "https://www.iecc.edu/e4/";
$rootScope.EntrataiFrame.Class = "ios-iframe-wrapper ";

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
$rootScope.Button2.Text = "Home";
$rootScope.Button2.Class = "btn btn-primary btn-md ";
$rootScope.Button2.Disabled = "";

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
$rootScope.Button1.Text = "Back";
$rootScope.Button1.Class = "btn btn-primary btn-md ";
$rootScope.Button1.Disabled = "";

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
$rootScope.Button3.Text = "Forward";
$rootScope.Button3.Class = "btn btn-primary btn-md ";
$rootScope.Button3.Disabled = "";
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

window.App.Ctrls.controller("MainCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.Main = {};
$rootScope.Main.ABView = true;

window.App.Main = {};
window.App.Main.Scope = $scope;
$rootScope.App.CurrentView = "Main";

angular.element(window.document).ready(function(event){
angular.element(document.querySelector("body")).addClass($rootScope.App.Theme.toLowerCase());
});

$scope.Image8Click = function($event) {
$rootScope.Image8.Event = $event;

$scope.messageBox("Work in Progress", "This function is not avaible yet. When it is, you\x27ll be able to view the calendar for various events, as well as add your own custom events!", "Sounds Cool!", "primary", (("".length > 0) && angular.isFunction($scope[""])) ? $scope[""] : null);

};

$scope.Image6Click = function($event) {
$rootScope.Image6.Event = $event;

$scope.messageBox("Work in Progress", "This function is not avaible yet. When it is, you\x27ll be able to view the menu as well as make orders right from within the app!", "Sounds Cool!", "primary", (("".length > 0) && angular.isFunction($scope[""])) ? $scope[""] : null);

};

$scope.Image4Click = function($event) {
$rootScope.Image4.Event = $event;

$scope.showView("EnrtataSiteView");

};

$scope.Image12Click = function($event) {
$rootScope.Image12.Event = $event;

$scope.showView("WVCSiteView");

};

$scope.FAQImageClick = function($event) {
$rootScope.FAQImage.Event = $event;

$scope.showView("FAQView");

};

$scope.Image2Click = function($event) {
$rootScope.Image2.Event = $event;

$scope.messageBox("Work in Progress", "This function is not avaible yet. When it is, you\x27ll be able to view the map of Campus and do other cool stuff!", "Sounds Cool!", "primary", (("".length > 0) && angular.isFunction($scope[""])) ? $scope[""] : null);

};

}]);

window.App.Ctrls.controller("FAQViewCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.FAQView = {};
$rootScope.FAQView.ABView = true;

window.App.FAQView = {};
window.App.FAQView.Scope = $scope;

$scope.Button8Click = function($event) {
$rootScope.Button8.Event = $event;

$scope.showView("Main");

};

$scope.Button7Click = function($event) {
$rootScope.Button7.Event = $event;

window.history.back();

};

$scope.Button9Click = function($event) {
$rootScope.Button9.Event = $event;

window.history.forward();

};

}]);

window.App.Ctrls.controller("WVCSiteViewCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.WVCSiteView = {};
$rootScope.WVCSiteView.ABView = true;

window.App.WVCSiteView = {};
window.App.WVCSiteView.Scope = $scope;

$scope.Button5Click = function($event) {
$rootScope.Button5.Event = $event;

$scope.showView("Main");

};

$scope.Button4Click = function($event) {
$rootScope.Button4.Event = $event;

window.history.back();

};

$scope.Button6Click = function($event) {
$rootScope.Button6.Event = $event;

window.history.forward();

};

}]);

window.App.Ctrls.controller("EnrtataSiteViewCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.EnrtataSiteView = {};
$rootScope.EnrtataSiteView.ABView = true;

window.App.EnrtataSiteView = {};
window.App.EnrtataSiteView.Scope = $scope;

$scope.Button2Click = function($event) {
$rootScope.Button2.Event = $event;

$scope.showView("Main");

};

$scope.Button1Click = function($event) {
$rootScope.Button1.Event = $event;

window.history.back();

};

$scope.Button3Click = function($event) {
$rootScope.Button3.Event = $event;

window.history.forward();

};

}]);
