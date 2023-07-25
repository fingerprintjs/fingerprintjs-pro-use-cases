import {
  ensurePostRequest,
  ensureValidRequestIdAndVisitorId,
  getVisitorDataWithRequestId,
  reportSuspiciousActivity,
} from '../server';
import { initPaywall } from './database';
import { checkCountOfViewedArticles } from './article-views';
import { checkResultType } from '../checkResult';
import {
  checkConfidenceScore,
  checkFreshIdentificationRequest,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
} from '../checks';
import { sendForbiddenResponse } from '../response';

// Base checks for every endpoint related to paywall
const paywallChecks = [
  checkFreshIdentificationRequest,
  checkConfidenceScore,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
  // Additional checks that returns error if user exceeded his daily free article views
  checkCountOfViewedArticles,
];

// Provides common logic used in the paywall use-case
export const paywallEndpoint =
  (requestCallback, optionalChecks = []) =>
  async (req, res) => {
    if (!ensurePostRequest(req, res)) {
      return;
    }

    await initPaywall();

    res.setHeader('Content-Type', 'application/json');

    const { visitorId, requestId } = JSON.parse(req.body);

    if (!ensureValidRequestIdAndVisitorId(req, res, visitorId, requestId)) {
      return;
    }

    // Information from the client side might have been tampered.
    // It's best practice to validate provided information with the Server API.
    // It is recommended to use the requestId and visitorId pair.
    const visitorData = await getVisitorDataWithRequestId(visitorId, requestId);

    for (const ruleCheck of [...paywallChecks, ...optionalChecks]) {
      const result = await ruleCheck(visitorData, req);

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

    return requestCallback(req, res, visitorData);
  };
