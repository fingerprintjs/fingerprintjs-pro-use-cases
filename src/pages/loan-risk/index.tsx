import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormLabel from '@mui/material/FormLabel';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
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
    <Stack direction="column">
      <FormLabel>{label}</FormLabel>
      <Stack direction="row" alignItems="center" spacing={2}>
        {prefix && <Typography>{prefix}</Typography>}
        <Slider
          min={min}
          max={max}
          valueLabelFormat={(value) => `${prefix ? `${prefix} ` : ''} ${value} ${suffix ?? ''}`}
          value={value}
          onChange={(_event, value: number) => onChange(value)}
          valueLabelDisplay="auto"
        />
        <TextField
          name={name}
          type="number"
          value={value}
          onChange={(event) => {
            const number = parseInt(event.target.value);
            return onChange(number);
          }}
          InputProps={{
            startAdornment: prefix && <InputAdornment position="start">{prefix}</InputAdornment>,
            endAdornment: suffix && <InputAdornment position="end">{suffix}</InputAdornment>,
          }}
        />
      </Stack>
    </Stack>
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

  const monthInstallment = useMemo(
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
    <UseCaseWrapper useCase={USE_CASES.loanRisk} embed={embed}>
      <div className={formStyles.wrapper}>
        <form onSubmit={handleSubmit} className={formStyles.useCaseForm}>
          <label>First name</label>
          <input
            type="text"
            name="firstName"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
          <label>Last name</label>
          <input type="text" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
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
          <div>
            Your month installment is: <strong>${monthInstallment.toFixed(2)}</strong>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Hold on, doing magic...' : 'Request loan'}
          </Button>
        </form>
        {loanRequestMutation.data?.message && !loanRequestMutation.isLoading && (
          <Alert severity={loanRequestMutation.data.severity}>{loanRequestMutation.data.message}</Alert>
        )}
      </div>
    </UseCaseWrapper>
  );
}
