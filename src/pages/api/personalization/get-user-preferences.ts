import { UserPreferencesDbModel } from '../../../server/personalization/database';
import { Op } from 'sequelize';
import { personalizationEndpoint } from '../../../server/personalization/personalization-endpoint';
import { NextApiRequest, NextApiResponse } from 'next';

// Fetches user preferences (for now only dark mode preference) for given visitorId
export default personalizationEndpoint(
  async (_req: NextApiRequest, res: NextApiResponse, { visitorId, usePersonalizedData }) => {
    if (!usePersonalizedData) {
      return res.status(200).json({
        data: null,
      });
    }

    if (!visitorId) {
      return res.status(400).json({
        error: 'Visitor ID not available',
      });
    }

    const result = await UserPreferencesDbModel.findOne({
      where: {
        visitorId: {
          [Op.eq]: visitorId,
        },
      },
    });

    if (!result) {
      return res.status(200).json({
        data: null,
      });
    }

    return res.status(200).json({
      data: result,
    });
  },
);
