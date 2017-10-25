var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React from 'react';
import PropTypes from 'prop-types';

import { observer, history } from './h';

// route
var Route = function Route() {};

Route.propTypes = {
	path: PropTypes.string.isRequired,
	component: PropTypes.func.isRequired
};

export default Route;

// route container
export var Container = function (_React$Component) {
	_inherits(Container, _React$Component);

	function Container() {
		var _ref;

		var _temp, _this, _ret;

		_classCallCheck(this, Container);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Container.__proto__ || Object.getPrototypeOf(Container)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = function (nextProps) {
			if (JSON.stringify(nextProps.context) === JSON.stringify(_this.props.context) && nextProps.component === _this.props.component) {
				if (nextProps.style.transform !== _this.props.style.transform) {
					Object.keys(nextProps.style).forEach(function (name) {
						_this.container.style[name] = nextProps.style[name];
					});
				}
				return false;
			}
			return true;
		}, _temp), _possibleConstructorReturn(_this, _ret);
	}

	_createClass(Container, [{
		key: 'render',
		value: function render() {
			var _this2 = this;

			var _props = this.props,
			    style = _props.style,
			    context = _props.context,
			    component = _props.component;

			var Component = component;

			return React.createElement(
				'div',
				{
					style: style,
					'data-uri': context.uri,
					ref: function ref(_ref2) {
						_this2.container = _ref2;
					}
				},
				React.createElement(Component, {
					context: _extends({}, context, { observer: observer, navigateTo: history.navigateTo, backTo: history.backTo, replaceWith: history.replaceWith }),
					key: context.uri
				})
			);
		}
	}]);

	return Container;
}(React.Component);
Container.propTypes = {
	component: PropTypes.func.isRequired,
	context: PropTypes.shape()
};
Container.defaultProps = {
	context: {}
};