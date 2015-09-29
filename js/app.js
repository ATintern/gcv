// all the modules that the app depends on
var contextApp = angular.module('contextApp', [
  'ngRoute',
  'contextControllers',
  'contextServices',
  'ngCookies'
]);

// request the routeProvider to be injected into our config function
contextApp.config(['$routeProvider',
  // define our routes
  function($routeProvider) {
    $routeProvider.
      when('/:focusName', {
        template: ' ', // just fires the controller
        controller: 'ViewerCtrl'
      });
  }]);

// custom validation used to ensure that form inputs are integers
var INTEGER_REGEXP = /^\-?\d+$/;
contextApp.directive('integer', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.integer = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }
        if (INTEGER_REGEXP.test(viewValue)) {
          // it is valid
          return true;
        }
        // it is invalid
        return false;
      };
    }
  };
});

// propagate angular error classes to twitter bootstrap groups
contextApp
.directive('showErrors', function($timeout) {
  return {
    restrict: 'A',
    require: '^form',
    link: function (scope, el, attrs, formCtrl) {
      // find the text box element, which has the 'name' attribute
      var inputEl   = el[0].querySelector("[name]");
      // convert the native text box element to an angular element
      var inputNgEl = angular.element(inputEl);
      // get the name on the text box
      var inputName = inputNgEl.attr('name');
      // only apply the has-error class after the user leaves the text box
      var blurred = false;
      inputNgEl.bind('blur', function() {
        blurred = true;
        el.toggleClass('has-error', formCtrl[inputName].$invalid);
      });
      scope.$watch(function() {
        return formCtrl[inputName].$invalid
      }, function(invalid) {
        // we only want to toggle the has-error class after the blur
        // event or if the control becomes valid
        if (!blurred && invalid) { return }
        el.toggleClass('has-error', invalid);
      });
      scope.$on('show-errors-check-validity', function() {
        el.toggleClass('has-error', formCtrl[inputName].$invalid);
      });
      scope.$on('show-errors-reset', function() {
        $timeout(function() {
          el.removeClass('has-error');
        }, 0, false);
      });
    }
  }
});

contextApp
.directive('compile', ['$compile', function ($compile) {
  return function(scope, element, attrs) {
    scope.$watch(
      function(scope) {
        // watch the 'compile' expression for changes
        return scope.$eval(attrs.compile);
      },
      function(value) {
        // when the 'compile' expression changes
        // assign it into the current DOM
        element.html(value);
        // compile the new DOM and link it to the current
        // scope.
        // NOTE: we only compile .childNodes so that
        // we don't get into infinite loop compiling ourselves
        $compile(element.contents())(scope);
      }
    );
  };
}])
