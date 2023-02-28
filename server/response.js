// @ts-check
/**
 * @param {import("next").NextApiResponse} res
 * @param {import("./checkResult").CheckResult} result
 * */
export function sendOkResponse(res, result) {
  if (res.headersSent) {
    console.warn('Attempted to send a OK response after headers were sent.', {
      result,
    });

    return;
  }

  return res.status(200).json(result.toJsonResponse());
}

/**
 * @param {import("next").NextApiResponse} res
 * @param {import("./checkResult").CheckResult} result
 * */
export function sendForbiddenResponse(res, result) {
  if (res.headersSent) {
    console.warn('Attempted to send a forbidden response after headers were sent.', {
      result,
    });

    return;
  }

  return res.status(403).json(result.toJsonResponse());
}

/**
 * @param {import("next").NextApiResponse} res
 * @param {import("./checkResult").CheckResult} result
 * */
export function sendErrorResponse(res, result) {
  if (res.headersSent) {
    console.warn('Attempted to send an error response after headers were sent.', {
      result,
    });

    return;
  }

  return res.status(500).json(result.toJsonResponse());
}
