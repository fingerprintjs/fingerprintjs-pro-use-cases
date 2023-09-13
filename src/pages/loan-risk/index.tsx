import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';

import {
  loanDurationValidation,
  loanValueValidation,
  monthlyIncomeValidation,
} from '../../client/loan-risk/validation';
import { useVisitorData } from '../../client/use-visitor-data';
import { useRequestLoan } from '../../client/api/loan-risk/use-request-loan';
import { calculateMonthInstallment } from '../../shared/loan-risk/calculate-month-installment';
import React from 'react';
import { USE_CASES } from '../../client/components/common/content';
import { CustomPageProps } from '../_app';
import Button from '../../client/components/common/Button';
import Alert from '../../client/components/common/Alert/Alert';
import formStyles from '../../styles/forms.module.scss';
import { Slider } from '../../client/components/common/Slider/Slider';
import { NumberInputWithUnits } from '../../client/components/common/InputNumberWithUnits/InputNumberWithUnits';
import styles from './loanRisk.module.scss';
import classNames from 'classnames';
import { TEST_IDS } from '../../client/e2eTestIDs';

type SliderFieldProps = {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  name?: string;
};

const SliderField: FunctionComponent<SliderFieldProps> = ({
  label,
  min,
  max,
  value,
  onChange,
  prefix,
  suffix,
  name,
}) => {
  return (
    <div>
      <label>{label}</label>
      <div className={styles.sliderFieldWrapper}>
        <div className={styles.sliderWrapper}>
          {prefix && prefix}
          <Slider min={min} max={max} value={value} onChange={(value: number) => onChange(value)} />
        </div>
        <NumberInputWithUnits
          value={value}
          onChange={(value: number) => onChange(value)}
          suffix={suffix}
          prefix={prefix}
          name={name}
        />
      </div>
    </div>
  );
};
export default function LoanRisk({ embed }: CustomPageProps) {
  const visitorDataQuery = useVisitorData({
    // Don't invoke query on mount
    enabled: false,
  });
  const loanRequestMutation = useRequestLoan();

  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [loanValue, setLoanValue] = useState(loanValueValidation.min);
  const [monthlyIncome, setMonthlyIncome] = useState(10000);
  const [loanDuration, setLoanDuration] = useState(loanDurationValidation.min);

  const monthlyInstallment = useMemo(
    () =>
      calculateMonthInstallment({
        loanValue,
        loanDuration,
      }),
    [loanDuration, loanValue],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const fpData = await visitorDataQuery.refetch();

      await loanRequestMutation.mutateAsync({
        fpData: fpData.data,
        body: { loanValue, monthlyIncome, loanDuration, firstName, lastName },
      });
    },
    [firstName, lastName, loanDuration, loanRequestMutation, loanValue, monthlyIncome, visitorDataQuery],
  );

  const isLoading = visitorDataQuery.isLoading || loanRequestMutation.isLoading;

  return (
    <UseCaseWrapper useCase={USE_CASES.loanRisk} embed={embed} contentSx={{ maxWidth: 'none' }}>
      <div className={classNames(formStyles.wrapper, styles.formWrapper)}>
        <form onSubmit={handleSubmit} className={formStyles.useCaseForm}>
          <div className={styles.nameWrapper}>
            <label>Name</label>
            <input
              type="text"
              name="firstName"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
            <label>Surname</label>
            <input
              type="text"
              name="lastName"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </div>
          <div className={styles.loanWrapper}>
            <div className={styles.sliders}>
              <SliderField
                name="loanValue"
                prefix="$"
                min={loanValueValidation.min}
                max={loanValueValidation.max}
                label="How much money do you need?"
                value={loanValue}
                onChange={setLoanValue}
              />
              <SliderField
                name="monthlyIncome"
                prefix="$"
                min={monthlyIncomeValidation.min}
                max={monthlyIncomeValidation.max}
                label="How much do you make per month?"
                value={monthlyIncome}
                onChange={setMonthlyIncome}
              />
              <SliderField
                name="loanDuration"
                suffix="Months"
                min={loanDurationValidation.min}
                max={loanDurationValidation.max}
                label="Loan term (months)"
                value={loanDuration}
                onChange={setLoanDuration}
              />
              <div className={styles.summary}>
                <span>Your monthly installment is: </span>
                <div className={styles.monthlyPayment} data-test={TEST_IDS.loanRisk.monthlyInstallmentValue}>
                  $ {monthlyInstallment.toFixed(0)}
                </div>
              </div>
            </div>
            {loanRequestMutation.data?.message && !loanRequestMutation.isLoading && (
              <Alert severity={loanRequestMutation.data.severity}>{loanRequestMutation.data.message}</Alert>
            )}
            <Button type="submit" disabled={isLoading} className={styles.requestLoadButton}>
              {isLoading ? 'Hold on, doing magic...' : 'Request loan'}
            </Button>
          </div>
        </form>
      </div>
    </UseCaseWrapper>
  );
}
