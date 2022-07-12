// TODO Use in other use cases as well
export function UseCaseWrapper({ title, description, listItems, children }) {
  return (
    <div className="ExternalLayout_wrapper">
      <div className="ExternalLayout_main">
        <div className="UsecaseWrapper_wrapper">
          <h1 className="UsecaseWrapper_title">{title}</h1>
          <p className="UsecaseWrapper_helper">{description}</p>
          <hr className="UsecaseWrapper_divider" />
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
          {children}
        </div>
      </div>
    </div>
  );
}
