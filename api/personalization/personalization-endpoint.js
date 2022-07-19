import { ensurePostRequest } from '../../shared/server';
import { initProducts } from './database';
import { validatePersonalizationRequest } from './visitor-validations';

// Provides common logic used in personalization use-case
export const personalizationEndpoint = (requestCallback) => async (req, res) => {
  if (!ensurePostRequest(req, res)) {
    return;
  }

  // Ensure that DB models are initialized
  await initProducts();

  res.setHeader('Content-Type', 'application/json');

  const validationResult = await validatePersonalizationRequest(req, res);

  return requestCallback(req, res, validationResult);
};
