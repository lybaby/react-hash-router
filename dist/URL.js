'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function buildURL(to) {
	if (to.indexOf('/') === 0) {
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
}

function navigateTo(to) {
	if (to) {
		if (/^(tel|sms|mailto):/i.test(to) || /^([a-z]+:)?\/\//i.test(to)) {
			window.open(to, '_self');
		} else {
			location.hash = buildURL(to);
		}
	}
}

exports.default = navigateTo;
exports.navigateTo = navigateTo;
exports.buildURL = buildURL;