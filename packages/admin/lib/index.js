"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
function _cms() {
  const data = _interopRequireDefault(require("cms"));
  _cms = function _cms() {
    return data;
  };
  return data;
}
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function fun2() {
  (0, _cms().default)();
  console.log("I am package 1");
}
var _default = exports.default = fun2;