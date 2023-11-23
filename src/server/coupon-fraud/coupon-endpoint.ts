import { ensurePostRequest } from '../server';
import { validateCouponRequest } from './visitor-validations';

export const couponEndpoint =
  (requestCallback, additionalChecks = []) =>
  async (req, res) => {
    if (!ensurePostRequest(req, res)) {
      return;
    }

    res.setHeader('Content-Type', 'application/json');

    const validationResult = await validateCouponRequest(req, res, additionalChecks);

    if (res.headersSent) {
      return;
    }

    return requestCallback(req, res, validationResult);
  };
