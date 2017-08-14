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

		_this.animated = function () {
			var current = _this.current,
			    history = _this.history;

			var uri = _this.history[_this.current];
			_this.observer.publish('ROUTE_CHANGE', { current: current, uri: uri, history: history });

			var _this$state = _this.state,
			    next = _this$state.next,
			    end = _this$state.end;

			if (next.length > 0) {
				var timeout = next.length > 1 ? 16 : _this.props.duration;
				setTimeout(function () {
					_this.setState({ current: next, next: end, end: [] });
				}, timeout);
			}
		};

		_this.getHashURI = function (url) {
			var p = url.indexOf('#');
			return p === -1 ? '' : url.slice(p + 1);
		};

		_this.hashChange = function (ev) {
			var oldURI = _this.getHashURI(ev.oldURL);
			var newURI = _this.getHashURI(ev.newURL);
			if (!(newURI in _this.pages)) {
				_this.parseHash(newURI);
			}

			var uri = _this.history[_this.current];
			var prev = _this.current > 0 ? _this.history[_this.current - 1] : null;
			var next = _this.current + 1 < _this.history.length ? _this.history[_this.current + 1] : null;
			// push
			if (oldURI === uri && newURI === next) {
				var index = _this.current;
				_this.current += 1;
				_this.setState({
					current: [{ uri: oldURI, className: 'current', index: index }, { uri: newURI, className: 'next', index: index + 1 }],
					next: [{ uri: oldURI, className: 'prev', index: index }, { uri: newURI, className: 'current', index: index + 1 }],
					end: [{ uri: newURI, className: 'current', index: index + 1 }]
				});
			}
			// pop
			else if (newURI === prev && oldURI === uri) {
					var _index = _this.current;
					_this.current -= 1;
					_this.setState({
						current: [{ uri: newURI, className: 'prev', index: _index - 1 }, { uri: oldURI, className: 'current', index: _index }],
						next: [{ uri: newURI, className: 'current', index: _index - 1 }, { uri: oldURI, className: 'next', index: _index }],
						end: [{ uri: newURI, className: 'current', index: _index }]
					});
				}
				// goto
				else {
						var _index2 = _this.current;
						while (_this.current + 1 < _this.history.length) {
							_this.history.pop();
						}
						_this.history.push(newURI);
						_this.current = _this.history.length - 1;
						_this.setState({
							current: [{ uri: oldURI, className: 'current', index: _index2 }, { uri: newURI, className: 'next', index: _index2 + 1 }],
							next: [{ uri: oldURI, className: 'prev', index: _index2 }, { uri: newURI, className: 'current', index: _index2 + 1 }],
							end: [{ uri: newURI, className: 'current', index: _index2 + 1 }]
						});
					}
			sessionStorage.setItem('history', JSON.stringify({ current: _this.current, history: _this.history }));
		};

		_this.parseHash = function (hash) {
			var _this$parseURI = _this.parseURI(hash),
			    uri = _this$parseURI.uri,
			    pathname = _this$parseURI.pathname,
			    query = _this$parseURI.query,
			    args = _this$parseURI.args;

			var found = false;
			// let state = {}
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
						uri: uri,
						path: pathname,
						query: query,
						match: match,
						args: args
					};
					_this.pages[uri] = page;
					found = true;
				}
			});
			if (!found) {
				var page = {
					Component: _this.props.notFound,
					uri: uri,
					path: pathname,
					query: query,
					match: {},
					args: args
				};
				_this.pages[uri] = page;
			}
		};

		_this.parseURI = function (uri) {
			var q = uri.indexOf('?');
			var pathname = q === -1 ? uri : uri.slice(0, q);
			var query = q === -1 ? '' : uri.slice(q + 1);
			var args = {};
			if (query.length > 0) {
				query.split('&').forEach(function (item) {
					var p = item.indexOf('=');
					if (p === -1) {
						args[item] = null;
					} else {
						args[item.slice(0, p)] = _this.parseValue(unescape(item.slice(p + 1)));
					}
				});
			}
			return { uri: uri, pathname: pathname, query: query, args: args };
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
			current: [],
			next: [],
			end: []
		};
		_this.routes = [];
		_this.pages = {};
		_this.history = [];
		_this.current = -1;

		_this.parseRoutes(props.children, props.path || '');
		return _this;
	}

	_createClass(Router, [{
		key: 'componentWillMount',
		value: function componentWillMount() {
			var _this2 = this;

			this.observer = new _Observer2.default();

			window.addEventListener('hashchange', this.hashChange, false);

			// history
			var cache = JSON.parse(sessionStorage.getItem('history') || 'null');
			if (cache && Array.isArray(cache.history) && typeof cache.current === 'number' && cache.history.length > 0 && cache.history.length > cache.current) {
				cache.history.forEach(function (uri) {
					_this2.parseHash(uri);
				});
				this.history = cache.history;
				this.current = cache.current;
			}

			// current
			var uri = this.getHashURI(window.location.href);
			this.parseHash(uri);

			this.state.current = [{ uri: uri, className: 'current', index: this.current === -1 ? 0 : this.current }];

			// first
			if (this.history.length === 0) {
				this.current = 0;
				this.history = [uri];
				sessionStorage.setItem('history', JSON.stringify({ current: 0, history: [uri] }));
			}
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.animated();
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			window.removeEventListener('hashChange', this.hashChange);
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			this.animated();
		}
	}, {
		key: 'render',
		value: function render() {
			var _this3 = this;

			return _react2.default.createElement(
				'div',
				{ className: 'router' },
				this.state.current.map(function (item) {
					var uri = item.uri,
					    className = item.className,
					    index = item.index;
					var _pages$uri = _this3.pages[uri],
					    Component = _pages$uri.Component,
					    path = _pages$uri.path,
					    query = _pages$uri.query,
					    match = _pages$uri.match,
					    args = _pages$uri.args;

					var context = { index: index, uri: uri, path: path, query: query, match: match, args: args, observer: _this3.observer, navigateTo: _URL2.default };
					return _react2.default.createElement(
						'div',
						{
							className: 'route ' + className,
							'data-uri': uri,
							key: uri
						},
						_react2.default.createElement(Component, { context: context, active: className === 'current' })
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
	cache: _propTypes2.default.bool,
	notFound: _propTypes2.default.func,
	duration: _propTypes2.default.number
};
Router.defaultProps = {
	path: '',
	cache: false,
	notFound: _NotFound2.default,
	duration: 400
};
exports.default = Router;