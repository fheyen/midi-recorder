import { faCircle, faMusic, faSave, faToggleOn, faToggleOff, faMicrophoneSlash, faSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { PureComponent } from 'react';
import { saveAs } from 'file-saver';
import { formatDate } from '../lib/Utils';
import { recordAudio } from '../lib/AudioRecorder';
import { recordMidi } from '../lib/MidiRecorder';
import '../style/Toolbar.css';

export default class Toolbar extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            isRecording: false,
            recordAudio: true
        };
    }

    async componentDidMount() {
        // Do this here since constructor cannot be async
        this.setState({
            midiRecorder: await recordMidi(),
            audioRecorder: await recordAudio()
        });
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
        // Shift to time selection
        // if (!window.confirm('Save?')) { return; }
        // Get filename-appropriate date string
        const now = new Date();
        const nowStr = formatDate(now);
        // Get song name if no ground truth present
        let name = prompt('Please enter a title', `Unnamed ${now.getTime()}`);
        // Save data to server
        const fileNameMidi = `${name}_${nowStr}.json`;
        const saveData = {
            fileName: fileNameMidi,
            name,
            date: now,
            notes: recordedNotes,
            speed: 1,
            selectedTrack: 0,
            timeSelection: null
        };
        console.log(saveData);
        this.download(JSON.stringify(saveData), fileNameMidi);
        if (audioBlob) {
            const ext = audioBlob.type.split('/')[1].split(';')[0];
            const fileNameAudio = `${name}_${nowStr}.${ext}`;
            saveAs(audioBlob, fileNameAudio);
        }
    }

    download = (text, fileName) => {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', fileName);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }


    render() {
        const { isRecording, recordAudio } = this.state;
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
                        onClick={() => this.setState({ recordAudio: !recordAudio })}
                    >
                        <FontAwesomeIcon icon={recordAudio ? faToggleOn : faToggleOff} fixedWidth />&nbsp;
                        Record audio
                    </button>
                </div>
                <div>
                    {!this.state.midiRecorder &&
                        <span
                            className='fa-layers fa-fw'
                            style={{ verticalAlign: 'middle' }}
                            title='No MIDI access, cannot record anything! Connect device and reload page'
                        >
                            <FontAwesomeIcon icon={faMusic} fixedWidth />
                            <FontAwesomeIcon icon={faSlash} fixedWidth />
                        </span>
                    }
                    {!this.state.audioRecorder &&
                        <span title='No microphone access, cannot record audio! Connect device and reload page'>
                            &nbsp;
                            <FontAwesomeIcon icon={faMicrophoneSlash} fixedWidth />
                        </span>
                    }
                </div>
            </div>
        );
    }
}
