import * as React from "react";
import Clock from 'clock-react';

import {socket} from './socketConnection';

export default class QRCode extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            qrcode_available: true,
            message: '',
            displayMessage: true
        }
    }

    async componentDidMount() {
        const app = this;

        socket.on('wait_trigger_face_id', function (data) {
            console.log(data)
            app.setState({
                message: data.message,
                displayMessage: data.displayMessage
            });
        });
    }

    render() {

        return (
            <div className="qr-screen">
                {
                    this.state.qrcode_available ?
                        <div id={'qrcode-container'}>
                            <p id={'qrcode-description'}>Scan QR-Code to start!</p>
                            {this.state.displayMessage ? <p className={'faceIdMessage'}>{this.state.message}</p> : null}
                            <img src={'http://localhost:5000/public/savedQRCode/qrcode.svg'} alt={"QRCode"}
                                 id={'qrcode-image'}/>
                        </div>
                        : null
                }
                <div id="qr-time-container">
                    <Clock/>

                </div>
            </div>
        )
    }
}
