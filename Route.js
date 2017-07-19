import PropTypes from 'prop-types';

const Route = () => {};

Route.propTypes = {
	path: PropTypes.string.isRequired,
	component: PropTypes.func.isRequired
};

export default Route;