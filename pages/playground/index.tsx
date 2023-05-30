import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQuery } from 'react-query';
import { IdentificationEvent } from '../api/event/[requestId]';
import { FunctionComponent, PropsWithChildren, ReactNode, useState } from 'react';
import { CodeSnippet } from '../../client/components/CodeSnippet';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const BotDetectionResult: FunctionComponent<{ event: IdentificationEvent | undefined }> = ({ event }) => {
  switch (event?.products?.botd?.data?.bot?.result) {
    case 'good':
      return <>You are a good bot</>;
    case 'bad':
      // @ts-ignore
      return <>You are a bad bot (type: {event?.products.botd.data.bot.type})</>;
    case 'notDetected':
      return <>You are not a bot</>;
    default:
      return <>Unknown</>;
  }
};

const MyTable: FunctionComponent<{ data: ReactNode[][] }> = ({ data }) => {
  return (
    <TableContainer component={Paper} sx={{ mb: (t) => t.spacing(3) }}>
      <Table size="small">
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const Info: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <Tooltip title={children} enterTouchDelay={400}>
      <IconButton size="small" sx={{ padding: '2px' }}>
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

function Playground() {
  const {
    data: agentResponse,
    isLoading: isLoadingAgentResponse,
    getData: getAgentData,
    error: agentError,
  } = useVisitorData({ extendedResult: true, ignoreCache: true }, { immediate: true });

  const requestId = agentResponse?.requestId;

  /** Temporary fix to store previous because ReactQuery sets data to undefined before the fresh data is available when I make a new query and it makes everything flash */
  const [chachedEvent, setCachedEvent] = useState<IdentificationEvent | undefined>(undefined);

  const {
    data: identificationEvent,
    isLoading: isLoadingServerResponse,
    error: serverError,
  } = useQuery<IdentificationEvent | undefined>(
    [requestId],
    () =>
      fetch(`/api/event/${agentResponse?.requestId}`).then((res) => {
        if (res.status !== 200) {
          throw new Error(`${res.statusText}`);
        }
        return res.json();
      }),
    { enabled: Boolean(agentResponse), retry: false, onSuccess: (data) => setCachedEvent(data) }
  );

  if (agentError) {
    return <Alert severity={'error'}>JavaScript Agent Error: {agentError.message}.</Alert>;
  }

  if (serverError) {
    return <Alert severity={'error'}>Server API Request {serverError.toString()}.</Alert>;
  }

  if (!chachedEvent) {
    return (
      <Stack alignItems={'center'} gap={5}>
        <CircularProgress />
        <Typography variant="h2" textAlign={'center'}>
          Running device intelligence...
        </Typography>
      </Stack>
    );
  }

  const baseSignals = [
    [
      <>
        Visitor ID
        <Info>
          A unique and stable identifier of your browser. Remains the same even if you use a VPN or open the page in
          Incognito mode.
        </Info>
      </>,
      agentResponse?.visitorId,
    ],
    ['Browser', `${agentResponse?.browserName} ${agentResponse?.browserVersion}`],
    ['Operating System', `${agentResponse?.os} ${agentResponse?.osVersion}`],
  ];

  const usedIdentificationEvent = identificationEvent ?? chachedEvent;

  const SmartSignals = [
    [
      <>
        Geolocation<Info>Your geographic location based on your IP address.</Info>{' '}
      </>,
      `${agentResponse?.ipLocation?.city?.name}, ${agentResponse?.ipLocation?.country?.name}`,
    ],
    ['Incognito Mode', agentResponse?.incognito ? 'Yes' : 'Not detected'],
    [
      <>
        Bot
        <Info>
          Fingerprint detects if the browser is driven by a human, a browser automation tool like Selenium or headless
          Chrome (bad bot) or search engine crawler (good bot).
        </Info>
      </>,
      <BotDetectionResult key="botDetectionResult" event={usedIdentificationEvent} />,
    ],
    [
      <>
        IP Blocklist
        <Info>IP address was part of a known email (SMTP) spam attack or network (SSH/HTTP) attack. </Info>
      </>,
      usedIdentificationEvent?.products?.ipBlocklist?.data?.result === true ? 'Yes' : 'Not detected',
    ],
    [
      <>
        VPN
        <Info>
          The visitor is using a VPN (browser timezone does not match or IP address is owned by a public VPN service
          provider).
        </Info>
      </>,
      usedIdentificationEvent?.products?.vpn?.data?.result === true ? 'Yes' : 'Not detected',
    ],
    [
      <>
        Proxy<Info>The request IP address is used by a public proxy provider.</Info>
      </>,
      usedIdentificationEvent?.products?.proxy?.data?.result === true ? 'Yes' : 'Not detected',
    ],
    [
      <>
        Tor Network<Info>The request IP address is a known Tor network exit node.</Info>
      </>,
      usedIdentificationEvent?.products?.tor?.data?.result === true ? 'Yes' : 'Not detected',
    ],
    [
      <>
        Browser Tampering
        <Info>
          Flag indicating whether browser tampering was detected according to our internal thresholds. For example, if
          the reported user agent is not consistent with other browser attributes.
        </Info>
      </>,
      usedIdentificationEvent?.products?.tampering?.data?.result === true ? 'Yes' : 'Not detected',
    ],
    [
      <>
        Android Emulator<Info>Android specific emulator detection.</Info>
      </>,
      'Not applicable to browsers',
    ],
    [
      <>
        Android Tampering<Info>Android specific root management apps detection, for example, Magisk.</Info>
      </>,
      'Not applicable to browsers',
    ],
  ];

  const RefreshButton = () => {
    const loading = isLoadingAgentResponse || isLoadingServerResponse;
    return (
      <Button
        color="primary"
        variant="outlined"
        sx={{ mr: 'auto', ml: 'auto', mt: (t) => t.spacing(4), mb: (t) => t.spacing(8), display: 'flex' }}
        onClick={() => getAgentData({ ignoreCache: true })}
        disabled={loading}
      >
        {loading ? (
          <>
            Loading...
            <CircularProgress size={'1rem'} thickness={5} sx={{ ml: (t) => t.spacing(2) }} />
          </>
        ) : (
          <>Analyze my browser again</>
        )}
      </Button>
    );
  };

  return (
    <div>
      <Typography variant="h2" textAlign={'center'}>
        Welcome, your visitor ID is{' '}
        <Box sx={{ display: 'inline', color: (t) => t.palette.primary.main, fontWeight: 'bold' }}>
          {agentResponse?.visitorId}
        </Box>
        .
      </Typography>
      <RefreshButton />

      <Typography variant="h3">Base signals (Pro plan)</Typography>
      <MyTable data={baseSignals} />
      <Typography variant="h3">Smart signals (Pro Plus plan)</Typography>
      <MyTable data={SmartSignals} />

      <RefreshButton />

      <Typography variant="h3">Full logs</Typography>

      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="agent-response-content"
          id="agent-response-header"
        >
          <Typography width={'100%'}>JavaScript Agent Response</Typography>
          {isLoadingAgentResponse && (
            <CircularProgress size={'1.2rem'} thickness={5} sx={{ mr: (t) => t.spacing(2) }} />
          )}
        </AccordionSummary>
        <AccordionDetails>
          <CodeSnippet language="json">{JSON.stringify(agentResponse, null, 2)}</CodeSnippet>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="server-event-content" id="server-event-header">
          <Typography width={'100%'}>Server API Response</Typography>
          {isLoadingServerResponse && (
            <CircularProgress size={'1.2rem'} thickness={5} sx={{ mr: (t) => t.spacing(2) }} />
          )}
        </AccordionSummary>
        <AccordionDetails>
          <CodeSnippet language="json">{JSON.stringify(usedIdentificationEvent, null, 2)}</CodeSnippet>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <UseCaseWrapper
      title="Fingerprint Pro Playground"
      description={<p>Analyze your browser with Fingerprint Pro and see all the available signals.</p>}
      showAdminLink={false}
      hideSrcListItem={true}
      contentSx={{ boxShadow: 'none' }}
    >
      <Playground />
    </UseCaseWrapper>
  );
}
