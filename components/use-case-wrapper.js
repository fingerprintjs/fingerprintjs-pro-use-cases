import Paper from '@mui/material/Paper';
import clsx from 'clsx';
import Divider from '@mui/material/Divider';

export function UseCaseWrapper({ title, description, listItems, children, variant }) {
  return (
    <Paper variant="outlined" className="ExternalLayout_wrapper" square>
      <div className="ExternalLayout_main">
        <div className={clsx('UsecaseWrapper_wrapper', { full: variant === 'full' })}>
          <div className="UsecaseWrapper_description">
            <h1 className="UsecaseWrapper_title">{title}</h1>
            <p className="UsecaseWrapper_helper">{description}</p>
            <Divider className="UsecaseWrapper_divider" />
            <ul className="UsecaseWrapper_notes">
              {listItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
              <li>
                Need src?{' '}
                <a href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases" target="_blank" rel="noreferrer">
                  Sure!
                </a>
              </li>
            </ul>
          </div>
          <Paper
            variant="elevation"
            sx={{
              padding: (theme) => theme.spacing(4),
            }}
          >
            {children}
          </Paper>
        </div>
      </div>
    </Paper>
  );
}
