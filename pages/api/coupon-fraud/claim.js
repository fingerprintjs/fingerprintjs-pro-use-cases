import {ensurePostRequest, getForbiddenReponse, getOkReponse, getVisitorData, sequelize,} from "../../../server/server";
import {Op, Sequelize} from "sequelize";

// Defines db model for coupons.
export const CouponCode = sequelize.define('coupon', {
    code: {
        type: Sequelize.STRING,
    },
});

export const CouponClaim = sequelize.define('coupon-claim', {
    visitorId: {
        type: Sequelize.STRING,
    }, couponCode: {
        type: Sequelize.STRING,
    }, timestamp: {
        type: Sequelize.DATE,
    },
})

export default async function handler(req, res) {
    if (!ensurePostRequest(req, res)) {
        return;
    }

    await CouponCode.sync({force: false});
    await CouponClaim.sync({force: false});

    await CouponCode.findOrCreate({where: {code: {[Op.eq]: '123456'}}, defaults: {code: '123456'}});
    await CouponCode.findOrCreate({where: {code: {[Op.eq]: '098765'}}, defaults: {code: '098765'}});

    const visitorId = req.body.visitorId;
    const requestId = req.body.requestId;

    const isRequestIdFormatValid = /^\d{13}\.[a-zA-Z0-9]{6}$/.test(requestId);
    const isVisitorIdFormatValid = /^[a-zA-Z0-9]{20}$/.test(visitorId);

    // Check if this is a valid request from a valid visitor
    if (!isRequestIdFormatValid || !isVisitorIdFormatValid) {
        return getForbiddenReponse(res, 'Invalid requestId or visitorId', 'error');
    }

    res.setHeader('Content-Type', 'application/json');

    const visitorData = await getVisitorData(visitorId, requestId);

    if (visitorData.error || visitorData.visits.length !== 1) {
        return getForbiddenReponse(res, 'Already requested coupon, or no visitor found with visitorId', 'error');
    }


    if (new Date().getTime() - visitorData.visits[0].timestamp > 3000) {
        return getForbiddenReponse(res, 'Already visited before', 'error');
    }

    // Check if the visitor is trustworthy
    if (visitorData.visits[0].confidence.score < 0.95) {
        return getForbiddenReponse(res, 'Visitor is not trustworthy', 'error');
    }

    // This is an example of obtaining the client IP address.
    // In most cases, it's a good idea to look for the right-most external IP address in the list to prevent spoofing.
    if (req.headers['x-forwarded-for'].split(',')[0] !== visitorData.visits[0].ip) {
        return getForbiddenReponse(res, 'Invalid IP Address', 'error');
    }

    const ourOrigins = ['https://example.com',];

    // Check if the visitor, made this request on a trusted origin
    const visitorDataOrigin = new URL(visitorData.visits[0].url).origin;
    if ((visitorDataOrigin !== req.headers['origin'] || !ourOrigins.includes(visitorDataOrigin) || !ourOrigins.includes(req.headers['origin']))) {
        // Remove the comment below to apply origin check
        // return getForbiddenReponse(res, 'Invalid origin', 'error');
    }

    const couponCode = req.body.couponCode;
    const coupon = await checkCoupon(couponCode);

    // Check if the coupon exists
    if (!coupon) {
        return getForbiddenReponse(res, 'Coupon code not exists', 'error');
    }

    const claimed = await getVisitorClaim(visitorId, couponCode);

    // Check if the visitor claimed this coupon before
    if (claimed) {
        return getForbiddenReponse(res, 'Visitor used this coupon before', 'error');
    }

    const recentClaim = await checkVisitorClaimedRecently(visitorId);

    // Check if the visitor claimed a coupon recently
    if (recentClaim) {
        return getForbiddenReponse(res, 'Visitor claimed another coupon recently', 'error');
    }

    await saveCouponCode(visitorId, couponCode);

    return getOkReponse(res, `Coupon claimed, you get 119 USD discount!`, 'success');
}

async function checkVisitorClaimedRecently(visitorId) {
    const oneHourBefore = new Date();
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);

    return await CouponClaim.findOne({
        where: {
            visitorId, timestamp: {
                [Op.between]: [oneHourBefore, new Date()],
            }
        }
    })
}

async function getVisitorClaim(visitorId, couponCode) {
    return await CouponClaim.findOne({
        where: {visitorId, couponCode}
    });
}

/**
 * Checks if given visitor has already used a coupon code.
 */
export async function checkCoupon(code) {
    return await CouponCode.findOne({
        where: {
            code: {
                [Op.eq]: code,
            },
        },
    })
}

/**
 * Saves coupon code into database. If it already exists, we update its timestamp.
 */
export async function saveCouponCode(visitorId, couponCode) {
    const claim = await CouponClaim.create({
        couponCode, visitorId, timestamp: new Date(),
    });
    await claim.save();

    return claim;
}