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
export class Container extends React.Component {
	static propTypes = {
		component: PropTypes.func.isRequired,
		context: PropTypes.shape(),
	}

	static defaultProps = {
		context: {},
	}

	shouldComponentUpdate = nextProps => {
		if ((JSON.stringify(nextProps.context) === JSON.stringify(this.props.context))
			&& (nextProps.component === this.props.component)
		) {
			if (nextProps.style.transform !== this.props.style.transform) {
				Object.keys(nextProps.style).forEach(name => {
					this.container.style[name] = nextProps.style[name]
				})
			}
			return false
		}
		return true
	}

	render() {
		const { style, context, component } = this.props
		const Component = component

		return <div
			style={style}
			data-uri={context.uri}
			ref={ref => { this.container = ref }}
		>
			<Component
				context={{ ...context, observer, navigateTo: history.navigateTo, backTo: history.backTo, replaceWith: history.replaceWith }}
				key={context.uri}
				ref={ref => { this.component = ref }}
			/>
		</div>
	}
}