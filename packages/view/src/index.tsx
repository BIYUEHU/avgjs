/* @refresh reload */
import { render } from 'solid-js/web';
import './styles/index.css';

function App() {
  import('./main');
  return <></>;
}

const root = document.getElementById('root');
render(() => <App />, root!);
