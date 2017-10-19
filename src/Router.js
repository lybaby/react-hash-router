import React from 'react'
import PropTypes from 'prop-types'

import NotFound from './NotFound'
import Route, { Container } from './Route'
import Redirect from './Redirect'

import { observer, history } from './h'

export default class Router extends React.Component {
	static propTypes = {
		path: PropTypes.string,
		children: PropTypes.arrayOf(Route, Router, Redirect, PropTypes.func).isRequired,
		cache: PropTypes.bool,
		notFound: PropTypes.func,
		duration: PropTypes.number,
		delay: PropTypes.number,
	}

	static defaultProps = {
		path: '',
		cache: false,
		notFound: NotFound,
		duration: 400,
		delay: 16,
	}

	constructor(props) {
		super(props)
		this.state = {
			current: [],
			next: [],
			end: [],
			transition: 0,
		}
		this.routes = []
		this.pages = {}
		this.playback = []
		this.emiting = false

		this.parseRoutes(props.children, props.path || '')
	}

	componentWillMount() {
		observer.subscribe('ROUTER_CHANGE', routes => {
			Object.keys(routes).forEach(step => {
				if (step !== 'direct') {
					routes[step].forEach(item => {
						if (!(item.uri in this.pages)) {
							this.parseRoute(item.uri)
						}
					})
				}
			})
			this.playback.push(routes)
			if (!this.emiting) {
				this.emit()
			}
		})

		history.init()
	}

	emit = () => {
		this.emiting = true
		if (this.playback.length === 0) {
			this.emiting = false
			return
		}

		const { current, next, end, direct } = this.playback[0]
		this.playback = this.playback.slice(1)
		const { duration, delay } = this.props
		if (direct === true || duration <= 0) {
			this.setState({ current: end, transition: 0 }, () => this.emit())
		}
		else {
			this.setState({ current, transition: 0 })
			setTimeout(() => {
				this.setState({ current: next, transition: duration })
				setTimeout(() => {
					this.setState({ current: end, transition: delay }, () => {
						setTimeout(() => this.emit(), delay)
					})
				}, duration)
			}, delay)
		}
	}

	parseRoutes = (routes, prefix = '') => {
		routes.forEach(r => {
			const p = `${prefix}${r.props.path || ''}`.replace(/\/{2,}/g, '/')
			if (r.type === Route) {
				const { component } = r.props
				const variables = []
				const rule = p.replace(/\//g, '\\/').replace(/:[a-zA-Z][a-zA-Z0-9]*/g, m => {
					variables.push(m.slice(1))
					return '([a-zA-Z0-9\-_]+)'
				})
				this.routes.push({
					Type: Container,
					component,
					rule: new RegExp(`^${rule}$`),
					variables,
					props: {
						path: p,
					},
				})
			}
			else if (r.type === Redirect) {
				const { to, replace } = r.props
				const variables = []
				const rule = p.replace(/\//g, '\\/').replace(/:[a-zA-Z][a-zA-Z0-9]*/g, m => {
					variables.push(m.slice(1))
					return '([a-zA-Z0-9\-_]+)'
				})
				this.routes.push({
					Type: r.type,
					component: null,
					rule: new RegExp(`^${rule}$`),
					variables,
					props: {
						path: p,
						to,
						replace,
					},
				})
			}
			else if (r.type === Router) {
				this.parseRoutes(r.props.children, `${prefix}${result.props.path || ''}`)
			}
			else if (typeof r.type === 'function') {
				const result = r.type()
				if (result && result.type === Router) {
					this.parseRoutes(result.props.children, `${prefix}${result.props.path || ''}`)
				}
			}
		})
	}

	parseRoute = requestURI => {
		const { uri, pathname, query, args } = this.parseURI(requestURI)
		let found = false
		this.routes.forEach(route => {
			if (found) {
				return
			}
			const { Type, component, path, rule, variables, props, mount, unmount, cache } = route
			const matches = pathname.match(rule)
			if ((path === pathname) || matches) {
				const match = {}
				if (matches) {
					for (let i = 1; i < matches.length; i += 1) {
						match[variables[i - 1]] = this.parseValue(matches[i])
					}
				}
				const page = {
					Type,
					component,
					props,
					context: {
						uri,
						pathname,
						query,
						match,
						args,
					},
					mount,
					unmount,
					cache,
				}
				this.pages[uri] = page
				found = true
			}
		})
		if (!found) {
			const page = {
				Type: Container,
				component: this.props.notFound,
				props: {},
				context: {
					uri,
					pathname,
					query,
					match: {},
					args,
				},
				mount: () => {},
				unmount: () => {},
				cache: false,
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

	render() {
		const styles = {
			position: 'absolute',
			overflowX: 'hidden',
			width: '100%',
			height: '100%'
		}

		return <div style={styles}>
			{
				this.state.current.map(item => {
					const { uri, className, index } = item
					const pos = { 'prev': '0', 'current': '0', 'next': '100' }[className]
					const style = {
						position: 'absolute',
						zIndex: index + 1,
						width: '100%',
						height: '100%',
						transition: `transform ease ${this.state.transition}ms`,
						transform: `translate(${pos}%, 0) translateZ(0)`,
					}
					const { Type, component, context, props, mount, unmount, cache } = this.pages[uri]
					return <Type
						context={{ index, ...context, props }}
						style={style}
						component={component}
						key={uri}
					/>
				})
			}
		</div>
	}
}
