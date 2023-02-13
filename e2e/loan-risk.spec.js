// @ts-check
import { expect, test } from '@playwright/test';
import { reset } from './admin';

async function waitForSuccessfulSubmit(page) {
  await page.click('[type="submit"]');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('text="Congratulations, your loan has been approved!"');
}

async function waitForBlockedLoanSubmit(page) {
  await page.click('[type="submit"]');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector(
    'text="We are unable to approve your loan automatically since you had requested a loan with a different income or personal details before. We need to verify provided information manually this time. Please, reach out to our agent."'
  );
}

test.describe('Loan risk', () => {
  const blockLoanCases = [
    {
      name: 'first name',
      fillForm: async (page) => {
        await page.fill('[name="firstName"]', 'Greg');
      },
    },
    {
      name: 'last name',
      fillForm: async (page) => {
        await page.fill('[name="lastName"]', 'Wick');
      },
    },
    {
      name: 'income',
      fillForm: async (page) => {
        await page.fill('[name="monthlyIncome"]', '30000');
      },
    },
  ];

  test.beforeEach(async ({ page, context }) => {
    await reset(context);

    await page.goto('/loan-risk');
  });

  test('should correctly calculate loan and approve it on first submit', async ({ page }) => {
    await page.fill('[name="loanValue"]', '2000');
    await page.fill('[name="monthlyIncome"]', '20000');
    await page.fill('[name="loanDuration"]', '4');

    const monthInstallmentValue = page.locator('#month_installment_value');

    await expect(monthInstallmentValue).toHaveText('$575.00');

    await waitForSuccessfulSubmit(page);
  });

  test('should approve loan if only loan value or loan duration changes', async ({ page }) => {
    await page.fill('[name="loanValue"]', '2000');
    await waitForSuccessfulSubmit(page);

    await page.fill('[name="loanValue"]', '3000');
    await waitForSuccessfulSubmit(page);

    await page.fill('[name="loanValue"]', '4000');
    await page.fill('[name="loanDuration"]', '4');
    await waitForSuccessfulSubmit(page);
  });

  blockLoanCases.forEach((testCase) => {
    test(`should not approve loan if ${testCase.name} changes after first submit`, async ({ page }) => {
      await waitForSuccessfulSubmit(page);

      await testCase.fillForm(page);

      await waitForBlockedLoanSubmit(page);
    });
  });
});
