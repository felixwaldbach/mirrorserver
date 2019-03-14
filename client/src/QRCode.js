import * as React from "react";
import {generateQRCode} from './api/get';
//import qrcode from 'http://localhost:5000/public/savedQRCode/qrcode.svg';
import Clock from 'clock-react';

export default class QRCode extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            qrcode_available: true,
            qrcode: ''
        }
    }

    render() {
        return (
            <div className="qr-screen">
                {
                    this.state.qrcode_available ?
                        <div id={'qrcode-container'}>
                            <p id={'qrcode-description'}>Scan QR-Code to start!</p>
                            <img src={'http://localhost:5000/public/savedQRCode/qrcode.svg'} alt={"QRCode"} id={'qrcode-image'}/>
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
