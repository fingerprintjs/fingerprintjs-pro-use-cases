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
import { getFingerprintJS } from '../shared/shared';

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
  const [severity, setSeverity] = useState();
  const [isWaitingForReponse, setIsWaitingForReponse] = useState(false);
  const [httpResponseStatus, setHttpResponseStatus] = useState();
  const [showPassword, setShowPassword] = useState(false);
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

    const loginData = {
      userName,
      password,
      visitorId,
      requestId,
    };

    // Serverside handler for this route is located in api/credential-stuffing/authneticate.js file.
    const response = await fetch('/api/credential-stuffing/authenticate', {
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
    setSeverity(responseJson.severity);
    setHttpResponseStatus(responseStatus);
    setIsWaitingForReponse(false);
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
              attack. Martin reused the same password among different sites and
              his credentials leaked. Luckily for Martin, this service uses
              FingeprintJS Pro and Martin's account is still protected even
              though his credentials are known. Try to hack into Martin's
              account using his credentials <code>user</code> and{' '}
              <code>password</code>. It will be very hard...
            </p>
            <hr className="AuthWrapper_divider" />
            <ul className="AuthWrapper_notes">
              <li>
                Even with correct credentials, you cannot log in if the system
                does not recognize your <code>visitorId</code>. The legit
                account owner can :)
              </li>
              <li>
                If you provide the wrong credentials 5 times, you'd be locked
                out!
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
                {authMessage}
              </Alert>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
