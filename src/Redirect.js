import React from 'react'
import PropTypes from 'prop-types'

export default class Redirect extends React.Component {
	static propTypes = {
		context: PropTypes.shape(),
	}

	static defaultProps = {
		context: {},
	}

	componentWillMount() {
		const { match, query, props, replaceWith, navigateTo } = this.props.context
		const path = props.to.replace(/:[a-zA-Z][a-zA-Z0-9]*/g, m => {
			const variable = m.slice(1)
			if (variable in match) {
				return match[variable]
			}
			else {
				return ''
			}
		})
		this.redirectURI = query === null ? path : `${path}?${query}`
	}

	componentDidMount() {
		const { props, replaceWith, navigateTo } = this.props.context
		if (props.replace) {
			replaceWith(this.redirectURI)
		}
		else {
			navigateTo(this.redirectURI)
		}
	}

	render() {
		return <div>redirect to: {this.redirectURI}</div>
	}
}

// <Redirect path="" to="" replace />
