import { NextRequest, NextResponse } from 'next/server';
import { BotVisit, getBotVisits } from './botVisitDatabase';

export const dynamic = 'force-dynamic';

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
