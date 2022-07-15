import { ensurePostRequest } from '../../../shared/server';
import { initProducts, UserPreferences } from './database';
import { Op } from 'sequelize';
import { validatePersonalizationRequest } from './visitor-validations';

export default async function handler(req, res) {
  if (!ensurePostRequest(req, res)) {
    return;
  }

  await initProducts();

  res.setHeader('Content-Type', 'application/json');

  const { visitorId, usePersonalizedData } = await validatePersonalizationRequest(req, res);

  if (!usePersonalizedData) {
    return res.status(404).json({
      data: null,
    });
  }

  const result = await UserPreferences.findOne({
    where: {
      visitorId: {
        [Op.eq]: visitorId,
      },
    },
  });

  if (!result) {
    return res.status(404).json({
      data: null,
    });
  }

  return res.status(200).json({
    data: result,
  });
}
