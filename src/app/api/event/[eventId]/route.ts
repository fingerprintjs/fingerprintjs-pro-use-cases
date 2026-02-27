import { NextRequest, NextResponse } from 'next/server';
import { Event, RequestError } from '@fingerprint/node-sdk';
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

type GetEventPayload = Event | { severity: Severity; message: string };

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

export async function POST(request: NextRequest, { params }: { params: { eventId: string } }) {
  return await handleRequest(request, params.eventId);
}

// For backward compatibility with mobile applications, accept GET requests as well
export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
  return await handleRequest(request, params.eventId);
}

// Main handler
const handleRequest = async (
  request: NextRequest,
  eventId: string | undefined | null,
): Promise<NextResponse<GetEventPayload>> => {
  const origin = request.headers.get('origin');

  // In production, validate the origin
  if (IS_PRODUCTION && (!origin || !allowedOrigins.includes(origin))) {
    const message = `Origin "${origin}" is not allowed to call this endpoint,`;
    return NextResponse.json(
      { severity: 'error', message },
      { status: 403, statusText: message, headers: getCorsHeaders(origin) },
    );
  }

  if (!eventId) {
    const message = 'Missing `eventId` parameter.';
    return NextResponse.json(
      { severity: 'error', message },
      { status: 400, statusText: message, headers: getCorsHeaders(origin) },
    );
  }

  const result = await tryGetFingerprintEvent(eventId);

  if (!result.okay) {
    return sendErrorResponse(result.error, getCorsHeaders(origin));
  }

  return NextResponse.json(result.data, { headers: getCorsHeaders(origin) });
};

async function tryGetFingerprintEvent(
  eventId: string,
  retryCount = 5,
  retryDelay: number = 3000,
): Promise<{ okay: true; data: Event } | { okay: false; error: unknown }> {
  try {
    const eventResponse = await fingerprintServerApiClient.getEvent(eventId);
    return { okay: true, data: eventResponse };
  } catch (error) {
    // Retry only Not Found (404) requests.
    if (error instanceof RequestError && error.statusCode === 404 && retryCount > 1) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return tryGetFingerprintEvent(eventId, retryCount - 1, retryDelay);
    } else {
      console.error(error);
      return { okay: false, error };
    }
  }
}

function sendErrorResponse(error: unknown, corsHeaders: CorsHeaders): NextResponse<GetEventPayload> {
  if (error instanceof RequestError) {
    return NextResponse.json(
      { message: error.message, severity: 'error' },
      { status: error.statusCode, statusText: error.message, headers: corsHeaders },
    );
  } else {
    const message = `Something went wrong ${error}`;
    return NextResponse.json(
      { message, severity: 'error' },
      { status: 500, statusText: message, headers: corsHeaders },
    );
  }
}
