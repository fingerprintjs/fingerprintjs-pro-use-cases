import { loanRiskEndpoint } from '../../../server/loan-risk/loan-risk-endpoint';
import { LoanRequest } from '../../../server/loan-risk/database';
import { Op } from 'sequelize';
import { CheckResult, checkResultType, messageSeverity } from '../../../server/server';
import { calculateLoanValues } from '../../../server/loan-risk/calculate-loan-values';

/**
 * Validates previous loan requests sent by a given user.
 *
 * As an example, we check loan requests received on the same day and we compare the monthly income provided by a user.
 * If monthly income is not the same as in the previous request, we return a warning.
 *
 * */
async function checkPreviousLoanRequests(visitorData, req) {
  const { monthlyIncome, firstName, lastName } = JSON.parse(req.body);

  const timestampStart = new Date();
  const timestampEnd = new Date();

  timestampStart.setHours(0, 0, 0, 0);
  timestampEnd.setHours(23, 59, 59, 59);

  // Find previous loan requests that were sent by this visitorId today.
  const previousLoanRequests = await LoanRequest.findAll({
    where: {
      visitorId: {
        [Op.eq]: visitorData.visitorId,
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
        loanRequest.lastName === lastName
    );

    // Whoops, it looks like the data is not the same!
    // You could potentially mark this user in your database as fraudulent, or perform some other actions.
    // In our case, we just return a warning.
    if (!hasValidFields) {
      return new CheckResult(
        'We are unable to approve your loan automatically since you had requested a loan with a different income or personal details before. We need to verify provided information manually this time. Please, reach out to our agent.',
        messageSeverity.Warning,
        checkResultType.PossibleLoanFraud
      );
    }
  }
}

export default loanRiskEndpoint(
  async (req, res, visitorData) => {
    const { loanValue, monthlyIncome, loanDuration, firstName, lastName } = JSON.parse(req.body);

    const calculations = calculateLoanValues({
      loanValue,
      monthlyIncome,
      loanDuration,
    });

    await LoanRequest.create({
      visitorId: visitorData.visitorId,
      timestamp: new Date(),
      monthlyIncome,
      loanDuration,
      loanValue,
      firstName,
      lastName,
    });

    let result;

    if (calculations.approved) {
      result = new CheckResult(
        'Congratulations, your loan has been approved!',
        messageSeverity.Success,
        checkResultType.Passed
      );
    } else {
      result = new CheckResult(
        'Sorry, your monthly income is too low for this loan.',
        messageSeverity.Warning,
        checkResultType.Challenged
      );
    }

    return res.status(200).json({
      ...result,
      severity: result.messageSeverity,
      calculations,
    });
  },
  [checkPreviousLoanRequests]
);
