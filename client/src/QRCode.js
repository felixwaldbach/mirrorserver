import * as React from "react";
import {generateQRCode} from './api/get';
import qrcode from './savedQrCode/qrcode.svg';


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
            <div>
                {
                    this.state.qrcode_available ?
                        <div className={'qrcode-container'}>
                            <p className={'qrcode-description'}>Scan QR Code to create a new profile</p>
                            <img src={qrcode} alt={"QRCode"} className={'qrcode-image'}/>
                        </div>
                        : null

                }
            </div>
        )
    }
}