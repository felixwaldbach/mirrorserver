import * as React from "react";
import {generateQRCode} from './api/get';
import qrcode from './savedQrCode/qrcode.svg';
import Clock from 'clock-react';

export default class QRCode extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            qrcode_available: false
        }
    }

    async componentDidMount() {
        console.log("Rendering qr code")
        let response = await generateQRCode();
        if (response.status) {
            this.setState({
                qrcode_available: true
            })
        }
    }

    render() {
        return (
            <div className="qr-screen">
                {
                    this.state.qrcode_available ?
                        <div id={'qrcode-container'}>
                            <p id={'qrcode-description'}>Scan QR-Code to start!</p>
                            <img src={qrcode} alt={"QRCode"} id={'qrcode-image'}/>
                        </div>
                        : null
                }
                <div id="qr-time-container">
                    <Clock />
                </div>
            </div>
        )
    }
}
