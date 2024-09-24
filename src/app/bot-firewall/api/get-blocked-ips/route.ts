import { getBlockedIps } from '../../../../server/botd-firewall/blockedIpsDatabase';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse<string[]>> {
  try {
    const blockedIps = await getBlockedIps();
    return NextResponse.json(blockedIps);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500, statusText: `Something went wrong ${error}` });
  }
}
