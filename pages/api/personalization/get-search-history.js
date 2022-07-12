import { UserSearchHistory } from './database';
import { ensurePostRequest, ensureValidRequestIdAndVisitorId } from '../../../shared/server';

export default async function handler(req, res) {
  if (!ensurePostRequest(req, res)) {
    return;
  }

  const { requestId, visitorId } = JSON.parse(req.body);

  if (!ensureValidRequestIdAndVisitorId(req, res, visitorId, requestId)) {
    return;
  }

  const history = await UserSearchHistory.findAll({
    order: [['timestamp', 'DESC']],
  });

  return res.status(200).json({
    data: history,
    size: history.length,
  });
}
