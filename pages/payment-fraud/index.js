import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import { getFingerprintJS } from '../../shared/shared';

const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(1),
    },
    withoutLabel: {
        marginTop: theme.spacing(3),
    },
}));

export default function Index() {
    const [cardNumber, setCardNumber] = useState();
    const [cardCvv, setCardCvv] = useState();
    const [cardExpiration, setCardExpiration] = useState();
    const [orderStatusMessage, setOrderStatusMessage] = useState();
    const [severity, setSeverity] = useState();
    const [isWaitingForReponse, setIsWaitingForReponse] = useState(false);
    const [httpResponseStatus, setHttpResponseStatus] = useState();
    const [fp, setFp] = useState();

    useEffect(async () => {
        await getFingerprintJS(setFp)
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setIsWaitingForReponse(true);

        const fpResult = await fp.get();
        const visitorId = fpResult.visitorId;
        const requestId = fpResult.requestId;

        const orderData = {
            cardNumber,
            cardCvv,
            visitorId,
            requestId,
        };

        // Serverside handler for this route is located in api/authneticate.js file.
        const response = await fetch('/api/payment-fraud/place-order', {
            method: 'POST',
            body: JSON.stringify(orderData),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        const responseJson = await response.json();
        const responseStatus = await response.status;
        setOrderStatusMessage(responseJson.message);
        setSeverity(responseJson.severity);
        setHttpResponseStatus(responseStatus);
        setIsWaitingForReponse(false);
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <>
            <div className="ExternalLayout_wrapper">
                <div className="ExternalLayout_main">
                    <div className="AuthWrapper_authWrapper">
                        <h1 className="AuthWrapper_title">Payment Fraud problem</h1>
                        <p className="AuthWrapper_helper">
                            This page demonstrates protected credit card form protected against some payment frauds.
                        </p>
                        <hr className="AuthWrapper_divider" />
                        <ul className="AuthWrapper_notes">
                            <li>
                                Try to random credit card numbers. Can you submit more than 5 credit cards numbers from the same browser?
                            </li>
                            <li>
                                If you have a negative chargeback history, can you place your order?
                            </li>
                            <li>
                                U h4ck3r? You can try to generate new <code>visitorId</code> and{' '}
                                <code>reqeustId</code> and try to log in. Good luck :)
                            </li>
                            <li>
                                Need src?{' '}
                                <a
                                    href="https://github.com/makma/use-cases-credential-stuffing"
                                    target="_blank"
                                >
                                    Sure!
                                </a>
                            </li>
                        </ul>
                        <Paper className="ActionWrapper_container">
                            <form onSubmit={handleSubmit} className="Form_container">
                                <FormControl
                                    fullWidth
                                    className={clsx(useStyles().margin)}
                                    variant="outlined"
                                >
                                    <Typography variant="caption" className="UserInputField">
                                        Card Number
                                    </Typography>
                                    <TextField
                                        placeholder="Card Number"
                                        variant="outlined"
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        required
                                    />
                                </FormControl>
                                <FormControl
                                    fullWidth
                                    className={clsx(useStyles().margin)}
                                    variant="outlined"
                                >
                                    <Typography variant="caption" className="UserInputField">
                                        Expiration
                                    </Typography>
                                    <OutlinedInput
                                        placeholder="Expiration"
                                        variant="outlined"
                                        onChange={(e) => setCardExpiration(e.target.value)}
                                        required
                                    />
                                    <Typography variant="caption" className="UserInputField">
                                        CVV
                                    </Typography>
                                    <OutlinedInput
                                        placeholder="CVV"
                                        variant="outlined"
                                        onChange={(e) => setCardCvv(e.target.value)}
                                        required
                                    />
                                </FormControl>
                                <Button
                                    className="Form_button"
                                    disabled={isWaitingForReponse}
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disableElevation
                                    fullWidth
                                >
                                    {isWaitingForReponse ? 'Hold on, doing magic...' : 'Log In'}
                                </Button>
                            </form>
                        </Paper>
                        {httpResponseStatus ? (
                            <Alert severity={severity} className="AuthWrapper_alert">
                                {orderStatusMessage}
                            </Alert>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
}
