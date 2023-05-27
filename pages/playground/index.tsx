import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery } from 'react-query';
import { IdentificationEvent } from '../api/event/[requestId]';
import { FunctionComponent } from 'react';
import { CodeSnippet } from '../../client/components/CodeSnippet';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const BotDetectionResult: FunctionComponent<{ event: IdentificationEvent }> = ({ event }) => {
  switch (event.products.botd.data.bot.result) {
    case 'good':
      return <>You are a good bot</>;
    case 'bad':
      // @ts-ignore
      return <>You are a bad bot (type: {event.products.botd.data.bot.type})</>;
    case 'notDetected':
      return <>You are not a bot</>;
    default:
      return <>Unknown</>;
  }
};

function Playground() {
  const {
    data: agentResponse,
    isLoading: isLoadingAgentResponse,
    getData: getAgentData,
    error: agentError,
  } = useVisitorData({ extendedResult: true, ignoreCache: true }, { immediate: true });

  const requestId = agentResponse?.requestId;

  const {
    data: identificationEvent,
    isLoading: isLoadingServerResponse,
    error: serverError,
  } = useQuery<IdentificationEvent | undefined>(
    requestId,
    () => fetch(`/api/event/${agentResponse.requestId}`).then((res) => res.json()),

    { enabled: Boolean(agentResponse?.requestId) }
  );

  if (agentError) {
    return <p>Error: {agentError.message}</p>;
  }

  if (serverError) {
    return <p>Error: {serverError.toString()}</p>;
  }

  return (
    <div>
      {agentError && <p>Error: {agentError.message}</p>}
      <h2>Welcome, {agentResponse?.visitorId}</h2>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Signal</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Visitor ID</TableCell>
              <TableCell>{isLoadingAgentResponse ? 'Loading...' : agentResponse?.visitorId}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Browser</TableCell>
              <TableCell>
                {isLoadingAgentResponse
                  ? 'Loading...'
                  : `${agentResponse?.browserName} ${agentResponse?.browserVersion}`}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Operating system</TableCell>
              <TableCell>
                {isLoadingAgentResponse ? 'Loading...' : `${agentResponse?.os} ${agentResponse?.osVersion}`}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Incognito Mode</TableCell>
              <TableCell>{isLoadingAgentResponse ? 'Loading...' : agentResponse?.incognito ? 'Yes' : 'No'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Geolocation</TableCell>
              <TableCell>
                {isLoadingAgentResponse
                  ? 'Loading...'
                  : `${agentResponse?.ipLocation?.city.name}, ${agentResponse?.ipLocation?.country.name}`}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bot Detection</TableCell>
              <TableCell>
                {isLoadingServerResponse ? 'Loading...' : <BotDetectionResult event={identificationEvent} />}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>IP Blocklist</TableCell>
              <TableCell>
                {isLoadingServerResponse
                  ? 'Loading...'
                  : identificationEvent?.products.ipBlocklist.data.result === true
                  ? 'Yes'
                  : 'No'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>VPN</TableCell>
              <TableCell>
                {isLoadingServerResponse
                  ? 'Loading...'
                  : identificationEvent?.products.vpn.data.result === true
                  ? 'Yes'
                  : 'No'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Browser Tampering</TableCell>
              <TableCell>
                {isLoadingServerResponse
                  ? 'Loading...'
                  : identificationEvent?.products.tampering.data.result === true
                  ? 'Yes'
                  : 'No'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Android Tampering Detection</TableCell>
              <TableCell>Not applicable on the web</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Android Emulator Detection</TableCell>
              <TableCell>Not applicable on the web</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <button onClick={() => getAgentData({ ignoreCache: true })}>Analyze browser again</button>
      <p>VisitorId: {isLoadingAgentResponse ? 'Loading...' : agentResponse?.visitorId}</p>

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
          <CodeSnippet language="json">{JSON.stringify(identificationEvent, null, 2)}</CodeSnippet>
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
