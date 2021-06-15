/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/preloads/nativeOverrides.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/preloads/nativeOverrides.js":
/*!*****************************************!*\
  !*** ./src/preloads/nativeOverrides.js ***!
  \*****************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/**\r\n * This file contains a set of overrides that will convert HTML5 window actions to corresponding Finsemble actions.\r\n * Overrides must be specified for each component via a \"preload\" script. You do this by adding the preload to the\r\n * component config like so:\r\n *\r\n * \t\"Your Component\": {\r\n  \t\t\t...\r\n\t\t\t\"component\": {\r\n\t\t\t\t...\r\n\t\t\t\t\"inject\": false,\r\n\t\t\t\t\"preload\": \"$applicationRoot/preloads/nativeOverrides.js\"\r\n\t\t\t\t...\r\n\t\t\t}\r\n\t\t\t...\r\n\t\t}\r\n\r\n\tIMPORTANT NOTE: If you set that path incorrectly it will cause Finsemble to stop working in that component.\r\n\tCheck your component's chrome console for the existence of FSBL. If it doesn't exist then check your path.\r\n */\n\n/**\r\n * This overrides the browser's built in window.open function by instead creating windows using LauncherClient.spawn.\r\n * This ensures that the Finsemble workspace manager is aware of newly opened windows, that they can participate in\r\n * the on screen workspace management, and that they can be restored with workspaces.\r\n */\nvar originalWindowOpen = window.open;\n\nwindow.open = function (theURL, name, specs, replace) {\n  var params = {};\n\n  if (specs) {\n    let paramList = specs.split(\",\");\n\n    for (let i = 0; i < paramList.length; i++) {\n      let param = paramList[i].split(\"=\");\n      params[param[0]] = param[1];\n    }\n  }\n\n  if (name) {\n    switch (name) {\n      case \"_self\":\n        location.href = theURL;\n        return;\n\n      case \"_top\":\n        window.top.href = theURL;\n        return;\n\n      case \"_parent\":\n        window.parent.href = theURL;\n        return;\n\n      case \"_blank\":\n        break;\n\n      default:\n        params.name = name;\n    }\n  }\n\n  let u = new URL(theURL, window.location);\n  params.url = u.href;\n  var w;\n  FSBL.Clients.LauncherClient.spawn(null, params, (err, response) => {\n    if (err) {\n      console.error(`nativeOverrides.js window.open patch error: ${err}`);\n    } else {\n      w = response.finWindow;\n    }\n  });\n  return w;\n};\n/**\r\n * Overrides the browser's built in alerting. Native alerts are synchronous. They cause the application to cease functioning\r\n * and they create an ugly pop up window. Instead, we funnel these alerts through notifications.\r\n */\n\n\nwindow.alert = function (message) {\n  const notification = new FSBL.Clients.NotificationClient.Notification();\n  notification.source = \"Finsemble\";\n  notification.title = \"Alert\";\n  notification.details = message;\n  notification.actions = [{\n    buttonText: \"OK\",\n    type: FSBL.Clients.NotificationClient.ActionTypes.DISMISS,\n    markAsRead: true\n  }];\n  FSBL.Clients.NotificationClient.notify(notification);\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvcHJlbG9hZHMvbmF0aXZlT3ZlcnJpZGVzLmpzP2NkMTQiXSwibmFtZXMiOlsib3JpZ2luYWxXaW5kb3dPcGVuIiwid2luZG93Iiwib3BlbiIsInRoZVVSTCIsIm5hbWUiLCJzcGVjcyIsInJlcGxhY2UiLCJwYXJhbXMiLCJwYXJhbUxpc3QiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJwYXJhbSIsImxvY2F0aW9uIiwiaHJlZiIsInRvcCIsInBhcmVudCIsInUiLCJVUkwiLCJ1cmwiLCJ3IiwiRlNCTCIsIkNsaWVudHMiLCJMYXVuY2hlckNsaWVudCIsInNwYXduIiwiZXJyIiwicmVzcG9uc2UiLCJjb25zb2xlIiwiZXJyb3IiLCJmaW5XaW5kb3ciLCJhbGVydCIsIm1lc3NhZ2UiLCJub3RpZmljYXRpb24iLCJOb3RpZmljYXRpb25DbGllbnQiLCJOb3RpZmljYXRpb24iLCJzb3VyY2UiLCJ0aXRsZSIsImRldGFpbHMiLCJhY3Rpb25zIiwiYnV0dG9uVGV4dCIsInR5cGUiLCJBY3Rpb25UeXBlcyIsIkRJU01JU1MiLCJtYXJrQXNSZWFkIiwibm90aWZ5Il0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxJQUFJQSxrQkFBa0IsR0FBR0MsTUFBTSxDQUFDQyxJQUFoQzs7QUFDQUQsTUFBTSxDQUFDQyxJQUFQLEdBQWMsVUFBVUMsTUFBVixFQUFrQkMsSUFBbEIsRUFBd0JDLEtBQXhCLEVBQStCQyxPQUEvQixFQUF3QztBQUNyRCxNQUFJQyxNQUFNLEdBQUcsRUFBYjs7QUFDQSxNQUFJRixLQUFKLEVBQVc7QUFDVixRQUFJRyxTQUFTLEdBQUdILEtBQUssQ0FBQ0ksS0FBTixDQUFZLEdBQVosQ0FBaEI7O0FBQ0EsU0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHRixTQUFTLENBQUNHLE1BQTlCLEVBQXNDRCxDQUFDLEVBQXZDLEVBQTJDO0FBQzFDLFVBQUlFLEtBQUssR0FBR0osU0FBUyxDQUFDRSxDQUFELENBQVQsQ0FBYUQsS0FBYixDQUFtQixHQUFuQixDQUFaO0FBQ0FGLFlBQU0sQ0FBQ0ssS0FBSyxDQUFDLENBQUQsQ0FBTixDQUFOLEdBQW1CQSxLQUFLLENBQUMsQ0FBRCxDQUF4QjtBQUNBO0FBQ0Q7O0FBQ0QsTUFBSVIsSUFBSixFQUFVO0FBQ1QsWUFBUUEsSUFBUjtBQUNDLFdBQUssT0FBTDtBQUNDUyxnQkFBUSxDQUFDQyxJQUFULEdBQWdCWCxNQUFoQjtBQUNBOztBQUNELFdBQUssTUFBTDtBQUNDRixjQUFNLENBQUNjLEdBQVAsQ0FBV0QsSUFBWCxHQUFrQlgsTUFBbEI7QUFDQTs7QUFDRCxXQUFLLFNBQUw7QUFDQ0YsY0FBTSxDQUFDZSxNQUFQLENBQWNGLElBQWQsR0FBcUJYLE1BQXJCO0FBQ0E7O0FBQ0QsV0FBSyxRQUFMO0FBQ0M7O0FBQ0Q7QUFDQ0ksY0FBTSxDQUFDSCxJQUFQLEdBQWNBLElBQWQ7QUFiRjtBQWVBOztBQUNELE1BQUlhLENBQUMsR0FBRyxJQUFJQyxHQUFKLENBQVFmLE1BQVIsRUFBZ0JGLE1BQU0sQ0FBQ1ksUUFBdkIsQ0FBUjtBQUNBTixRQUFNLENBQUNZLEdBQVAsR0FBYUYsQ0FBQyxDQUFDSCxJQUFmO0FBRUEsTUFBSU0sQ0FBSjtBQUNBQyxNQUFJLENBQUNDLE9BQUwsQ0FBYUMsY0FBYixDQUE0QkMsS0FBNUIsQ0FBa0MsSUFBbEMsRUFBd0NqQixNQUF4QyxFQUFnRCxDQUFDa0IsR0FBRCxFQUFNQyxRQUFOLEtBQW1CO0FBQ2xFLFFBQUlELEdBQUosRUFBUztBQUNSRSxhQUFPLENBQUNDLEtBQVIsQ0FBZSwrQ0FBOENILEdBQUksRUFBakU7QUFDQSxLQUZELE1BRU87QUFDTkwsT0FBQyxHQUFHTSxRQUFRLENBQUNHLFNBQWI7QUFDQTtBQUNELEdBTkQ7QUFPQSxTQUFPVCxDQUFQO0FBQ0EsQ0F0Q0Q7QUF3Q0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBbkIsTUFBTSxDQUFDNkIsS0FBUCxHQUFlLFVBQVVDLE9BQVYsRUFBbUI7QUFDakMsUUFBTUMsWUFBWSxHQUFHLElBQUlYLElBQUksQ0FBQ0MsT0FBTCxDQUFhVyxrQkFBYixDQUFnQ0MsWUFBcEMsRUFBckI7QUFDQUYsY0FBWSxDQUFDRyxNQUFiLEdBQXNCLFdBQXRCO0FBQ0FILGNBQVksQ0FBQ0ksS0FBYixHQUFxQixPQUFyQjtBQUNBSixjQUFZLENBQUNLLE9BQWIsR0FBdUJOLE9BQXZCO0FBQ0FDLGNBQVksQ0FBQ00sT0FBYixHQUF1QixDQUN0QjtBQUNDQyxjQUFVLEVBQUUsSUFEYjtBQUVDQyxRQUFJLEVBQUVuQixJQUFJLENBQUNDLE9BQUwsQ0FBYVcsa0JBQWIsQ0FBZ0NRLFdBQWhDLENBQTRDQyxPQUZuRDtBQUdDQyxjQUFVLEVBQUU7QUFIYixHQURzQixDQUF2QjtBQU9BdEIsTUFBSSxDQUFDQyxPQUFMLENBQWFXLGtCQUFiLENBQWdDVyxNQUFoQyxDQUF1Q1osWUFBdkM7QUFDQSxDQWJEIiwiZmlsZSI6Ii4vc3JjL3ByZWxvYWRzL25hdGl2ZU92ZXJyaWRlcy5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUaGlzIGZpbGUgY29udGFpbnMgYSBzZXQgb2Ygb3ZlcnJpZGVzIHRoYXQgd2lsbCBjb252ZXJ0IEhUTUw1IHdpbmRvdyBhY3Rpb25zIHRvIGNvcnJlc3BvbmRpbmcgRmluc2VtYmxlIGFjdGlvbnMuXHJcbiAqIE92ZXJyaWRlcyBtdXN0IGJlIHNwZWNpZmllZCBmb3IgZWFjaCBjb21wb25lbnQgdmlhIGEgXCJwcmVsb2FkXCIgc2NyaXB0LiBZb3UgZG8gdGhpcyBieSBhZGRpbmcgdGhlIHByZWxvYWQgdG8gdGhlXHJcbiAqIGNvbXBvbmVudCBjb25maWcgbGlrZSBzbzpcclxuICpcclxuICogXHRcIllvdXIgQ29tcG9uZW50XCI6IHtcclxuICBcdFx0XHQuLi5cclxuXHRcdFx0XCJjb21wb25lbnRcIjoge1xyXG5cdFx0XHRcdC4uLlxyXG5cdFx0XHRcdFwiaW5qZWN0XCI6IGZhbHNlLFxyXG5cdFx0XHRcdFwicHJlbG9hZFwiOiBcIiRhcHBsaWNhdGlvblJvb3QvcHJlbG9hZHMvbmF0aXZlT3ZlcnJpZGVzLmpzXCJcclxuXHRcdFx0XHQuLi5cclxuXHRcdFx0fVxyXG5cdFx0XHQuLi5cclxuXHRcdH1cclxuXHJcblx0SU1QT1JUQU5UIE5PVEU6IElmIHlvdSBzZXQgdGhhdCBwYXRoIGluY29ycmVjdGx5IGl0IHdpbGwgY2F1c2UgRmluc2VtYmxlIHRvIHN0b3Agd29ya2luZyBpbiB0aGF0IGNvbXBvbmVudC5cclxuXHRDaGVjayB5b3VyIGNvbXBvbmVudCdzIGNocm9tZSBjb25zb2xlIGZvciB0aGUgZXhpc3RlbmNlIG9mIEZTQkwuIElmIGl0IGRvZXNuJ3QgZXhpc3QgdGhlbiBjaGVjayB5b3VyIHBhdGguXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgb3ZlcnJpZGVzIHRoZSBicm93c2VyJ3MgYnVpbHQgaW4gd2luZG93Lm9wZW4gZnVuY3Rpb24gYnkgaW5zdGVhZCBjcmVhdGluZyB3aW5kb3dzIHVzaW5nIExhdW5jaGVyQ2xpZW50LnNwYXduLlxyXG4gKiBUaGlzIGVuc3VyZXMgdGhhdCB0aGUgRmluc2VtYmxlIHdvcmtzcGFjZSBtYW5hZ2VyIGlzIGF3YXJlIG9mIG5ld2x5IG9wZW5lZCB3aW5kb3dzLCB0aGF0IHRoZXkgY2FuIHBhcnRpY2lwYXRlIGluXHJcbiAqIHRoZSBvbiBzY3JlZW4gd29ya3NwYWNlIG1hbmFnZW1lbnQsIGFuZCB0aGF0IHRoZXkgY2FuIGJlIHJlc3RvcmVkIHdpdGggd29ya3NwYWNlcy5cclxuICovXHJcblxyXG52YXIgb3JpZ2luYWxXaW5kb3dPcGVuID0gd2luZG93Lm9wZW47XHJcbndpbmRvdy5vcGVuID0gZnVuY3Rpb24gKHRoZVVSTCwgbmFtZSwgc3BlY3MsIHJlcGxhY2UpIHtcclxuXHR2YXIgcGFyYW1zID0ge307XHJcblx0aWYgKHNwZWNzKSB7XHJcblx0XHRsZXQgcGFyYW1MaXN0ID0gc3BlY3Muc3BsaXQoXCIsXCIpO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBwYXJhbUxpc3QubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0bGV0IHBhcmFtID0gcGFyYW1MaXN0W2ldLnNwbGl0KFwiPVwiKTtcclxuXHRcdFx0cGFyYW1zW3BhcmFtWzBdXSA9IHBhcmFtWzFdO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRpZiAobmFtZSkge1xyXG5cdFx0c3dpdGNoIChuYW1lKSB7XHJcblx0XHRcdGNhc2UgXCJfc2VsZlwiOlxyXG5cdFx0XHRcdGxvY2F0aW9uLmhyZWYgPSB0aGVVUkw7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRjYXNlIFwiX3RvcFwiOlxyXG5cdFx0XHRcdHdpbmRvdy50b3AuaHJlZiA9IHRoZVVSTDtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdGNhc2UgXCJfcGFyZW50XCI6XHJcblx0XHRcdFx0d2luZG93LnBhcmVudC5ocmVmID0gdGhlVVJMO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0Y2FzZSBcIl9ibGFua1wiOlxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdHBhcmFtcy5uYW1lID0gbmFtZTtcclxuXHRcdH1cclxuXHR9XHJcblx0bGV0IHUgPSBuZXcgVVJMKHRoZVVSTCwgd2luZG93LmxvY2F0aW9uKTtcclxuXHRwYXJhbXMudXJsID0gdS5ocmVmO1xyXG5cclxuXHR2YXIgdztcclxuXHRGU0JMLkNsaWVudHMuTGF1bmNoZXJDbGllbnQuc3Bhd24obnVsbCwgcGFyYW1zLCAoZXJyLCByZXNwb25zZSkgPT4ge1xyXG5cdFx0aWYgKGVycikge1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKGBuYXRpdmVPdmVycmlkZXMuanMgd2luZG93Lm9wZW4gcGF0Y2ggZXJyb3I6ICR7ZXJyfWApO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dyA9IHJlc3BvbnNlLmZpbldpbmRvdztcclxuXHRcdH1cclxuXHR9KTtcclxuXHRyZXR1cm4gdztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBPdmVycmlkZXMgdGhlIGJyb3dzZXIncyBidWlsdCBpbiBhbGVydGluZy4gTmF0aXZlIGFsZXJ0cyBhcmUgc3luY2hyb25vdXMuIFRoZXkgY2F1c2UgdGhlIGFwcGxpY2F0aW9uIHRvIGNlYXNlIGZ1bmN0aW9uaW5nXHJcbiAqIGFuZCB0aGV5IGNyZWF0ZSBhbiB1Z2x5IHBvcCB1cCB3aW5kb3cuIEluc3RlYWQsIHdlIGZ1bm5lbCB0aGVzZSBhbGVydHMgdGhyb3VnaCBub3RpZmljYXRpb25zLlxyXG4gKi9cclxud2luZG93LmFsZXJ0ID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuXHRjb25zdCBub3RpZmljYXRpb24gPSBuZXcgRlNCTC5DbGllbnRzLk5vdGlmaWNhdGlvbkNsaWVudC5Ob3RpZmljYXRpb24oKTtcclxuXHRub3RpZmljYXRpb24uc291cmNlID0gXCJGaW5zZW1ibGVcIjtcclxuXHRub3RpZmljYXRpb24udGl0bGUgPSBcIkFsZXJ0XCI7XHJcblx0bm90aWZpY2F0aW9uLmRldGFpbHMgPSBtZXNzYWdlO1xyXG5cdG5vdGlmaWNhdGlvbi5hY3Rpb25zID0gW1xyXG5cdFx0e1xyXG5cdFx0XHRidXR0b25UZXh0OiBcIk9LXCIsXHJcblx0XHRcdHR5cGU6IEZTQkwuQ2xpZW50cy5Ob3RpZmljYXRpb25DbGllbnQuQWN0aW9uVHlwZXMuRElTTUlTUyxcclxuXHRcdFx0bWFya0FzUmVhZDogdHJ1ZSxcclxuXHRcdH0sXHJcblx0XTtcclxuXHRGU0JMLkNsaWVudHMuTm90aWZpY2F0aW9uQ2xpZW50Lm5vdGlmeShub3RpZmljYXRpb24pO1xyXG59O1xyXG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/preloads/nativeOverrides.js\n");

/***/ })

/******/ });