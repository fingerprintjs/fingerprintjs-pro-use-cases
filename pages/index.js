import Link from 'next/link';

export default function Index() {
  return (
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
  );
}
