import Misakura from 'misakura';
import * as styles from './styles';

const ctx = new Misakura({ entry: '/scripts/claude3.mrs', styles });
ctx.view();
ctx.play();
