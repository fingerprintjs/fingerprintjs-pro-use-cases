import { ensurePostRequest, ensureValidRequestIdAndVisitorId } from '../../../shared/server';
import { initProducts, UserPreferences } from './database';
import { Op } from 'sequelize';

export default async function handler(req, res) {
  if (!ensurePostRequest(req, res)) {
    return;
  }

  await initProducts();

  res.setHeader('Content-Type', 'application/json');

  const { requestId, visitorId } = JSON.parse(req.body);

  if (!ensureValidRequestIdAndVisitorId(req, res, visitorId, requestId)) {
    return;
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
