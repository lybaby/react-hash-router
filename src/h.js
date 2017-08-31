import History from './History'
import Observer from './Observer'

const observer = new Observer()
const history = new History(observer)

export { observer, history }
