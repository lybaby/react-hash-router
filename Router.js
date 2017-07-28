import React from 'react';
import PropTypes from 'prop-types';

import Route from './Route';

export default class Router extends React.Component {

	constructor(props) {
		super(props);

		this.hashChange = ev => {
			const p = ev.newURL.indexOf('#');
			const hash = p === -1 ? '' : ev.newURL.slice(p + 1);
			this.parseHash(hash);
		};

		this.parseHash = hash => {
			const { url, pathname, args, params } = this.parseURL(hash);
			this.routes.forEach(route => {
				const { Component, path, rule, variables } = route;
				const matches = pathname.match(rule);
				if (path === pathname || matches) {
					const match = {};
					if (matches) {
						for (let i = 1; i < matches.length; i += 1) {
							match[variables[i - 1]] = this.parseValue(matches[i]);
						}
					}
					const page = {
						Component,
						match,
						params,
						pathname,
						args
					};
					const pages = Object.assign({}, this.state.pages);
					pages[url] = page;
					this.setState({ pages, url });
				}
			});
		};

		this.parseURL = url => {
			const q = url.indexOf('?');
			const pathname = q === -1 ? url : url.slice(0, q);
			const args = q === -1 ? '' : url.slice(q + 1);
			const params = {};
			if (args.length > 0) {
				args.split('&').forEach(item => {
					const p = item.indexOf('=');
					if (p === -1) {
						params[item] = null;
					} else {
						params[item.slice(0, p)] = this.parseValue(unescape(item.slice(p + 1)));
					}
				});
			}
			return { url, pathname, args, params };
		};

		this.parseValue = value => {
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

		this.parseRoutes = (routes, prefix = '') => {
			routes.forEach(r => {
				if (r.type === Route) {
					const { component, path } = r.props;
					const variables = [];
					const rule = `${prefix}${path}`.replace(/\\/g, '\\/').replace(/:[a-zA-Z][a-zA-Z0-9]*/g, m => {
						variables.push(m.slice(1));
						return '([a-zA-Z0-9]+)';
					});
					this.routes.push({
						Component: component,
						path: `${prefix}${path}`,
						rule: new RegExp(`^${rule}$`),
						variables
					});
				} else if (r.type === Router) {
					this.parseRoutes(r.props.children, `${prefix}${r.props.path || ''}`);
				} else if (typeof r.type === 'function') {
					const result = r.type();
					if (result && result.type === Router) {
						this.parseRoutes(result.props.children, `${prefix}${result.props.path || ''}`);
					}
				}
			});
		};

		this.state = {
			pages: {},
			url: ''
		};
		this.routes = [];
		this.parseRoutes(props.children, props.path || '');
	}

	componentWillMount() {
		if ('onhashchange' in window) {
			window.addEventListener('hashchange', this.hashChange, false);
		} else {
			let oldURL = window.location.href;
			this.timer = setInterval(() => {
				const newURL = window.location.href;
				if (oldURL !== newURL) {
					oldURL = newURL;
					this.hashChange({ oldURL, newURL });
				}
			}, 16);
		}

		const hash = window.location.hash;
		const p = hash.indexOf('#');
		this.parseHash(p === -1 ? '' : hash.slice(p + 1));
	}

	componentWillUnmount() {
		if ('onhashchange' in window) {
			window.removeEventListener('hashChange', this.hashChange);
		} else {
			clearTimeout(this.timer);
		}
	}

	render() {
		if (this.props.one) {
			const page = this.state.pages[this.state.url];
			if (page) {
				const { Component, url, pathname, args, match, params } = page;
				const context = { url, pathname, args, match, params };
				return React.createElement(Component, { context: context });
			}
			return null;
		}
		return React.createElement(
			'div',
			{ className: 'router' },
			Object.keys(this.state.pages).map(url => {
				const { Component, match, params, pathname, args } = this.state.pages[url];
				const context = { url, pathname, args, match, params };
				const active = url === this.state.url;
				return React.createElement(
					'div',
					{ className: `route${active ? ' active' : ''}`, key: url },
					React.createElement(Component, { context: context, active: active })
				);
			})
		);
	}
}
Router.propTypes = {
	path: PropTypes.string,
	children: PropTypes.arrayOf(Route, Router, PropTypes.func).isRequired,
	one: PropTypes.bool
};
Router.defaultProps = {
	path: '',
	one: true
};