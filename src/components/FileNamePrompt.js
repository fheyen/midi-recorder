import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { PureComponent } from 'react';
import { saveAs } from 'file-saver';
import { formatDate } from '../lib/Utils';
import { getObjectFromLocalStorage, storeObjectInLocalStorage } from '../lib/utils/LocalStorageUtils';
import '../style/FileNamePrompt.css';

export default class FileNamePrompt extends PureComponent {

    constructor(props) {
        super(props);
        const prevNames = getObjectFromLocalStorage('previousNames') || [];
        const date = new Date();
        this.state = {
            isRecording: false,
            recordAudio: true,
            date,
            name: `Unnamed ${date.getTime()}`,
            prevNames,
            prevNamesFiltered: prevNames
        };
    }

    /**
     * Sends the recording with meta data to the server to be stored.
     */
    prepareDownload = () => {
        const { date, name, prevNames } = this.state;
        const { saveData, audioBlob, hideFileNamePrompt } = this.props;

        // Save name
        if (!prevNames.includes(name) && name !== '') {
            prevNames.push(name);
            prevNames.sort();
            storeObjectInLocalStorage('previousNames', prevNames);
        }

        // Get file name
        const nowStr = formatDate(date);
        const fileNameMidi = `${name}_${nowStr}.json`;
        // Save data to server
        const saveDataFinal = {
            ...saveData,
            fileName: fileNameMidi,
            name,
            date,
        };
        console.log(saveDataFinal);
        this.download(JSON.stringify(saveDataFinal), fileNameMidi);
        if (audioBlob) {
            const ext = audioBlob.type.split('/')[1].split(';')[0];
            const fileNameAudio = `${name}_${nowStr}.${ext}`;
            saveAs(audioBlob, fileNameAudio);
        }
        hideFileNamePrompt();
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

    /**
     * Filters file names to those that contain the input string.
     * @param {Event} evt input onchange event
     */
    handleSearchEntry = (evt) => {
        const str = evt.target.value.toLowerCase();
        const filtered = this.state.prevNames.filter(d => d.toLowerCase().includes(str));
        this.setState({
            prevNamesFiltered: filtered,
            name: str
        });
    }


    render() {
        const { name, prevNamesFiltered } = this.state;
        return (
            <div className='FileNamePrompt'>
                <div>
                    <div className='nameInputDiv'>
                        <label>
                            Name:&nbsp;
                            <input
                                className='nameInput'
                                type='text'
                                onChange={this.handleSearchEntry}
                                // defaultValue={name}
                                value={name}
                            />
                        </label>
                    </div>
                    <div>
                        <button
                            className='downloadBtn'
                            onClick={this.prepareDownload}
                        >
                            <FontAwesomeIcon icon={faDownload} fixedWidth />&nbsp;
                            Download
                        </button>
                    </div>
                    Previous names:
                    <div className='prevNamesList'>
                        {prevNamesFiltered.map(d => (
                            <span
                                className='prevName'
                                key={d}
                                onClick={() => this.setState({ name: d })}
                            >
                                {d}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}
