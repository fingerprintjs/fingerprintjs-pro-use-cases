import { useEffect, useRef, useState } from "react";
import { getFingerprintJS } from "../../shared/client";
import Paper from "@material-ui/core/Paper";

export default function Index() {
  const messageRef = useRef();
  const [isWaitingForReponse, setIsWaitingForReponse] = useState(false);
  const [fp, setFp] = useState(null);

  useEffect(() => {
    async function getFingerprint() {
      await getFingerprintJS(setFp);
    }
    !fp && getFingerprint();
    !isWaitingForReponse && messageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isWaitingForReponse, fp]);

  return (
    <>
      <div className="ExternalLayout_wrapper">
        <div className="ExternalLayout_main">
          <div className="UsecaseWrapper_wrapper">
            <h1 className="UsecaseWrapper_title">Credential Stuffing problem</h1>
            <p className="UsecaseWrapper_helper">
              This page demonstrates login form protected against{' '}
              <a href="https://fingerprintjs.com/blog/credential-stuffing-prevention-checklist/">Credential Stuffing</a>{' '}
              attack. Martin reused the same password among different sites and his credentials leaked. Luckily for
              Martin, this service uses FingeprintJS Pro and Martin&apos;s account is still protected even though his
              credentials are known. Try to hack into Martin&apos;s account using his credentials <code>user</code> and{' '}
              <code>password</code>. It will be very hard...
            </p>
            <hr className="UsecaseWrapper_divider" />
            <ul className="UsecaseWrapper_notes">
              <li>
                Even with correct credentials, you cannot log in if the system does not recognize your{' '}
                <code>visitorId</code>. The legit account owner can :)
              </li>
              <li>If you provide the wrong credentials 5 times, you&apos;d be locked out!</li>
              <li>
                U h4ck3r? You can try to generate new <code>visitorId</code> and <code>reqeustId</code> and try to log
                in. Good luck :)
              </li>
              <li>
                Need src?{' '}
                <a href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases" target="_blank" rel="noreferrer">
                  Sure!
                </a>
              </li>
            </ul>
            <Paper className="ActionWrapper_container">

            </Paper>
          </div>
        </div>
      </div>
    </>
  );

}
