import React, { Component } from 'react';
import './style/App.css';
import Toolbar from './components/Toolbar';

export default class App extends Component {

    constructor(props) {
        super(props);


        this.state = {

        };
    }

    render() {

        return (
            <div className='App bright' >
                <Toolbar />
            </div >
        );
    }
}
