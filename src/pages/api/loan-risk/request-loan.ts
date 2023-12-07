import { loanRiskEndpoint } from '../../../server/loan-risk/loan-risk-endpoint';
import { LoanRequestDbModel } from '../../../server/loan-risk/database';
import { Op } from 'sequelize';
import { messageSeverity } from '../../../server/server';
import { calculateLoanValues } from '../../../server/loan-risk/calculate-loan-values';
import { CheckResult, checkResultType } from '../../../server/checkResult';
import { RuleCheck } from '../../../server/checks';

export const LOAN_RISK_COPY = {
  approved: 'Congratulations, your loan has been approved!',
  incomeLow: 'Sorry, your monthly income is too low for this loan.',
  inconsistentApplicationChallenged:
    'We are unable to approve your loan automatically since you had requested a loan with a different income or personal details before. We need to verify provided information manually this time. Please, reach out to our agent.',
} as const;

/**
 * Validates previous loan requests sent by a given user.
 *
 * As an example, we check loan requests received on the same day and we compare the monthly income provided by a user.
 * If monthly income is not the same as in the previous request, we return a warning.
 *
 * */
const checkPreviousLoanRequests: RuleCheck = async (eventResponse, req) => {
  const { monthlyIncome, firstName, lastName } = JSON.parse(req.body);

  const timestampStart = new Date();
  const timestampEnd = new Date();

  timestampStart.setHours(0, 0, 0, 0);
  timestampEnd.setHours(23, 59, 59, 59);

  // Find previous loan requests that were sent by this visitorId today.
  const previousLoanRequests = await LoanRequestDbModel.findAll({
    where: {
      visitorId: {
        [Op.eq]: eventResponse.products?.identification?.data?.visitorId,
      },
      timestamp: {
        [Op.between]: [timestampStart, timestampEnd],
      },
    },
  });

  if (previousLoanRequests.length) {
    // Check if monthly income, first name, and last name are the same as in previous loan requests.
    const hasValidFields = previousLoanRequests.every(
      (loanRequest) =>
        loanRequest.monthlyIncome === monthlyIncome &&
        loanRequest.firstName === firstName &&
        loanRequest.lastName === lastName,
    );

    // Whoops, it looks like the data is not the same!
    // You could potentially mark this user in your database as fraudulent, or perform some other actions.
    // In our case, we just return a warning.
    if (!hasValidFields) {
      return new CheckResult(
        LOAN_RISK_COPY.inconsistentApplicationChallenged,
        messageSeverity.Warning,
        checkResultType.PossibleLoanFraud,
      );
    }
  }
};

export default loanRiskEndpoint(
  async (req, res, eventResponse) => {
    const { loanValue, monthlyIncome, loanDuration, firstName, lastName } = JSON.parse(req.body);

    const calculations = calculateLoanValues({
      loanValue,
      monthlyIncome,
      loanDuration,
    });

    const visitorId = eventResponse?.products?.identification?.data?.visitorId;

    if (!visitorId) {
      return res.status(400).json({
        error: new Error('Missing visitor ID'),
      });
    }

    await LoanRequestDbModel.create({
      visitorId,
      timestamp: new Date(),
      monthlyIncome,
      loanDuration,
      loanValue,
      firstName,
      lastName,
    });

    let result;

    if (calculations.approved) {
      result = new CheckResult(LOAN_RISK_COPY.approved, messageSeverity.Success, checkResultType.Passed);
    } else {
      result = new CheckResult(LOAN_RISK_COPY.incomeLow, messageSeverity.Warning, checkResultType.Challenged);
    }

    return res.status(200).json({
      ...result.toJsonResponse(),
      calculations,
    });
  },
  [checkPreviousLoanRequests],
);
