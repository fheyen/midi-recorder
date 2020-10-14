import React, { Component } from 'react';
import './style/App.css';
import Toolbar from './components/Toolbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

export default class App extends Component {

    render() {
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
}
