import { Visual } from 'misakura';
import * as styles from './styles';

const visual = new Visual({ entry: '/scripts/demo1.mrs', styles });
visual.view();
await visual.play();
