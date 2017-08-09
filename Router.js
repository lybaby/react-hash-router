'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _NotFound = require('./NotFound');

var _NotFound2 = _interopRequireDefault(_NotFound);

var _Route = require('./Route');

var _Route2 = _interopRequireDefault(_Route);

var _Observer = require('./Observer');

var _Observer2 = _interopRequireDefault(_Observer);

var _URL = require('./URL');

var _URL2 = _interopRequireDefault(_URL);

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
			var state = _this.parseHash(hash);

			state.history = _this.state.history;
			state.current = _this.state.current;
			var prev = state.history.length > 1 ? state.history[state.current - 1] : null;
			var next = state.history[state.current + 1];
			// back
			if (state.uri === prev) {
				state.current = _this.state.current - 1;
			}
			// forward
			else if (state.uri === next) {
					state.current += 1;
				}
				// goto
				else {
						while (state.current + 1 < state.history.length) {
							state.history.pop();
						}
						state.history.push(state.uri);
						state.current = state.history.length - 1;
					}
			_this.setState(state, function () {
				var current = state.current,
				    uri = state.uri,
				    history = state.history;

				sessionStorage.setItem('history', JSON.stringify({ current: current, uri: uri, history: history }));
			});
		};

		_this.parseHash = function (hash) {
			var _this$parseURI = _this.parseURI(hash),
			    uri = _this$parseURI.uri,
			    pathname = _this$parseURI.pathname,
			    args = _this$parseURI.args,
			    params = _this$parseURI.params;

			var found = false;
			var state = {};
			_this.routes.forEach(function (route) {
				if (found) {
					return;
				}
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
						uri: uri,
						pathname: pathname,
						args: args
					};
					var pages = Object.assign({}, _this.state.pages);
					pages[uri] = page;
					state = { pages: pages, uri: uri };
					found = true;
				}
			});
			if (!found) {
				var page = {
					Component: _NotFound2.default,
					match: {},
					params: params,
					uri: uri,
					pathname: pathname,
					args: args
				};
				var pages = Object.assign({}, _this.state.pages);
				pages[uri] = page;
				state = { pages: pages, uri: uri };
			}
			return state;
		};

		_this.parseURI = function (uri) {
			var q = uri.indexOf('?');
			var pathname = q === -1 ? uri : uri.slice(0, q);
			var args = q === -1 ? '' : uri.slice(q + 1);
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
			return { uri: uri, pathname: pathname, args: args, params: params };
		};

		_this.parseValue = function (value) {
			if (/^([0-9]|[1-9][0-9]+)$/.test(value)) {
				if (value.length > 11) {
					return value;
				}
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
			uri: '',
			current: -1,
			history: []
		};
		_this.routes = [];
		_this.parseRoutes(props.children, props.path || '');
		return _this;
	}

	_createClass(Router, [{
		key: 'componentWillMount',
		value: function componentWillMount() {
			var _this2 = this;

			this.observer = new _Observer2.default();

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

			var cache = JSON.parse(sessionStorage.getItem('history') || 'null');
			if (cache && cache.history && cache.uri && cache.current >= 0) {
				cache.history.forEach(function (uri) {
					// componentWillMount()
					_this2.state = Object.assign(_this2.state, _this2.parseHash(uri));
				});
				this.state.history = cache.history;
				this.state.current = cache.current;
				this.state.uri = cache.uri;
			}

			var hash = window.location.hash;
			var p = hash.indexOf('#');
			this.setState(this.parseHash(p === -1 ? '' : hash.slice(p + 1)), function () {
				if (_this2.state.history.length === 0) {
					_this2.setState({ current: 0, history: [_this2.state.uri] }, function () {
						sessionStorage.setItem('history', JSON.stringify({ current: 0, uri: _this2.state.uri, history: [_this2.state.uri] }));
					});
				}
			});
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

			var history = this.state.history;


			if (!this.props.cache) {
				var page = this.state.pages[this.state.uri];
				if (page) {
					var Component = page.Component,
					    uri = page.uri,
					    pathname = page.pathname,
					    args = page.args,
					    match = page.match,
					    params = page.params;

					var context = { uri: uri, pathname: pathname, args: args, match: match, params: params, observer: this.observer, navigateTo: _URL2.default };
					history.forEach(function (u, index) {
						if (uri === u) {
							setTimeout(function () {
								_this3.observer.publish('ROUTE_CHANGE', { current: index, uri: uri, history: history });
							}, 16);
						}
					});
					return _react2.default.createElement(Component, { context: context, active: true });
				}
				return null;
			}

			var cur = -1;
			return _react2.default.createElement(
				'div',
				{ className: 'router' },
				history.map(function (uri, index) {
					var _state$pages$uri = _this3.state.pages[uri],
					    Component = _state$pages$uri.Component,
					    match = _state$pages$uri.match,
					    params = _state$pages$uri.params,
					    pathname = _state$pages$uri.pathname,
					    args = _state$pages$uri.args;

					var context = { uri: uri, pathname: pathname, args: args, match: match, params: params, observer: _this3.observer, navigateTo: _URL2.default };
					var active = uri === _this3.state.uri;
					if (active) {
						cur = index;
						setTimeout(function () {
							_this3.observer.publish('ROUTE_CHANGE', { current: index, uri: uri, history: history });
						}, 16);
					}
					var cls = cur === -1 ? 'prev' : cur === index ? 'active' : 'next';
					return _react2.default.createElement(
						'div',
						{ className: 'route ' + cls, key: uri },
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
	cache: _propTypes2.default.bool
};
Router.defaultProps = {
	path: '',
	cache: false
};
exports.default = Router;