'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Link = function (_React$Component) {
	_inherits(Link, _React$Component);

	function Link() {
		_classCallCheck(this, Link);

		return _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).apply(this, arguments));
	}

	_createClass(Link, [{
		key: 'render',
		value: function render() {
			var _props = this.props,
			    title = _props.title,
			    to = _props.to,
			    className = _props.className,
			    style = _props.style,
			    children = _props.children,
			    onClick = _props.onClick;

			var link = null;
			if (to) {
				if (/^(tel|sms|mailto):/i.test(to) || /^([a-z]+:)?\/\//i.test(to)) {
					link = to;
				} else {
					link = '#' + to;
				}
			}
			return _react2.default.createElement(
				'a',
				{
					title: title,
					href: link,
					className: className,
					style: style,
					onClick: onClick
				},
				children
			);
		}
	}]);

	return Link;
}(_react2.default.Component);

Link.propTypes = {
	title: _propTypes2.default.string,
	to: _propTypes2.default.string,
	className: _propTypes2.default.string,
	style: _propTypes2.default.shape(),
	children: _propTypes2.default.node,
	onClick: _propTypes2.default.func
};
Link.defaultProps = {
	title: '',
	to: '',
	className: '',
	style: {},
	children: _propTypes2.default.node,
	onClick: function onClick() {}
};
exports.default = Link;