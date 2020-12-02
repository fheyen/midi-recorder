import { faCircle, faMusic, faSave, faToggleOn, faToggleOff, faMicrophoneSlash, faSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { PureComponent } from 'react';
import FileNamePrompt from './FileNamePrompt';
import { Utils, recordAudio, recordMidi } from 'musicvis-lib';
import '../style/Toolbar.css';

export default class Toolbar extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            isRecording: false,
            recordAudio: Utils.getObjectFromLocalStorage('recordAudio') || false,
            showFileNamePrompt: false,
            // Recorders
            midiRecorder: null,
            audioRecorder: null
        };
    }

    async componentDidMount() {
        // Do this here since constructor cannot be async
        try {
            this.setState({ midiRecorder: await recordMidi() });
            console.log('MIDI access sucessful');
        } catch (e) {
            console.log(e);
        }
        try {
            this.setState({ audioRecorder: await recordAudio() });
            console.log('Audio access sucessful');
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Starts a new recording.
     */
    startRecording = () => {
        console.log('Starting recording');
        const { midiRecorder, audioRecorder, recordAudio } = this.state;
        if (!midiRecorder) {
            alert('Cannot record MIDI, no access to device!');
            return;
        }
        this.setState({ isRecording: true });
        // Start MIDI / audio recording
        midiRecorder.start();
        if (recordAudio && audioRecorder) {
            audioRecorder.start();
        }
    }

    /**
     * Stops and saves the currently running recording.
     */
    stopRecording = () => this.setState(
        { isRecording: false },
        () => this.finishRecording(this)
    );

    /**
     * Sends the recording with meta data to the server to be stored.
     */
    async finishRecording(_this) {
        const { midiRecorder, audioRecorder, recordAudio } = _this.state;
        console.log('Stopping recording');
        let audioBlob = null;
        if (recordAudio && audioRecorder) {
            audioBlob = await audioRecorder.stop();
        }
        const recordedNotes = midiRecorder.stop();
        // See if there are notes
        if (!recordedNotes || recordedNotes.length === 0) {
            if (!window.confirm('No MIDI notes where recorded, save anyways?')) {
                return;
            }
        }
        // Set save data to state and show FileNamePrompt
        const saveData = {
            notes: recordedNotes,
            speed: 1,
            selectedTrack: 0,
            timeSelection: null
        };
        this.setState({
            showFileNamePrompt: true,
            saveData,
            audioBlob,
        });
    }

    hideFileNamePrompt = () => this.setState({ showFileNamePrompt: false });


    /**
     * Remember setting in LocalStorage
     */
    toggleAudioRecording = () => {
        const { recordAudio } = this.state;
        const newValue = !recordAudio;
        Utils.storeObjectInLocalStorage('recordAudio', newValue);
        this.setState({ recordAudio: newValue });
    }


    render() {
        const { isRecording, recordAudio, midiRecorder, audioRecorder, showFileNamePrompt, saveData, audioBlob } = this.state;
        return (
            <div className='Toolbar'>
                <div>
                    <button
                        title='Start recording'
                        onClick={this.startRecording}
                        disabled={isRecording}
                    >
                        <span style={{ color: 'rgb(175, 0, 0)' }}>
                            <FontAwesomeIcon icon={faCircle} fixedWidth />
                        </span>
                        Start recording
                    </button>
                    <button
                        title='Finish recording'
                        onClick={this.stopRecording}
                        disabled={!isRecording}
                    >
                        <FontAwesomeIcon icon={faSave} fixedWidth />
                        Finish recording
                    </button>
                </div>
                <div>
                    <button
                        onClick={this.toggleAudioRecording}
                        disabled={isRecording}
                    >
                        <FontAwesomeIcon icon={recordAudio ? faToggleOn : faToggleOff} fixedWidth />&nbsp;
                        Record audio
                    </button>
                </div>
                <div>
                    {!midiRecorder &&
                        <span
                            className='fa-layers fa-fw'
                            style={{ verticalAlign: 'middle' }}
                            title='No MIDI access, cannot record anything! Connect device and reload page'
                        >
                            <FontAwesomeIcon icon={faMusic} fixedWidth />
                            <FontAwesomeIcon icon={faSlash} fixedWidth />
                        </span>
                    }
                    {!audioRecorder &&
                        <span title='No microphone access, cannot record audio! Connect device and reload page'>
                            &nbsp;
                            <FontAwesomeIcon icon={faMicrophoneSlash} fixedWidth />
                        </span>
                    }
                </div>
                {showFileNamePrompt &&
                    <FileNamePrompt
                        saveData={saveData}
                        audioBlob={audioBlob}
                        hideFileNamePrompt={this.hideFileNamePrompt}
                    />
                }
            </div>
        );
    }
}
