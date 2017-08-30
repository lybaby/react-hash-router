import React from 'react'
import PropTypes from 'prop-types'

export default class Bundle extends React.Component {
	static propTypes = {
		load: PropTypes.func.isRequired,
	}

	state = {
		module: null,
	}

	componentWillMount() {
		this.load(this.props)
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.load !== this.props.load) {
			this.load(nextProps)
		}
	}

	load(props) {
		this.setState({ module: null })
		props.load(module => {
			this.setState({ module: module.default ? module.default : module })
		})
	}

	render() {
		if (!this.state.module) {
			return false
		}
		const Component = this.state.module
		const props = Object.assign({}, this.props)
		delete props.load
		return <Component {...props} />
	}
}
