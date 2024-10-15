import { NextRequest, NextResponse } from 'next/server';
import { EventResponse, isEventError } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { OUR_ORIGINS, Severity } from '../../../../server/checks';
import { IS_PRODUCTION } from '../../../../envShared';
import { fingerprintServerApiClient } from '../../../../server/fingerprint-server-api';

// Also allow our documentation to use the endpoint
const allowedOrigins = [...OUR_ORIGINS, 'https://dev.fingerprint.com'];

// Handle CORS
const getCorsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': String(origin),
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

type CorsHeaders = ReturnType<typeof getCorsHeaders>;

type GetEventPayload = EventResponse | { severity: Severity; message: string };

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');

  // CORS preflight
  if (origin && allowedOrigins.includes(origin)) {
    return new NextResponse(null, {
      status: 200,
      headers: getCorsHeaders(origin),
    });
  }

  return new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest, { params }: { params: { requestId: string } }) {
  return await handleRequest(request, params.requestId);
}

// For backward compatibility with mobile applications, accept GET requests as well
export async function GET(request: NextRequest, { params }: { params: { requestId: string } }) {
  return await handleRequest(request, params.requestId);
}

// Main handler
const handleRequest = async (
  request: NextRequest,
  requestId: string | undefined | null,
): Promise<NextResponse<GetEventPayload>> => {
  const origin = request.headers.get('origin');

  // In production, validate the origin
  if (IS_PRODUCTION && (!origin || !allowedOrigins.includes(origin))) {
    return NextResponse.json(
      { severity: 'error', message: `Origin "${origin}" is not allowed to call this endpoint,` },
      { status: 403, headers: getCorsHeaders(origin) },
    );
  }

  if (!requestId) {
    return NextResponse.json(
      { severity: 'error', message: 'Missing `requestId` parameter.' },
      { status: 400, headers: getCorsHeaders(origin) },
    );
  }

  const result = await tryGetFingerprintEvent(requestId);

  if (!result.okay) {
    return sendErrorResponse(result.error, getCorsHeaders(origin));
  }

  return NextResponse.json(result.data, { headers: getCorsHeaders(origin) });
};

async function tryGetFingerprintEvent(
  requestId: string,
  retryCount = 5,
  retryDelay: number = 3000,
): Promise<{ okay: true; data: EventResponse } | { okay: false; error: unknown }> {
  try {
    const eventResponse = await fingerprintServerApiClient.getEvent(requestId);
    return { okay: true, data: eventResponse };
  } catch (error) {
    // Retry only Not Found (404) requests.
    if (isEventError(error) && error.statusCode === 404 && retryCount > 1) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return tryGetFingerprintEvent(requestId, retryCount - 1, retryDelay);
    } else {
      console.error(error);
      return { okay: false, error };
    }
  }
}

function sendErrorResponse(error: unknown, corsHeaders: CorsHeaders): NextResponse<GetEventPayload> {
  if (isEventError(error)) {
    return NextResponse.json(
      { message: error.message, severity: 'error' },
      { status: error.statusCode, headers: corsHeaders },
    );
  } else {
    return NextResponse.json(
      { message: `Something went wrong ${error}`, severity: 'error' },
      { status: 500, headers: corsHeaders },
    );
  }
}
