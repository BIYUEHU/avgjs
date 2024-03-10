import './styles.css';
import { Visual } from './utils';

const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
const [viewportWidth, viewportHeight] =
  windowWidth / windowHeight < 16 / 9 ? [windowWidth, (windowWidth * 9) / 16] : [(windowHeight * 16) / 9, windowHeight];

const visual = new Visual({
  width: viewportWidth,
  height: viewportHeight,
  // resolution: window.devicePixelRatio || 1,
  // antialias: true,
  // autoDensity: true,
});

visual.setBackground('/images/bg.png');
visual.addCharcter('/images/character/c1.png');

/* infer width and height */
if (window.innerHeight > window.innerWidth) {
  document.body.style.transform = 'rotate(-90deg)';
  document.body.style.transformOrigin = 'left top';
  if (visual.app.view.style) visual.app.view.style['transform' as keyof typeof visual.app.view.style] = 'rotate(90deg)';
  visual.app.stage.x = windowWidth;
  visual.app.stage.y = 0;
}

visual.view();

function App() {
  return <></>;
}

export default App;
