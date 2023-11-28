import {
  ensurePostRequest,
  ensureValidRequestIdAndVisitorId,
  getIdentificationEvent,
  reportSuspiciousActivity,
} from '../server';
import { checkCountOfViewedArticles } from './article-views';
import { checkResultType } from '../checkResult';
import {
  RequestCallback,
  RuleCheck,
  checkConfidenceScore,
  checkFreshIdentificationRequest,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
} from '../checks';
import { sendForbiddenResponse } from '../response';
import { NextApiRequest, NextApiResponse } from 'next';

// Base checks for every endpoint related to paywall
const paywallChecks: RuleCheck[] = [
  checkFreshIdentificationRequest,
  checkConfidenceScore,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
  // Additional checks that returns error if user exceeded his daily free article views
  checkCountOfViewedArticles,
];

export const paywallEndpoint =
  (requestCallback: RequestCallback, optionalChecks: RuleCheck[] = []) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (!ensurePostRequest(req, res)) {
      return;
    }

    res.setHeader('Content-Type', 'application/json');

    const { visitorId, requestId } = JSON.parse(req.body);

    if (!ensureValidRequestIdAndVisitorId(req, res, visitorId, requestId)) {
      return;
    }

    // Information from the client side might have been tampered.
    // It's best practice to validate provided information with the Server API.
    // It is recommended to use the requestId and visitorId pair.
    const eventResponse = await getIdentificationEvent(requestId);

    for (const ruleCheck of [...paywallChecks, ...optionalChecks]) {
      const result = await ruleCheck(eventResponse, req);

      if (result) {
        switch (result.type) {
          case checkResultType.Passed:
          case checkResultType.Challenged:
            continue;
          case checkResultType.ArticleViewLimitExceeded:
            // No need to report suspicious activity for this error
            return sendForbiddenResponse(res, result);
          default:
            reportSuspiciousActivity(req);
            return sendForbiddenResponse(res, result);
        }
      }
    }

    return requestCallback(req, res, eventResponse);
  };
