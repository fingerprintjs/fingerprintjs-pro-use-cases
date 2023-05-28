import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery } from 'react-query';
import { IdentificationEvent } from '../api/event/[requestId]';
import { FunctionComponent, ReactNode, useState } from 'react';
import { CodeSnippet } from '../../client/components/CodeSnippet';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const BotDetectionResult: FunctionComponent<{ event: IdentificationEvent | undefined }> = ({ event }) => {
  switch (event?.products.botd.data.bot.result) {
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
    () => fetch(`/api/event/${agentResponse.requestId}`).then((res) => res.json()),

    { enabled: Boolean(agentResponse), onSuccess: (data) => (setCachedEvent(data)) }
  );

  if (agentError) {
    return <p>Error: {agentError.message}</p>;
  }

  if (serverError) {
    return <p>Error: {serverError.toString()}</p>;
  }

  console.log({ agentResponse, identificationEvent, isLoadingServerResponse });

  
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
    ['Visitor ID', agentResponse?.visitorId],
    ['Browser', `${agentResponse?.browserName} ${agentResponse?.browserVersion}`],
    ['Operating System', `${agentResponse?.os} ${agentResponse?.osVersion}`],
  ];

  const usedIdentificationEvent = identificationEvent ?? chachedEvent;

  const SmartSignals = [
    ['Geolocation', `${agentResponse?.ipLocation?.city.name}, ${agentResponse?.ipLocation?.country.name}`],
    ['Incognito Mode', agentResponse?.incognito ? 'Yes' : 'Not detected'],
    ['Bot', <BotDetectionResult key="botDetectionResult" event={usedIdentificationEvent} />],
    ['IP Blocklist', usedIdentificationEvent?.products.ipBlocklist.data.result === true ? 'Yes' : 'Not detected'],
    ['VPN ', usedIdentificationEvent?.products.vpn.data.result === true ? 'Yes' : 'Not detected'],
    ['Proxy ', usedIdentificationEvent?.products.proxy.data.result === true ? 'Yes' : 'Not detected'],
    ['Tor ', usedIdentificationEvent?.products.tor.data.result === true ? 'Yes' : 'Not detected'],
    ['Browser Tampering ', usedIdentificationEvent?.products.tampering.data.result === true ? 'Yes' : 'Not detected'],
    ['Android Emulator', 'Not applicable to browsers'],
    ['Android Tampering', 'Not applicable to browsers'],
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
      {agentError && <p>Error: {agentError.message}</p>}
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
    >
      <Playground />
    </UseCaseWrapper>
  );
}
