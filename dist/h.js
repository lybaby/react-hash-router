import History from './History';
import Observer from './Observer';

var observer = new Observer();
var history = new History(observer);

export { observer, history };