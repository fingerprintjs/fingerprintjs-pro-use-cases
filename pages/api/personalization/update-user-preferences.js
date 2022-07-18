import { Op } from 'sequelize';
import { UserPreferences } from './database';
import { personalizationEndpoint } from './personalization-endpoint';

export default personalizationEndpoint(async (req, res, { usePersonalizedData, visitorId }) => {
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
});
