'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var History = function History(observer) {
	var _this = this;

	_classCallCheck(this, History);

	this.init = function () {
		window.addEventListener('hashchange', _this.hashChange, false);

		_this.emitRouteChange({
			current: [{ uri: _this.history[_this.current], className: 'current', index: _this.current }],
			next: [],
			end: [{ uri: _this.history[_this.current], className: 'current', index: _this.current }]
		});
	};

	this.hashChange = function (ev) {
		var pushState = false;
		if (Object.prototype.toString.apply(history.state) !== '[object Object]' || !('PAGE' in history.state)) {
			history.replaceState({ PAGE: history.length - 1 }, '');
			pushState = true;
		}
		var page = history.state.PAGE;
		var oldURI = _this.getHashURI(ev.oldURL);
		var newURI = _this.getHashURI(ev.newURL);

		if (pushState) {
			var index = _this.current;
			while (_this.current + 1 < _this.history.length) {
				_this.history.pop();
			}
			_this.history.push(newURI);
			_this.current = page;
			_this.emitRouteChange({
				current: [{ uri: oldURI, className: 'current', index: index }, { uri: newURI, className: 'next', index: page }],
				next: [{ uri: oldURI, className: 'prev', index: index }, { uri: newURI, className: 'current', index: page }],
				end: [{ uri: newURI, className: 'current', index: page }]
			});
		}
		// page, current => forward
		else if (_this.current > page) {
				var _index = _this.current;
				_this.current = page;
				_this.emitRouteChange({
					current: [{ uri: newURI, className: 'prev', index: page }, { uri: oldURI, className: 'current', index: _index }],
					next: [{ uri: newURI, className: 'current', index: page }, { uri: oldURI, className: 'next', index: _index }],
					end: [{ uri: newURI, className: 'current', index: page }]
				});
			}
			// current, page => backward
			else if (_this.current < page) {
					var _index2 = _this.current;
					_this.current = page;
					_this.emitRouteChange({
						current: [{ uri: oldURI, className: 'current', index: _index2 }, { uri: newURI, className: 'next', index: page }],
						next: [{ uri: oldURI, className: 'prev', index: _index2 }, { uri: newURI, className: 'current', index: page }],
						end: [{ uri: newURI, className: 'current', index: page }]
					});
				}
				// refresh
				else {
						//
					}
		_this.cacheHistory();
	};

	this.emitRouteChange = function (routes) {
		_this.times += 1;
		_this.observer.publish('ROUTER_CHANGE', routes);
	};

	this.getHashURI = function (url) {
		var p = url.indexOf('#');
		return p === -1 ? '' : url.slice(p + 1);
	};

	this.buildURI = function (to) {
		if (/^[a-z]+:\/\//i.test(to)) {
			return to;
		}
		if (/^\/\//i.test(to)) {
			return location.protocol + to;
		} else if (to.indexOf('/') === 0) {
			return to;
		} else {
			var hash = location.hash ? location.hash.slice(1).split('?', 1)[0] : '';
			var p = hash.split('/');
			p.pop();

			var _to$split = to.split('?'),
			    _to$split2 = _toArray(_to$split),
			    path = _to$split2[0],
			    args = _to$split2.slice(1);

			path.split('/').forEach(function (d) {
				if (d === '..') {
					p.pop();
				} else if (d !== '.') {
					p.push(d);
				}
			});
			return p.join('/').replace(/\/{2,}/g, '/') + (args.length > 0 ? '?' + args.join('?') : '');
		}
	};

	this.navigateTo = function (to) {
		if (to) {
			if (/^(mailto):/i.test(to) || /^([a-z]+:)?\/\//i.test(to)) {
				window.open(to, '_self');
			} else {
				location.hash = _this.buildURI(to);
			}
		}
	};

	this.backTo = function (to) {
		var fromStart = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

		var uri = _this.buildURI(to);
		if (fromStart) {
			for (var i = 0; i < _this.current; i += 1) {
				if (_this.history[i] === uri) {
					history.go(i - _this.current);
					break;
				}
			}
		} else {
			for (var _i = _this.current - 1; _i >= 0; _i -= 1) {
				if (_this.history[_i] === uri) {
					history.go(_i - _this.current);
					break;
				}
			}
		}
	};

	this.replaceWith = function (to) {
		var uri = _this.buildURI(to);

		_this.history[_this.current] = uri;
		_this.emitRouteChange({
			current: [{ uri: uri, className: 'current', index: _this.current }],
			next: [],
			end: []
		});
		console.log('uri = ', uri);
		// 安全问题
		if (/^[a-z]+:\/\//i.test(uri)) {
			window.location.href = uri;
		} else {
			window.history.replaceState(window.history.state, '', '#' + uri);
		}
		_this.cacheHistory();
	};

	this.restoreHistory = function () {
		var cache = JSON.parse(sessionStorage.getItem('history') || 'null');
		if (cache && Array.isArray(cache.history) && typeof cache.current === 'number' && cache.history.length > 0 && cache.history.length > cache.current) {
			_this.history = cache.history;
			_this.current = cache.current;
		}
	};

	this.cacheHistory = function () {
		var cache = JSON.stringify({ current: _this.current, history: _this.history });
		sessionStorage.setItem('history', cache);
	};

	this.observer = observer;
	this.history = [];
	this.current = -1;
	this.times = 0;

	// history
	this.restoreHistory();

	// current
	if (Object.prototype.toString.apply(history.state) !== '[object Object]' || !('PAGE' in history.state)) {
		history.replaceState({ PAGE: history.length - 1 }, '');
		var newURI = this.getHashURI(window.location.href);
		var index = this.current;
		while (this.current + 1 < this.history.length) {
			this.history.pop();
		}
		this.history.push(newURI);
		this.current = this.history.length - 1;
		this.cacheHistory();
	}
};

exports.default = History;