import * as React from "react";
import Clock from 'clock-react';

import {socket} from './socketConnection';
import {getUserData} from "./api/get";

export default class QRCode extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            qrcode_available: true,
            message: ''
        }
    }

    async componentDidMount() {
        const app = this;

        socket.on('web_trigger_face_id', function (data) {
            app.setState({
                message: data.message
            })
        });
    }

    render() {
        return (
            <div className="qr-screen">
                {
                    this.state.qrcode_available ?
                        <div id={'qrcode-container'}>
                            <p id={'qrcode-description'}>Scan QR-Code to start!</p>
                            <img src={'http://localhost:5000/public/savedQRCode/qrcode.svg'} alt={"QRCode"}
                                 id={'qrcode-image'}/>
                        </div>
                        : null
                }
                <div id="qr-time-container">
                    <Clock/>
                </div>
                <p>{this.state.message}</p>
            </div>
        )
    }
}
