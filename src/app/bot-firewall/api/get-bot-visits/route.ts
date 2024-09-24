import { BotVisit, getBotVisits } from '../../../../server/botd-firewall/botVisitDatabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse<BotVisit[]>> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const botVisits = await getBotVisits(limit ? Number(limit) : undefined);
    return NextResponse.json(botVisits);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500, statusText: `Something went wrong ${error}` });
  }
}
