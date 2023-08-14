import { NextApiRequest, NextApiResponse } from 'next';
import { ensurePostRequest } from '../server';
import { initProducts } from './database';
import { PersonalizationValidationResult, validatePersonalizationRequest } from './visitor-validations';

// Provides common logic used in personalization use-case
export const personalizationEndpoint =
  (
    requestCallback: (
      req: NextApiRequest,
      res: NextApiResponse,
      validationResult: PersonalizationValidationResult,
    ) => void,
  ) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (!ensurePostRequest(req, res)) {
      return;
    }

    // Ensure that DB models are initialized
    await initProducts();

    res.setHeader('Content-Type', 'application/json');

    const validationResult = await validatePersonalizationRequest(req, res);

    /**
     * FIXME Caused by getForbiddenResponse
     * */
    if (res.headersSent) {
      return;
    }

    return requestCallback(req, res, validationResult);
  };
