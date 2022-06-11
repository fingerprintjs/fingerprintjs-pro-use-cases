import Link from 'next/link';
import Image from 'next/image';

export default function Index() {
  return (
    <>
      <div className="ExternalLayout_wrapper">
        <div className="ExternalLayout_main">
          <div className="UsecaseWrapper_wrapper">
            <Image src="/logo.svg" alt="me" width="500" height="100%" />
            <p className="UsecaseWrapper_helper">
              This project demonstrates various use cases for FingerprintJS Pro. Each scenario covers frontend and
              backend sample implementation with a persistent data layer. The open-source repository is available at{' '}
              <a href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases">GithHub</a>.
            </p>
            <p className='UsecaseWrapper_helper'>
              On the <a href="/admin">admin</a> page, you can remove all info obtained from this browser. This will reenable some scenarios for
              you if you were locked out from the specific action.
            </p>
            <hr className="UsecaseWrapper_divider" />
            <ul>
              <li>
                <Link href="/credential-stuffing">
                  <a>Credential Stuffing</a>
                </Link>
              </li>
              <li>
                <Link href="/payment-fraud">
                  <a>Payment Fraud</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
