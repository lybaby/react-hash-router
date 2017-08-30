# react-hash-router
An hash-based router for React

# build
`npm install` or `yarn install`

`./node_modules/.bin/babel src -d ./`

# 使用

index.js

	import React from 'react'
	import { Router, Route, Bundle } from 'react-hash-router'

	// 打包进去
	import Index from './Home'

	// 按需加载
	const Detail = (<Bundle
		{...props}
		{cb => require.ensure([], require => cb(require('./Detail')), 'detail')}
	/>)

	export default () => (<Router path="/">
		<Route component={Index} path="" />
		<Route component={Detail} path=":id" />
	</Router>)

Home.js

	import React from 'react'
	import PropTypes from 'prop-types'
	import { Link } from 'react-hash-router'

	export default class extends React.Component {
		static propTypes = {
			context: PropTypes.shape().isRequired,
		}

		render() {
			return <div>
				<Link to="1" title="page 1">page 1</Link>
				<Link to="2" style={{ outline: none }}>page 2</Link>
				<Link className="page-3" onClick={() => this.props.context.navigateTo('3')}>page 3</Link>
			</div>
		}
	}

Detail.js

	import React from 'react'
	import PropTypes from 'prop-types'
	import { Link } from 'react-hash-router'

	export default class extends React.Component {
		static propTypes = {
			context: PropTypes.shape().isRequired,
		}

		render() {
			// context = { uri, match, query, args, navigateTo(to), backTo(to, fromStart), observer: { publish('KEY', data), subscribe('KEY', callback(data)), unsubscribe('KEY', callback) } }
			return <div>
				<p>uri = {this.props.context.uri}<br />id = {this.props.context.match.id}</p>
				<Link onClick={() => this.props.context.backTo('./', true)}>back to home page</Link>
			</div>
		}
	}
