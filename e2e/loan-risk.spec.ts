import { Page, expect, test } from '@playwright/test';
import { resetScenarios } from './resetHelper';
import { TEST_IDS } from '../src/client/testIDs';
import { LOAN_RISK_COPY } from '../src/pages/api/loan-risk/request-loan';

const testIds = TEST_IDS.loanRisk;

async function waitForSuccessfulSubmit(page: Page) {
  await page.getByTestId(testIds.submitApplication).click();
  await page.getByText(LOAN_RISK_COPY.approved).waitFor();
}

async function waitForBlockedLoanSubmit(page: Page) {
  await page.getByTestId(testIds.submitApplication).click();
  await page.getByText(LOAN_RISK_COPY.inconsistentApplicationChallenged).waitFor();
}

test.describe('Loan risk', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/loan-risk');
    await resetScenarios(page);
  });

  test('should correctly calculate loan and approve it on first submit', async ({ page }) => {
    await page.getByTestId(TEST_IDS.loanRisk.loanValue).fill('2000');
    await page.getByTestId(TEST_IDS.loanRisk.monthlyIncome).fill('20000');
    await page.getByTestId(TEST_IDS.loanRisk.loanTerm).fill('4');
    const monthInstallmentValue = page.getByTestId(testIds.monthlyInstallmentValue);

    await expect(monthInstallmentValue).toHaveText('$ 575');
    await waitForSuccessfulSubmit(page);
  });

  test('should approve loan if only loan value or loan duration changes', async ({ page }) => {
    await page.getByTestId(TEST_IDS.loanRisk.loanValue).fill('2000');
    await waitForSuccessfulSubmit(page);

    await page.getByTestId(TEST_IDS.loanRisk.loanValue).fill('3000');
    await waitForSuccessfulSubmit(page);

    await page.getByTestId(TEST_IDS.loanRisk.loanValue).fill('4000');
    await page.getByTestId(TEST_IDS.loanRisk.loanTerm).fill('4');
    await waitForSuccessfulSubmit(page);
  });

  const blockLoanCases = [
    {
      field: TEST_IDS.loanRisk.name,
      value: 'Greg',
    },
    {
      field: TEST_IDS.loanRisk.surname,
      value: 'Wick',
    },
    {
      field: TEST_IDS.loanRisk.monthlyIncome,
      value: '30000',
    },
  ] as const;

  blockLoanCases.forEach((testCase) => {
    test(`should not approve loan if ${testCase.field} changes after first submit`, async ({ page }) => {
      await waitForSuccessfulSubmit(page);
      await page.getByTestId(testCase.field).fill(testCase.value);
      await waitForBlockedLoanSubmit(page);
    });
  });
});
