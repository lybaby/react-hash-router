import React from 'react'
import PropTypes from 'prop-types'

import { observer, history } from './h'

// route
const Route = () => {}

Route.propTypes = {
	path: PropTypes.string.isRequired,
	component: PropTypes.func.isRequired,
}

export default Route

// route container
class Container extends React.Component {
	static propTypes = {
		component: PropTypes.func.isRequired,
		context: PropTypes.shape(),
		className: PropTypes.string,
	}

	static defaultProps = {
		context: {},
		className: '',
	}

	shouldComponentUpdate = nextProps => {
		if ((JSON.stringify(nextProps.context) === JSON.stringify(this.props.context))
			&& (nextProps.component === this.props.component)
		) {
			if (nextProps.className !== this.props.className) {
				this.container.className = `route ${nextProps.className}`
			}
			return false
		}
		return true
	}

	render() {
		const { className, context, component } = this.props
		const Component = component

		return <div
			className={`route ${className}`}
			data-uri={context.uri}
			ref={ref => { this.container = ref }}
		>
			<Component
				context={{ ...context, observer, navigateTo: history.navigateTo, backTo: history.backTo, replaceWith: history.replaceWith }}
				key={context.uri}
			/>
		</div>
	}
}

export { Container }
