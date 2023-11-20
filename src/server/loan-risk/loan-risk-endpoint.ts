import {
  ensurePostRequest,
  ensureValidRequestIdAndVisitorId,
  getVisitorDataWithRequestId,
  reportSuspiciousActivity,
} from '../server';
import { checkResultType } from '../checkResult';
import {
  checkConfidenceScore,
  checkFreshIdentificationRequest,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
} from '../checks';
import { sendForbiddenResponse } from '../response';

// Server API validations.
const loanChecks = [
  checkFreshIdentificationRequest,
  checkConfidenceScore,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
];

export const loanRiskEndpoint =
  (requestCallback, optionalChecks = []) =>
  async (req, res) => {
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
    const visitorData = await getVisitorDataWithRequestId(visitorId, requestId);

    for (const ruleCheck of [...loanChecks, ...optionalChecks]) {
      const result = await ruleCheck(visitorData, req);

      if (result) {
        switch (result.type) {
          case checkResultType.Passed:
          case checkResultType.Challenged:
            continue;
          default:
            reportSuspiciousActivity(req);
            return sendForbiddenResponse(res, result);
        }
      }
    }

    return requestCallback(req, res, visitorData);
  };
