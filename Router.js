'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Route = require('./Route');

var _Route2 = _interopRequireDefault(_Route);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Router = function (_React$Component) {
	_inherits(Router, _React$Component);

	function Router(props) {
		_classCallCheck(this, Router);

		var _this = _possibleConstructorReturn(this, (Router.__proto__ || Object.getPrototypeOf(Router)).call(this, props));

		_this.hashChange = function (ev) {
			var p = ev.newURL.indexOf('#');
			var hash = p === -1 ? '' : ev.newURL.slice(p + 1);
			_this.parseHash(hash);
		};

		_this.parseHash = function (hash) {
			var _this$parseURL = _this.parseURL(hash),
			    url = _this$parseURL.url,
			    pathname = _this$parseURL.pathname,
			    args = _this$parseURL.args,
			    params = _this$parseURL.params;

			_this.routes.forEach(function (route) {
				var Component = route.Component,
				    path = route.path,
				    rule = route.rule,
				    variables = route.variables;

				var matches = pathname.match(rule);
				if (path === pathname || matches) {
					var match = {};
					if (matches) {
						for (var i = 1; i < matches.length; i += 1) {
							match[variables[i - 1]] = _this.parseValue(matches[i]);
						}
					}
					var page = {
						Component: Component,
						match: match,
						params: params,
						pathname: pathname,
						args: args
					};
					var pages = Object.assign({}, _this.state.pages);
					pages[url] = page;
					_this.setState({ pages: pages, url: url });
				}
			});
		};

		_this.parseURL = function (url) {
			var q = url.indexOf('?');
			var pathname = q === -1 ? url : url.slice(0, q);
			var args = q === -1 ? '' : url.slice(q + 1);
			var params = {};
			if (args.length > 0) {
				args.split('&').forEach(function (item) {
					var p = item.indexOf('=');
					if (p === -1) {
						params[item] = null;
					} else {
						params[item.slice(0, p)] = _this.parseValue(unescape(item.slice(p + 1)));
					}
				});
			}
			return { url: url, pathname: pathname, args: args, params: params };
		};

		_this.parseValue = function (value) {
			if (/^([0-9]|[1-9][0-9]+)$/.test(value)) {
				return parseInt(value, 10);
			} else if (/^\d*\.\d+$/.test(value)) {
				return parseFloat(value);
			} else if (value === 'true') {
				return true;
			} else if (value === 'false') {
				return false;
			} else if (value === 'null' || value === '') {
				return null;
			} else if (value === 'undefined') {
				return undefined;
			}
			return value;
		};

		_this.parseRoutes = function (routes) {
			var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

			routes.forEach(function (r) {
				if (r.type === _Route2.default) {
					var _r$props = r.props,
					    component = _r$props.component,
					    path = _r$props.path;

					var variables = [];
					var rule = ('' + prefix + path).replace(/\\/g, '\\/').replace(/:[a-zA-Z][a-zA-Z0-9]*/g, function (m) {
						variables.push(m.slice(1));
						return '([a-zA-Z0-9]+)';
					});
					_this.routes.push({
						Component: component,
						path: '' + prefix + path,
						rule: new RegExp('^' + rule + '$'),
						variables: variables
					});
				} else if (r.type === Router) {
					_this.parseRoutes(r.props.children, '' + prefix + (r.props.path || ''));
				} else if (typeof r.type === 'function') {
					var result = r.type();
					if (result && result.type === Router) {
						_this.parseRoutes(result.props.children, '' + prefix + (result.props.path || ''));
					}
				}
			});
		};

		_this.state = {
			pages: {},
			url: ''
		};
		_this.routes = [];
		_this.parseRoutes(props.children, props.path || '');
		return _this;
	}

	_createClass(Router, [{
		key: 'componentWillMount',
		value: function componentWillMount() {
			var _this2 = this;

			if ('onhashchange' in window) {
				window.addEventListener('hashchange', this.hashChange, false);
			} else {
				var oldURL = window.location.href;
				this.timer = setInterval(function () {
					var newURL = window.location.href;
					if (oldURL !== newURL) {
						oldURL = newURL;
						_this2.hashChange({ oldURL: oldURL, newURL: newURL });
					}
				}, 16);
			}

			var hash = window.location.hash;
			var p = hash.indexOf('#');
			this.parseHash(p === -1 ? '' : hash.slice(p + 1));
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			if ('onhashchange' in window) {
				window.removeEventListener('hashChange', this.hashChange);
			} else {
				clearTimeout(this.timer);
			}
		}
	}, {
		key: 'render',
		value: function render() {
			var _this3 = this;

			if (this.props.one) {
				var page = this.state.pages[this.state.url];
				if (page) {
					var Component = page.Component,
					    url = page.url,
					    pathname = page.pathname,
					    args = page.args,
					    match = page.match,
					    params = page.params;

					var context = { url: url, pathname: pathname, args: args, match: match, params: params };
					return _react2.default.createElement(Component, { context: context });
				}
				return null;
			}
			return _react2.default.createElement(
				'div',
				{ className: 'router' },
				Object.keys(this.state.pages).map(function (url) {
					var _state$pages$url = _this3.state.pages[url],
					    Component = _state$pages$url.Component,
					    match = _state$pages$url.match,
					    params = _state$pages$url.params,
					    pathname = _state$pages$url.pathname,
					    args = _state$pages$url.args;

					var context = { url: url, pathname: pathname, args: args, match: match, params: params };
					var active = url === _this3.state.url;
					return _react2.default.createElement(
						'div',
						{ className: 'route' + (active ? ' active' : ''), key: url },
						_react2.default.createElement(Component, { context: context, active: active })
					);
				})
			);
		}
	}]);

	return Router;
}(_react2.default.Component);

Router.propTypes = {
	path: _propTypes2.default.string,
	children: _propTypes2.default.arrayOf(_Route2.default, Router, _propTypes2.default.func).isRequired,
	one: _propTypes2.default.bool
};
Router.defaultProps = {
	path: '',
	one: true
};
exports.default = Router;