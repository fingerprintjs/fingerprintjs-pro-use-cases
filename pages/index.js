import React, { useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';
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

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
  withoutLabel: {
    marginTop: theme.spacing(3),
  },
}));

export default function Index() {
  const [userName, setUserName] = useState();
  const [password, setPassword] = useState();
  const [authMessage, setAuthMessage] = useState();
  const [httpResponseStatus, setHttpResponseStatus] = useState();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    // This example demonstrates using the NPM package for FingerprintJS Pro agent.
    // In the real world react-powerred apps we recommend using our FingerprintJS Pro react library instead: https://github.com/fingerprintjs/fingerprintjs-pro-react
    const fpPromise = FingerprintJS.load({ token: 'rzpSduhT63F6jaS35HFo' }); // FingerprintJS Pro API key is avaialble from the dashboard at: https://dashboard.fingerprintjs.com/login

    // Alternatively, one can also use the CDN approach instead of NPM: https://dev.fingerprintjs.com/docs#js-agent
    // const fpPromise = import('https://fpcdn.io/v3/rzpSduhT63F6jaS35HFo').then(
    //   (FingerprintJS) => FingerprintJS.load()
    // );

    const fp = await fpPromise;
    const result = await fp.get();
    const visitorId = result.visitorId;
    const requestId = result.requestId;

    const loginData = {
      userName,
      password,
      visitorId,
      requestId,
    };

    const response = await fetch('/api/authenticate', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const responseJson = await response.json();
    const responseStatus = await response.status;
    setAuthMessage(responseJson.message);
    setHttpResponseStatus(responseStatus);
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <div className="ExternalLayout_wrapper">
        <div className="ExternalLayout_main">
          <div className="AuthWrapper_authWrapper">
            <h1 className="AuthWrapper_title">Credential Stuffing problem</h1>
            <p className="AuthWrapper_helper">
              This page demonstrates login form protected against{' '}
              <a href="https://fingerprintjs.com/blog/credential-stuffing-prevention-checklist/">
                Credential Stuffing
              </a>{' '}
              attack. To test solution, user username: <code>user</code> and
              password: <code>password</code>
            </p>
            <ul className="AuthWrapper_notes">
              <li>
                Even with correct credentials you cannot log in if the system
                does not recognise your <code>visitorId</code>. The legit
                account owner can :)
              </li>
              <li>
                If you provide wrong credentials 5 time, you'd be locked out!
              </li>
              <li>
                Can you use an old <code>requestId</code>? Try it!
              </li>
              <li>
                Try to intercept and forge <code>visitorId</code> in the
                authentication request.
              </li>
              <li>
                Try to edit <code>confidence score</code> treshold on the server
                side. How did it change behavior?
              </li>
            </ul>
            <Paper className="AuthWrapper_container">
              <form onSubmit={handleSubmit} className="AuthForm_container">
                <FormControl
                  fullWidth
                  className={clsx(useStyles().margin)}
                  variant="outlined"
                >
                  <Typography variant="caption" className="UsernameInput_label">
                    Username
                  </Typography>
                  <TextField
                    placeholder="Username"
                    variant="outlined"
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  className={clsx(useStyles().margin)}
                  variant="outlined"
                >
                  <Typography variant="caption" className="PasswordInput_label">
                    Password
                  </Typography>
                  <OutlinedInput
                    placeholder="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password || ''}
                    onChange={(e) => setPassword(e.target.value)}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                    required
                  />
                </FormControl>
                <Button
                  className="AuthForm_button"
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                  disableElevation
                  fullWidth
                >
                  Log In
                </Button>
              </form>
            </Paper>
            {httpResponseStatus ? (
              <Alert
                severity={httpResponseStatus === 200 ? 'success' : 'error'}
                className="AuthWrapper_alert"
              >
                {authMessage}
              </Alert>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
