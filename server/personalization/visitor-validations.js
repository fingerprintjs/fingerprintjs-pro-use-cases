import {
  checkConfidenceScore,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
  checkResultType,
  ensureValidRequestIdAndVisitorId,
  getVisitorData,
} from '../server';

/**
 * Custom logic for validation personalization request.
 *
 * Since for personalization we don't need to throw errors if security check didn't pass, we just return flag that indicates if personalized content should be used or not.
 * */
export async function validatePersonalizationRequest(req, res) {
  const result = {
    usePersonalizedData: false,
    visitorId: null,
  };

  const { requestId, visitorId } = JSON.parse(req.body);

  if (!ensureValidRequestIdAndVisitorId(req, res, visitorId, requestId)) {
    return result;
  }

  const checks = [
    /**
     * We don't need to check if the request is "fresh" for this use case.
     * It's better to fetch visitor data once, and re-use it for every request that uses personalization to reduce the amount of API calls.
     *
     * Note: Our libraries for common frontend frameworks provide out of the box caching.
     * */
    //checkFreshIdentificationRequest,
    checkConfidenceScore,
    checkIpAddressIntegrity,
    checkOriginsIntegrity,
  ];

  const visitorData = await getVisitorData(visitorId, requestId);

  result.visitorId = visitorData.visitorId;

  for (const check of checks) {
    const checkResult = await check(visitorData, req);

    if (checkResult) {
      switch (checkResult.type) {
        case checkResultType.Passed:
        case checkResultType.Challenged:
          continue;

        default:
          return result;
      }
    }
  }

  result.usePersonalizedData = true;

  return result;
}
