import { getAndValidateFingerprintResult, Severity } from '../../../../../server/checks';
import { NextResponse } from 'next/server';
import { ArticleData, ARTICLES } from '../../articles';
import { ArticleViewDbModel } from '../../database';
import { getTodayDateRange } from '../../../../../shared/utils/date';
import { Op } from 'sequelize';

export type ArticleResponse = {
  message: string;
  severity: Severity;
  article?: ArticleData;
  remainingViews?: number;
  viewedArticles?: number;
};

export type ArticleRequestPayload = {
  requestId: string;
};

/**
 * Fetches article by its ID. Supports paywall logic, which means that we keep track of how many articles were viewed by a given user.
 * If a user has exceeded limit of articles that he can view for free, we return an error.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse<ArticleResponse>> {
  const { requestId } = (await req.json()) as ArticleRequestPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({ requestId, req });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ severity: 'error', message: fingerprintResult.error }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products?.identification?.data?.visitorId;
  if (!visitorId) {
    return NextResponse.json({ severity: 'error', message: 'Visitor ID not found.' }, { status: 403 });
  }

  const articleId = params.id;
  const article = ARTICLES.find((article) => article.id === articleId);
  if (!article) {
    return NextResponse.json({ severity: 'error', message: 'Article not found' }, { status: 404 });
  }

  const viewCount = await countViewedArticles(visitorId);
  const viewedThisArticleBefore = await isRereadingAlreadyViewedArticle(visitorId, articleId);

  if (viewCount >= ARTICLE_VIEW_LIMIT && !viewedThisArticleBefore) {
    return NextResponse.json({ severity: 'error', message: 'Article view limit reached' }, { status: 403 });
  }

  await saveArticleView(articleId, visitorId);
  return NextResponse.json({
    severity: 'success',
    message: 'Article viewed',
    article,
    remainingViews: ARTICLE_VIEW_LIMIT - viewCount,
    viewedArticles: viewCount,
  });
}

export const ARTICLE_VIEW_LIMIT = 2;

/**
 * Saves article view into the database. If it already exists, we update its timestamp.
 * */
export async function saveArticleView(articleId: string, visitorId: string) {
  const [view, created] = await ArticleViewDbModel.findOrCreate({
    where: { articleId, visitorId, timestamp: { [Op.between]: getTodayDateRange() } },
    defaults: { articleId, visitorId, timestamp: new Date() },
  });

  if (!created) {
    view.timestamp = new Date();
    await view.save();
  }

  return view;
}

/**
 * Returns count of all articles that were viewed by given visitorId today.
 * */
export async function countViewedArticles(visitorId: string) {
  return await ArticleViewDbModel.count({
    where: { visitorId, timestamp: { [Op.between]: getTodayDateRange() } },
  });
}

/**
 * Check if the visitor is re-reading an article they already viewed.
 * */
export async function isRereadingAlreadyViewedArticle(visitorId: string, articleId: string) {
  return Boolean(
    ArticleViewDbModel.findOne({
      where: {
        visitorId,
        articleId,
        timestamp: {
          [Op.between]: getTodayDateRange(),
        },
      },
    }),
  );
}
