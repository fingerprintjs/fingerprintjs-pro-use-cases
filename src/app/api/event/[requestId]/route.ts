import { NextRequest, NextResponse } from 'next/server';
import { EventResponse, isEventError } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { OUR_ORIGINS } from '../../../../server/checks';
import { IS_PRODUCTION } from '../../../../envShared';
import { fingerprintServerApiClient } from '../../../../server/fingerprint-server-api';

// Also allow our documentation to use the endpoint
const allowedOrigins = [...OUR_ORIGINS, 'https://dev.fingerprint.com'];

const getCorsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': String(origin),
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

type CorsHeaders = ReturnType<typeof getCorsHeaders>;

export async function POST(request: NextRequest, { params }: { params: { requestId: string } }) {
  const origin = request.headers.get('origin');
  const requestId = params.requestId;

  // In production, validate the origin
  if (IS_PRODUCTION && (!origin || !allowedOrigins.includes(origin))) {
    return new NextResponse(null, {
      status: 403,
      statusText: `Origin "${origin}" is not allowed to call this endpoint`,
      headers: getCorsHeaders(origin),
    });
  }

  if (!requestId) {
    return new NextResponse(null, {
      status: 400,
      statusText: 'Missing requestId parameter',
      headers: getCorsHeaders(origin),
    });
  }

  const result = await tryGetFingerprintEvent(requestId);

  if (!result.okay) {
    return sendErrorResponse(result.error, getCorsHeaders(origin));
  }

  return NextResponse.json(result.data, { headers: getCorsHeaders(origin) });
}

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

function sendErrorResponse(error: unknown, corsHeaders: CorsHeaders): NextResponse {
  if (isEventError(error)) {
    return NextResponse.json(
      { message: error.message, code: error.errorCode },
      {
        status: error.statusCode,
        statusText: `${error.errorCode} - ${error.message}`,
        headers: corsHeaders,
      },
    );
  } else {
    return new NextResponse(null, {
      status: 500,
      statusText: `Something went wrong ${error}`,
      headers: corsHeaders,
    });
  }
}

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
