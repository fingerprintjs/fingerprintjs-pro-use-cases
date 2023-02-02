import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import makeStyles from '@mui/styles/makeStyles';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import { useVisitorData } from '../../client/use-visitor-data';

const useStyles = makeStyles((theme) => ({
  margin: {
    'margin-top': theme.spacing(1),
    'margin-bottom': theme.spacing(1),
  },
  withoutLabel: {
    marginTop: theme.spacing(3),
  },
}));

export default function Index() {
  const visitorDataQuery = useVisitorData({
    // Don't fetch visitorData on mount
    enabled: false,
  });

  // Default mocked user data
  const [userName, setUserName] = useState('user');
  const [password, setPassword] = useState('password');

  const [authMessage, setAuthMessage] = useState();
  const [severity, setSeverity] = useState();
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  /**
   * @type {[number, React.Dispatch<number>]}
   */
  const [httpResponseStatus, setHttpResponseStatus] = useState();
  const [showPassword, setShowPassword] = useState(false);

  /**
   * @type {React.MutableRefObject<HTMLDivElement | null>}
   */
  const messageRef = useRef();

  useEffect(() => {
    !isWaitingForResponse && messageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isWaitingForResponse]);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsWaitingForResponse(true);

    const fpQuery = await visitorDataQuery.refetch();
    const { requestId, visitorId } = fpQuery.data;

    const loginData = {
      userName,
      password,
      visitorId,
      requestId,
    };

    // Server-side handler for this route is located in api/credential-stuffing/authenticate.js file.
    const response = await fetch('/api/credential-stuffing/authenticate', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const responseJson = await response.json();
    const responseStatus = response.status;
    setAuthMessage(responseJson.message);
    setSeverity(responseJson.severity);
    setHttpResponseStatus(responseStatus);
    setIsWaitingForResponse(false);
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <UseCaseWrapper
      title="Credential Stuffing problem"
      description={
        <>
          This page demonstrates login form protected against{' '}
          <a href="https://fingerprint.com/blog/credential-stuffing-prevention-checklist/">Credential Stuffing</a>{' '}
          attack. Martin reused the same password among different sites and his credentials leaked. Luckily for Martin,
          this service uses FingeprintJS Pro and Martin&apos;s account is still protected even though his credentials
          are known. Try to hack into Martin&apos;s account using his credentials <code>user</code> and{' '}
          <code>password</code>. It will be very hard...
        </>
      }
      articleURL="https://fingerprint.com/use-cases/credential-stuffing/"
      listItems={[
        <>
          Even with correct credentials, you cannot log in if the system does not recognize your <code>visitorId</code>.
          The legit account owner can :)
        </>,
        <>If you provide the wrong credentials 5 times, you&apos;d be locked out!</>,
        <>
          {' '}
          U h4ck3r? You can try to generate new <code>visitorId</code> and <code>requestId</code> and try to log in.
          Good luck :)
        </>,
      ]}
    >
      <form onSubmit={handleSubmit} className="Form_container">
        <FormControl fullWidth className={clsx(useStyles().margin)} variant="outlined">
          <Typography variant="caption" className="UserInput_label">
            Username
          </Typography>
          <TextField
            placeholder="Username"
            variant="outlined"
            defaultValue={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </FormControl>
        <FormControl fullWidth className={clsx(useStyles().margin)} variant="outlined">
          <Typography variant="caption" className="UserInput_label">
            Password
          </Typography>
          <OutlinedInput
            placeholder="Password"
            type={showPassword ? 'text' : 'password'}
            defaultValue={password}
            value={password || ''}
            onChange={(e) => setPassword(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  size="large"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            required
          />
        </FormControl>
        <Button
          className="Form_button"
          disabled={isWaitingForResponse}
          size="large"
          type="submit"
          variant="contained"
          color="primary"
          disableElevation
          fullWidth
        >
          {isWaitingForResponse ? 'Hold on, doing magic...' : 'Log In'}
        </Button>
      </form>
      {httpResponseStatus ? (
        <Alert ref={messageRef} severity={severity} className="UsecaseWrapper_alert">
          {authMessage}
        </Alert>
      ) : null}
    </UseCaseWrapper>
  );
}
