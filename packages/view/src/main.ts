import { Visual } from 'misakura';
import * as styles from './styles';

const visual = new Visual({ entry: '/scripts/claude3.mrs', styles });
visual.view();
visual.play();
