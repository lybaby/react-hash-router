import React from 'react'
import PropTypes from 'prop-types'

import NotFound from './NotFound'
import Route from './Route'
import Observer from './Observer'
import navigateTo from './URL'

export default class Router extends React.Component {
	static propTypes = {
		path: PropTypes.string,
		children: PropTypes.arrayOf(Route, Router, PropTypes.func).isRequired,
		cache: PropTypes.bool,
		notFound: PropTypes.func,
		duration: PropTypes.number,
	}

	static defaultProps = {
		path: '',
		cache: false,
		notFound: NotFound,
		duration: 400,
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
		this.history = []
		this.current = -1

		this.parseRoutes(props.children, props.path || '')
	}

	componentWillMount() {
		this.observer = new Observer()

		window.addEventListener('hashchange', this.hashChange, false)

		// history
		const cache = JSON.parse(sessionStorage.getItem('history') || 'null')
		if (cache && Array.isArray(cache.history) && (typeof cache.current === 'number') && cache.history.length > 0 && cache.history.length > cache.current) {
			cache.history.forEach(uri => {
				this.parseHash(uri)
			})
			this.history = cache.history
			this.current = cache.current
		}

		// current
		const uri = this.getHashURI(window.location.href)
		this.parseHash(uri)

		this.state.current = [{ uri, className: 'current', index: this.current === -1 ? 0 : this.current }]

		// first
		if (this.history.length === 0) {
			this.current = 0;
			this.history = [uri]
			sessionStorage.setItem('history', JSON.stringify({ current: 0, history: [uri] }))
		}
	}

	componentDidMount() {
		this.animated()
	}

	componentWillUnmount() {
		window.removeEventListener('hashChange', this.hashChange)
	}

	componentDidUpdate() {
		this.animated()
	}

	animated = () => {
		const { current, history } = this
		const uri = this.history[this.current]
		this.observer.publish('ROUTE_CHANGE', { current, uri, history })

		const { next, end } = this.state
		if (next.length > 0) {
			const timeout = next.length > 1 ? 16 : this.props.duration
			setTimeout(() => {
				this.setState({ current: next, next: end, end: [] })
			}, timeout)
		}
	}

	getHashURI = url => {
		const p = url.indexOf('#')
		return p === -1 ? '' : url.slice(p + 1)
	}

	hashChange = ev => {
		const oldURI = this.getHashURI(ev.oldURL)
		const newURI = this.getHashURI(ev.newURL)
		if (!(newURI in this.pages)) {
			this.parseHash(newURI)
		}
		
		const uri = this.history[this.current]
		const prev = this.current > 0 ? this.history[this.current - 1] : null
		const next = this.current + 1 < this.history.length ? this.history[this.current + 1] : null
		// push
		if (oldURI === uri && newURI === next) {
			const index = this.current
			this.current += 1
			this.setState({
				current: [{ uri: oldURI, className: 'current', index }, { uri: newURI, className: 'next', index: index + 1 }],
				next: [{ uri: oldURI, className: 'prev', index }, { uri: newURI, className: 'current', index: index + 1 }],
				end: [{ uri: newURI, className: 'current', index: index + 1 }],
			})
		}
		// pop
		else if (newURI === prev && oldURI === uri) {
			const index = this.current
			this.current -= 1
			this.setState({
				current: [{ uri: newURI, className: 'prev', index: index - 1 }, { uri: oldURI, className: 'current', index }],
				next: [{ uri: newURI, className: 'current', index: index - 1 }, { uri: oldURI, className: 'next', index }],
				end: [{ uri: newURI, className: 'current', index }],
			})
		}
		// goto
		else {
			const index = this.current
			while (this.current + 1 < this.history.length) {
				this.history.pop()
			}
			this.history.push(newURI)
			this.current = this.history.length - 1
			this.setState({
				current: [{ uri: oldURI, className: 'current', index }, { uri: newURI, className: 'next', index: index + 1 }],
				next: [{ uri: oldURI, className: 'prev', index }, { uri: newURI, className: 'current', index: index + 1 }],
				end: [{ uri: newURI, className: 'current', index: index + 1 }],
			})
		}
		sessionStorage.setItem('history', JSON.stringify({ current: this.current, history: this.history }))
	}

	parseHash = hash => {
		const { uri, pathname, query, args } = this.parseURI(hash)
		let found = false
		// let state = {}
		this.routes.forEach(route => {
			if (found) {
				return
			}
			const { Component, path, rule, variables } = route
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
		const query = q === -1 ? '' : uri.slice(q + 1)
		const args = {}
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
					const { Component, path, query, match, args } = this.pages[uri]
					const context = { index, uri, path, query, match, args, observer: this.observer, navigateTo }
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
