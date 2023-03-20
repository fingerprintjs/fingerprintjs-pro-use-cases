import { useRef } from 'react';
import { useVisitorData } from '../../client/use-visitor-data';
import { useEffect, useState } from 'react';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import clsx from 'clsx';
import makeStyles from '@mui/styles/makeStyles';
import { FormControl, MenuItem, Select } from '@mui/material';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

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
  const authenticatedUser = {
    id: 'qwe123',
    username: 'johndoe1999',
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@example.tld',
    groupId: 'group123',
  };
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contactFormSent, setContactFormSent] = useState(false);
  const messageRef = useRef();

  const pageVisitedQuery = useVisitorData({
    // Don't fetch visitorData on mount
    enabled: false,
    tag: {
      integrations: {
        segment: {
          skipIntegration: false,
          page: {
            name: 'Sales Contact Page',
          },
          identify: {
            userId: authenticatedUser.id,
            traits: {
              name: `${authenticatedUser.firstName} ${authenticatedUser.lastName}`,
              email: authenticatedUser.email,
            },
          },
        },
      },
    },
  });

  const contactFormSentQuery = useVisitorData({
    enabled: false,
    tag: {
      integrations: {
        segment: {
          skipIntegration: false,
          identify: {
            userId: authenticatedUser.id,
            traits: {
              name: `${authenticatedUser.firstName} ${authenticatedUser.lastName}`,
              email: authenticatedUser.email,
            },
          },
          track: {
            event: 'Contact Form Submitted',
            properties: {
              industry,
              email,
            },
          },
          group: {
            groupId: authenticatedUser.groupId,
            traits: {
              industry,
              email,
            },
          },
        },
      },
    },
  });

  useEffect(() => {
    pageVisitedQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    await contactFormSentQuery.refetch();
    setIsLoading(false);
    setContactFormSent(true);
  }

  return (
    <UseCaseWrapper
      title="Segment Use Case - Sales Contact Page"
      description={<p>This page demonstrates fingerprint -&gt; segment integration.</p>}
      articleURL="https://www.notion.so/fingerprintjs/Source-Function-POC-1bd52067eac645dd9ee7e9f4d43bb75b"
      listItems={[
        <>
          When a user lands has a new visit on the site, a Fingerprint is generated and passed to Segment along with
          Segment’s user id. Those two are fired as the user browses the site with the page information for tracking
          purposes.
        </>,
        <>
          When a user submits the contact form, the Fingerprint ID, Segment Anonymous ID is fired with two additional
          data points: the inputted email, and dropdown with industry type.
        </>,
      ]}
    >
      <form onSubmit={handleSubmit} className="Form_container">
        <FormControl fullWidth className={clsx(useStyles().margin)} variant="outlined">
          <Typography variant="caption" className="UserInput_label">
            Email
          </Typography>
          <TextField
            name="email"
            placeholder="Email"
            defaultValue={email}
            variant="outlined"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormControl>
        <FormControl fullWidth className={clsx(useStyles().margin)} variant="outlined">
          <Typography variant="caption" className="UserInput_label">
            Industry
          </Typography>
          <Select
            name="industry"
            placeholder="Select an industry"
            defaultValue={industry}
            variant="outlined"
            onChange={(e) => setIndustry(e.target.value)}
            required
          >
            <MenuItem value="Tech">Tech</MenuItem>
            <MenuItem value="Medical">Medical</MenuItem>
            <MenuItem value="Press">Press</MenuItem>
            <MenuItem value="Government">Government</MenuItem>
          </Select>
        </FormControl>

        <Button
          className="Form_button"
          disabled={isLoading || contactFormSent}
          size="large"
          type="submit"
          variant="contained"
          color="primary"
          disableElevation
          fullWidth
        >
          {isLoading ? 'Hold on, doing magic...' : 'Submit Contact'}
        </Button>
      </form>

      {contactFormSent ? (
        <Alert ref={messageRef} severity="info" className="UsecaseWrapper_alert">
          Your contact request has ben delivered, our team will reach out to you soon
        </Alert>
      ) : null}
    </UseCaseWrapper>
  );
}
