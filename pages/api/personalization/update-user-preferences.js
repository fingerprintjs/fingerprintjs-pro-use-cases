import { ensurePostRequest } from '../../../shared/server';
import { Op } from 'sequelize';
import { initProducts, UserPreferences } from './database';
import { validatePersonalizationRequest } from './visitor-validations';

export default async function updateUserPreferences(req, res) {
  if (!ensurePostRequest(req, res)) {
    return;
  }

  await initProducts();

  res.setHeader('Content-Type', 'application/json');

  const { usePersonalizedData, visitorId } = await validatePersonalizationRequest(req, res);

  if (!usePersonalizedData) {
    return res.status(400).json({
      data: null,
    });
  }

  const { hasDarkMode } = JSON.parse(req.body);
  const hasDarkModeBool = Boolean(hasDarkMode);

  const [userPreferences, created] = await UserPreferences.findOrCreate({
    where: {
      visitorId: {
        [Op.eq]: visitorId,
      },
    },
    defaults: {
      visitorId,
      hasDarkMode: hasDarkModeBool,
    },
  });

  if (!created) {
    userPreferences.hasDarkMode = hasDarkModeBool;
    await userPreferences.save();
  }

  return res.status(200).json({
    data: userPreferences,
  });
}
