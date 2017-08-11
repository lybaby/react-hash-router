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
	}

	static defaultProps = {
		path: '',
		cache: false,
	}

	constructor(props) {
		super(props)
		this.state = {
			pages: {},
			uri: '',
			current: -1,
			history: [],
		}
		this.routes = []
		this.parseRoutes(props.children, props.path || '')
	}

	componentWillMount() {
		this.observer = new Observer()

		if ('onhashchange' in window) {
			window.addEventListener('hashchange', this.hashChange, false)
		}
		else {
			let oldURL = window.location.href
			this.timer = setInterval(() => {
				const newURL = window.location.href
				if (oldURL !== newURL) {
					oldURL = newURL
					this.hashChange({ oldURL, newURL })
				}
			}, 16)
		}

		const cache = JSON.parse(sessionStorage.getItem('history') || 'null')
		if (cache && cache.history && cache.uri && cache.current >= 0) {
			cache.history.forEach(uri => {
				this.state = Object.assign(this.state, this.parseHash(uri))
			})
			this.state.history = cache.history
			this.state.current = cache.current
			this.state.uri = cache.uri
		}

		const hash = window.location.hash
		const p = hash.indexOf('#')
		this.state = Object.assign({}, this.state, this.parseHash(p === -1 ? '' : hash.slice(p + 1)))
		if (this.state.history.length === 0) {
			this.state.current = 0;
			this.state.history = [this.state.uri]
			sessionStorage.setItem('history', JSON.stringify({ current: 0, uri: this.state.uri, history: [this.state.uri] }))
		}
	}

	componentDidMount() {
		this.animated()
	}

	componentWillUnmount() {
		if ('onhashchange' in window) {
			window.removeEventListener('hashChange', this.hashChange)
		}
		else {
			clearTimeout(this.timer)
		}
	}

	componentDidUpdate() {
		this.first = false
		this.animated()
	}

	first = true

	animated = () => {
		const { current, uri, history } = this.state
		this.observer.publish('ROUTE_CHANGE', { current, uri, history })

		setTimeout(() => {
			const routes = this.router.querySelectorAll('.route')
			for (let i = 0; i < routes.length; i += 1) {
				if (i < current) {
					routes[i].className = 'route pass'
				}
				else if (current === i) {
					routes[i].className = 'route active'
				}
				else {
					routes[i].className = 'route next'
				}
			}
		}, 8)	// 120hz
	}

	hashChange = ev => {
		const p = ev.newURL.indexOf('#')
		const hash = p === -1 ? '' : ev.newURL.slice(p + 1)
		const state = this.parseHash(hash)
		
		state.history = this.state.history
		state.current = this.state.current
		const prev = state.history.length > 1 ? state.history[state.current - 1] : null
		const next = state.history[state.current + 1]
		// back
		if (state.uri === prev) {
			state.current = this.state.current - 1
		}
		// forward
		else if (state.uri === next) {
			state.current += 1
		}
		// goto
		else {
			while (state.current + 1 < state.history.length) {
				state.history.pop()
			}
			state.history.push(state.uri)
			state.current = state.history.length - 1
		}
		this.setState(state, () => {
			const { current, uri, history } = state
			sessionStorage.setItem('history', JSON.stringify({ current, uri: uri, history }))
		})
	}

	parseHash = hash => {
		const { uri, pathname, args, params } = this.parseURI(hash)
		let found = false
		let state = {}
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
					match,
					params,
					uri,
					pathname,
					args,
				}
				const pages = Object.assign({}, this.state.pages)
				pages[uri] = page
				state = { pages, uri }
				found = true
			}
		})
		if (!found) {
			const page = {
				Component: NotFound,
				match: {},
				params,
				uri,
				pathname,
				args,
			}
			const pages = Object.assign({}, this.state.pages)
			pages[uri] = page
			state = { pages, uri }
		}
		return state
	}

	parseURI = uri => {
		const q = uri.indexOf('?')
		const pathname = q === -1 ? uri : uri.slice(0, q)
		const args = q === -1 ? '' : uri.slice(q + 1)
		const params = {}
		if (args.length > 0) {
			args.split('&').forEach(item => {
				const p = item.indexOf('=')
				if (p === -1) {
					params[item] = null
				}
				else {
					params[item.slice(0, p)] = this.parseValue(unescape(item.slice(p + 1)))
				}
			})
		}
		return { uri, pathname, args, params }
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
		const { history } = this.state

		if (!this.props.cache) {
			const page = this.state.pages[this.state.uri]
			if (page) {
				const { Component, uri, pathname, args, match, params } = page
				const context = { uri, pathname, args, match, params, observer: this.observer, navigateTo }
				history.forEach((u, index) => {
					if (uri === u) {
						setTimeout(() => {
							this.observer.publish('ROUTE_CHANGE', { current: index, uri, history })
						}, 16)
					}
				})
				return <Component context={context} active />
			}
			return null
		}

		let cur = -1
		return <div className="router" ref={ref => { this.router = ref }}>
			{
				history.map((uri, index) => {
					const { Component, match, params, pathname, args } = this.state.pages[uri]
					const context = { uri, pathname, args, match, params, observer: this.observer, navigateTo }
					const active = uri === this.state.uri
					if (active) {
						cur = index
					}
					const cls = cur === -1 ? 'prev' : (cur === index ? (this.first ? 'active' : 'next') : 'next')
					return <div
						className={`route ${cls}`}
						data-uri={uri}
						key={uri}
					>
						<Component context={context} active={active} />
					</div>
				})
			}
		</div>
	}
}
