import { NextResponse } from 'next/server';
import {
  ProductionE2eTestActionName,
  productionE2eTestActions,
} from '../../../../../e2e/accountSharing/accountSharingTestUtils';
import { env } from '../../../../env';

/**
 * Sometimes e2e tests manipulate the database to set up or clean up test data.
 * Since we also run e2e tests against production, this is a way to perform these actions on production,
 * without having to write separate tests for it.
 */
export type AccountSharingAdminPayload = {
  e2eTestToken: string;
  action: ProductionE2eTestActionName;
};

export type AccountSharingAdminResponse = {
  message: string;
  severity: 'success' | 'error';
  error?: any;
};

export async function POST(req: Request): Promise<NextResponse<AccountSharingAdminResponse>> {
  const { e2eTestToken, action } = (await req.json()) as AccountSharingAdminPayload;

  if (e2eTestToken !== env.E2E_TEST_TOKEN) {
    return NextResponse.json({ message: 'Invalid e2e test token', severity: 'error' }, { status: 401 });
  }

  try {
    // Account sharing actions
    if (action in productionE2eTestActions) {
      await productionE2eTestActions[action]();
    } else {
      throw new Error(`Invalid action: ${action}`);
    }
    return NextResponse.json({ message: 'Action performed successfully', severity: 'success' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to perform action', severity: 'error', error }, { status: 500 });
  }
}
