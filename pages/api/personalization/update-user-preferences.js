import { ensurePostRequest, ensureValidRequestIdAndVisitorId } from '../../../shared/server';
import { Op } from 'sequelize';
import { initProducts, UserPreferences } from './database';

export default async function updateUserPreferences(req, res) {
  if (!ensurePostRequest(req, res)) {
    return;
  }

  await initProducts();

  res.setHeader('Content-Type', 'application/json');

  const { requestId, visitorId, hasDarkMode } = JSON.parse(req.body);
  const hasDarkModeBool = Boolean(hasDarkMode);

  if (!ensureValidRequestIdAndVisitorId(req, res, visitorId, requestId)) {
    return;
  }

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
