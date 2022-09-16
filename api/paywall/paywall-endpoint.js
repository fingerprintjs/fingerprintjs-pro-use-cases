import {
  checkConfidenceScore,
  checkFreshIdentificationRequest,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
  checkResultType,
  ensurePostRequest,
  ensureValidRequestIdAndVisitorId,
  getForbiddenReponse,
  getVisitorData,
  reportSuspiciousActivity,
} from '../../shared/server';
import { initPaywall } from './database';
import { checkCountOfViewedArticles } from './article-views';

// Base checks for every endpoint related to loan risk
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
    const visitorData = await getVisitorData(visitorId, requestId);

    for (const ruleCheck of [...paywallChecks, ...optionalChecks]) {
      const result = await ruleCheck(visitorData, req);

      if (result) {
        switch (result.type) {
          case checkResultType.Passed:
          case checkResultType.Challenged:
            continue;
          case checkResultType.ArticleViewLimitExceeded:
            // No need to report suspicious activity for this error
            return getForbiddenReponse(res, result.message, result.messageSeverity);
          default:
            reportSuspiciousActivity(req);
            return getForbiddenReponse(res, result.message, result.messageSeverity);
        }
      }
    }

    return requestCallback(req, res, visitorData);
  };
