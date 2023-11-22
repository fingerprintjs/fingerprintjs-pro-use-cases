import { NextApiRequest, NextApiResponse } from 'next';
import { RuleCheck } from '../checks';
import { ensurePostRequest } from '../server';
import { validateCouponRequest } from './visitor-validations';

type RequestCallback = (
  req: NextApiRequest,
  res: NextApiResponse,
  validationResult: Awaited<ReturnType<typeof validateCouponRequest>>,
) => void;

export const couponEndpoint =
  (requestCallback: RequestCallback, additionalChecks: RuleCheck[] = []) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (!ensurePostRequest(req, res)) {
      return;
    }

    res.setHeader('Content-Type', 'application/json');

    const validationResult = await validateCouponRequest(req, res, additionalChecks);

    if (res.headersSent || !validationResult) {
      return;
    }

    return requestCallback(req, res, validationResult);
  };
