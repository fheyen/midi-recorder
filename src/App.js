import './style/App.css';
import Toolbar from './components/Toolbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

function App() {
  return (
    <div className='App bright' >
      <Toolbar />
      <div className='githubLink'>
        <a href='https://github.com/fheyen/midi-recorder'>
          <FontAwesomeIcon icon={faGithub} />&nbsp;
                        https://github.com/fheyen/midi-recorder
          </a>
      </div>
    </div >
  );
}

export default App;
