import { UseCaseWrapper } from '../../components/use-case-wrapper';
import { useMemo, useState } from 'react';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormLabel from '@mui/material/FormLabel';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { loanDurationValidation, loanValueValidation, monthIncomeValidation } from '../../shared/loan-risk/validation';
import { calculateMonthInstallment } from '../../shared/loan-risk/calculations';
import Button from '@mui/material/Button';

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
  const [loanValue, setLoanValue] = useState(loanValueValidation.min);
  const [monthIncome, setMonthIncome] = useState(monthIncomeValidation.min);
  const [loanDuration, setLoanDuration] = useState(loanDurationValidation.min);

  const monthInstallment = useMemo(
    () =>
      calculateMonthInstallment({
        loanValue,
        loanDuration,
      }),
    [loanDuration, loanValue]
  );

  return (
    <UseCaseWrapper title="Loan Risk problem" description="Lorem ipsum ...">
      <form>
        <Stack direction="column" spacing={6}>
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
            min={monthIncomeValidation.min}
            max={monthIncomeValidation.max}
            label="How much do you make per month?"
            value={monthIncome}
            onChange={setMonthIncome}
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
          <Button variant="contained" size="large">
            Send loan request
          </Button>
        </Stack>
      </form>
    </UseCaseWrapper>
  );
}
