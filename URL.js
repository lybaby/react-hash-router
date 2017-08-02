'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

function buildURL(to) {
	if (to.indexOf('/') === 0) {
		return to;
	} else {
		var hash = location.hash ? location.hash.slice(1) : '';
		var p = hash.split('/');
		p.pop();
		to.split('/').forEach(function (d) {
			if (d === '..') {
				p.pop();
			} else if (d !== '.') {
				p.push(d);
			}
		});
		return p.join('/').replace(/\/{2,}/g, '/');
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