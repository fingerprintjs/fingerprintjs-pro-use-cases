import { NextRequest, NextResponse } from 'next/server';
import { isEventError } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { OUR_ORIGINS } from '../../../../server/checks';
import { IS_PRODUCTION } from '../../../../envShared';
import { fingerprintServerApiClient } from '../../../../server/fingerprint-server-api';

// Also allow our documentation to use the endpoint
const allowedOrigins = [...OUR_ORIGINS, 'https://dev.fingerprint.com'];

export async function POST(request: NextRequest, { params }: { params: { requestId: string } }) {
  const origin = request.headers.get('origin');
  const requestId = params.requestId;

  // In production, validate the origin
  if (IS_PRODUCTION && (!origin || !allowedOrigins.includes(origin))) {
    return new NextResponse(null, {
      status: 403,
      statusText: `Origin "${origin}" is not allowed to call this endpoint`,
    });
  }

  if (!requestId) {
    return new NextResponse(null, {
      status: 400,
      statusText: 'Missing requestId parameter',
    });
  }

  return tryGetFingerprintEvent(requestId);
}

async function tryGetFingerprintEvent(
  requestId: string,
  retryCount = 5,
  retryDelay: number = 3000,
): Promise<NextResponse> {
  try {
    const eventResponse = await fingerprintServerApiClient.getEvent(requestId);
    return NextResponse.json(eventResponse);
  } catch (error) {
    // Retry only Not Found (404) requests.
    if (isEventError(error) && error.statusCode === 404 && retryCount > 1) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return tryGetFingerprintEvent(requestId, retryCount - 1, retryDelay);
    } else {
      console.error(error);
      return sendErrorResponse(error);
    }
  }
}

function sendErrorResponse(error: unknown): NextResponse {
  if (isEventError(error)) {
    return NextResponse.json(
      { message: error.message, code: error.errorCode },
      { status: error.statusCode, statusText: `${error.errorCode} - ${error.message}` },
    );
  } else {
    return new NextResponse(null, {
      status: 500,
      statusText: `Something went wrong ${error}`,
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');

  // CORS preflight
  if (origin && allowedOrigins.includes(origin)) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  return new NextResponse(null, { status: 204 });
}
