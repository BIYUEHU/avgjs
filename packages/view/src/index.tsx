/* @refresh reload */
import { render } from 'solid-js/web'
import './styles/index.css'
import main from './main'

function App() {
  return <>{main('complex')}</>
}

const root = document.getElementById('root')
render(() => <App />, root as HTMLElement)
