import { UseCaseWrapper } from '../../components/use-case-wrapper';
import { useCallback, useMemo, useState } from 'react';
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
} from '../../shared/loan-risk/validation';
import { calculateMonthInstallment } from '../../shared/loan-risk/calculations';
import Button from '@mui/material/Button';
import { useVisitorData } from '../../shared/client/use-visitor-data';
import { useRequestLoan } from '../../shared/client/api/use-request-loan';
import Alert from '@mui/material/Alert';

function SliderField({ label, min, max, value, onChange, prefix, suffix }) {
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
          onChange={(event, value) => onChange(value)}
          valueLabelDisplay="auto"
        />
        <TextField
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
}

export default function LoanRisk() {
  const visitorDataQuery = useVisitorData({
    // Don't invoke query on mount
    enabled: false,
  });
  const loanRequestMutation = useRequestLoan();

  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [loanValue, setLoanValue] = useState(loanValueValidation.min);
  const [monthlyIncome, setMonthlyIncome] = useState(monthlyIncomeValidation.min);
  const [loanDuration, setLoanDuration] = useState(loanDurationValidation.min);

  const monthInstallment = useMemo(
    () =>
      calculateMonthInstallment({
        loanValue,
        loanDuration,
      }),
    [loanDuration, loanValue]
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
    [firstName, lastName, loanDuration, loanRequestMutation, loanValue, monthlyIncome, visitorDataQuery]
  );

  const isLoading = visitorDataQuery.isLoading || loanRequestMutation.isLoading;

  return (
    <UseCaseWrapper title="Loan Risk problem" description="Lorem ipsum ...">
      <form onSubmit={handleSubmit}>
        <Stack direction="column" spacing={6}>
          <TextField
            label="First name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
          <TextField
            label="Last name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
          />
          <SliderField
            prefix="$"
            min={loanValueValidation.min}
            max={loanValueValidation.max}
            label="How much money do you need?"
            value={loanValue}
            onChange={setLoanValue}
          />
          <SliderField
            prefix="$"
            min={monthlyIncomeValidation.min}
            max={monthlyIncomeValidation.max}
            label="How much do you make per month?"
            value={monthlyIncome}
            onChange={setMonthlyIncome}
          />
          <SliderField
            suffix="Months"
            min={loanDurationValidation.min}
            max={loanDurationValidation.max}
            label="How long do you need the loan?"
            value={loanDuration}
            onChange={setLoanDuration}
          />
          <Typography>
            Your month installment is: <strong>${monthInstallment.toFixed(2)}</strong>
          </Typography>
          <Button type="submit" variant="contained" size="large" disabled={isLoading}>
            {isLoading ? 'Hold on, doing magic...' : 'Request loan'}
          </Button>
        </Stack>
      </form>
      {loanRequestMutation.data?.message && !loanRequestMutation.isLoading && (
        <Alert severity={loanRequestMutation.data.severity} className="UsecaseWrapper_alert">
          {loanRequestMutation.data.message}
        </Alert>
      )}
    </UseCaseWrapper>
  );
}
