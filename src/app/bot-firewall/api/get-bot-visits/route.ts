import { NextRequest, NextResponse } from 'next/server';
import { getBotVisits, PublicBotVisit } from './botVisitDatabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse<PublicBotVisit[]>> {
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
