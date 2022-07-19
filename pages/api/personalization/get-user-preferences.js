import { UserPreferences } from '../../../api/personalization/database';
import { Op } from 'sequelize';
import { personalizationEndpoint } from '../../../api/personalization/personalization-endpoint';

// Fetches user preferences (for now only dark mode preference) for given visitorId
export default personalizationEndpoint(async (req, res, { visitorId, usePersonalizedData }) => {
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
});
