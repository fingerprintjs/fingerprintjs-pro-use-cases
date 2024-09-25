import { NextResponse } from 'next/server';
import { getBlockedIps } from './blockedIpsDatabase';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<string[]>> {
  try {
    const blockedIps = await getBlockedIps();
    return NextResponse.json(blockedIps);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500, statusText: `Something went wrong ${error}` });
  }
}
