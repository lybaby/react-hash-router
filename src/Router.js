import React from 'react'
import PropTypes from 'prop-types'

import NotFound from './NotFound'
import Route from './Route'
import Redirect from './Redirect'

import { observer, history } from './h'

export default class Router extends React.Component {
	static propTypes = {
		path: PropTypes.string,
		children: PropTypes.arrayOf(Route, Router, PropTypes.func).isRequired,
		cache: PropTypes.bool,
		notFound: PropTypes.func,
		duration: PropTypes.number,
		useHistoryState: PropTypes.bool,
	}

	static defaultProps = {
		path: '',
		cache: false,
		notFound: NotFound,
		duration: 400,
		useHistoryState: true,
	}

	constructor(props) {
		super(props)
		this.state = {
			current: [],
			next: [],
			end: [],
		}
		this.routes = []
		this.pages = {}

		this.parseRoutes(props.children, props.path || '')
	}

	componentWillMount() {
		observer.subscribe('ROUTER_CHANGE', routes => {
			Object.keys(routes).forEach(step => routes[step].forEach(item => {
				if (!(item.uri in this.pages)) {
					this.parseRoute(item.uri)
				}
			}))
			this.setState(routes)
		})

		history.init()
	}

	componentDidMount() {
		this.animated()
	}

	componentDidUpdate() {
		this.animated()
	}

	animated = () => {
		const { next, end } = this.state
		if (next.length > 0) {
			const timeout = next.length > 1 ? 16 : this.props.duration
			setTimeout(() => {
				this.setState({ current: next, next: end, end: [] })
			}, timeout)
		}
	}

	parseRoute = requestURI => {
		const { uri, pathname, query, args } = this.parseURI(requestURI)
		let found = false
		this.routes.forEach(route => {
			if (found) {
				return
			}
			const { Component, path, rule, variables, props } = route
			const matches = pathname.match(rule)
			if ((path === pathname) || matches) {
				const match = {}
				if (matches) {
					for (let i = 1; i < matches.length; i += 1) {
						match[variables[i - 1]] = this.parseValue(matches[i])
					}
				}
				const page = {
					Component,
					uri,
					path: pathname,
					query,
					match,
					args,
					props,
				}
				this.pages[uri] = page
				found = true
			}
		})
		if (!found) {
			const page = {
				Component: this.props.notFound,
				uri,
				path: pathname,
				query,
				match: {},
				args,
			}
			this.pages[uri] = page
		}
	}

	parseURI = uri => {
		const q = uri.indexOf('?')
		const pathname = q === -1 ? uri : uri.slice(0, q)
		const query = q === -1 ? null : uri.slice(q + 1)
		let args = null
		if (q !== -1) {
			args = {}
			if (query.length > 0) {
				query.split('&').forEach(item => {
					const p = item.indexOf('=')
					if (p === -1) {
						args[item] = null
					}
					else {
						args[item.slice(0, p)] = this.parseValue(unescape(item.slice(p + 1)))
					}
				})
			}
		}
		return { uri, pathname, query, args }
	}

	parseValue = value => {
		if (/^([0-9]|[1-9][0-9]+)$/.test(value)) {
			if (value.length > 11) {
				return value
			}
			return parseInt(value, 10)
		}
		else if (/^\d*\.\d+$/.test(value)) {
			return parseFloat(value)
		}
		else if (value === 'true') {
			return true
		}
		else if (value === 'false') {
			return false
		}
		else if (value === 'null' || value === '') {
			return null
		}
		else if (value === 'undefined') {
			return undefined
		}
		return value
	}

	parseRoutes = (routes, prefix = '') => {
		routes.forEach(r => {
			if (r.type === Route) {
				const { component, path } = r.props
				const variables = []
				const rule = `${prefix}${path}`.replace(/\\/g, '\\/').replace(/:[a-zA-Z][a-zA-Z0-9]*/g, m => {
					variables.push(m.slice(1))
					return '([a-zA-Z0-9]+)'
				})
				this.routes.push({
					Component: component,
					path: `${prefix}${path}`,
					rule: new RegExp(`^${rule}$`),
					variables,
					props: r.props,
				})
			}
			else if (r.type === Redirect) {
				const { path } = r.props
				const variables = []
				const rule = `${prefix}${path}`.replace(/\\/g, '\\/').replace(/:[a-zA-Z][a-zA-Z0-9]*/g, m => {
					variables.push(m.slice(1))
					return '([a-zA-Z0-9]+)'
				})
				this.routes.push({
					Component: r.type,
					path: `${prefix}${path}`,
					rule: new RegExp(`^${rule}$`),
					variables,
					props: r.props,
				})
			}
			else if (r.type === Router) {
				this.parseRoutes(r.props.children, `${prefix}${r.props.path || ''}`)
			}
			else if (typeof r.type === 'function') {
				const result = r.type()
				if (result && result.type === Router) {
					this.parseRoutes(result.props.children, `${prefix}${result.props.path || ''}`)
				}
			}
		})
	}

	render() {
		return <div className="router">
			{
				this.state.current.map(item => {
					const { uri, className, index } = item
					const { Component, path, query, match, args, props } = this.pages[uri]
					const context = { index, uri, path, query, match, args, props, observer, navigateTo: history.navigateTo, backTo: history.backTo, replaceWith: history.replaceWith }
					return <div
						className={`route ${className}`}
						data-uri={uri}
						key={uri}
					>
						<Component context={context} active={className === 'current'} />
					</div>
				})
			}
		</div>
	}
}
