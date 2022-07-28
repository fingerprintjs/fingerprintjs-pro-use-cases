import { loanRiskEndpoint } from '../../../api/loan-risk/loan-risk-endpoint';
import { LoanRequest } from '../../../api/loan-risk/database';
import { Op } from 'sequelize';
import { CheckResult, checkResultType, messageSeverity } from '../../../shared/server';
import { calculateLoanValues } from '../../../shared/loan-risk/calculations';

/**
 * Validates previous loan requests sent by given user.
 *
 * In our case, we check loan requests that were sent on the same day and compare month income provided by user.
 * If month income is not the same as in previous request, we return error.
 *
 * Returning error here act as a example, you could potentially use this data to eg: avoid doing expensive credit checks for this user.
 * */
async function checkPreviousLoanRequests(visitorData, req) {
  const { monthlyIncome } = JSON.parse(req.body);

  const timestampStart = new Date();
  const timestampEnd = new Date();

  timestampStart.setHours(0, 0, 0, 0);
  timestampEnd.setHours(23, 59, 59, 59);

  // Find previous loan requests that were sent by this user today
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
    // Check if month income is the same as in every previous loan request
    const isValidIncome = previousLoanRequests.every((loanRequest) => loanRequest.monthlyIncome === monthlyIncome);

    // Whoops, looks like the income is not the same!
    // You could potentially mark this user in your database as fraud, or perform some other actions.
    // In our case, we just return an error.
    if (!isValidIncome) {
      return new CheckResult(
        'Provided month income is not the same than previously provided one.',
        messageSeverity.Error,
        checkResultType.InvalidmonthlyIncome
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
        'Sorry, your month income is too low for this loan.',
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
