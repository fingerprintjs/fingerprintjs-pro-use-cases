import { Op } from 'sequelize';
import { UserPreferencesDbModel } from '../../../server/personalization/database';
import { personalizationEndpoint } from '../../../server/personalization/personalization-endpoint';

// Updates user preferences (for now only dark mode preference) for given visitorId
export default personalizationEndpoint(async (req, res, { usePersonalizedData, visitorId }) => {
  if (!usePersonalizedData) {
    return res.status(400).json({
      data: null,
    });
  }

  if (!visitorId) {
    return res.status(400).json({
      error: 'Visitor ID not available',
    });
  }

  const { hasDarkMode } = JSON.parse(req.body);
  const hasDarkModeBool = Boolean(hasDarkMode);

  const [userPreferences, created] = await UserPreferencesDbModel.findOrCreate({
    where: {
      visitorId: {
        [Op.eq]: visitorId,
      },
    },
    defaults: {
      visitorId,
      hasDarkMode: hasDarkModeBool,
      timestamp: new Date(),
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
