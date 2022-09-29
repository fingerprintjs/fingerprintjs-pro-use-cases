import {useVisitorData} from "../../client/use-visitor-data";
import {UseCaseWrapper} from "../../client/components/use-case-wrapper";
import {useState, useEffect, useRef} from "react";
import FormControl from "@mui/material/FormControl";
import clsx from "clsx";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import makeStyles from "@mui/styles/makeStyles";
import styles from './coupon-fraud.module.css';

const useStyles = makeStyles((theme) => ({
    withoutLabel: {
        marginTop: theme.spacing(3),
    },
}));

export default function CouponFraudUseCase() {
    const visitorDataQuery = useVisitorData({
        // Don't fetch visitorData on mount
        enabled: false,
    });

    const [couponCode, setCouponCode] = useState();
    const [price, setPrice] = useState(1119);

    const [authMessage, setAuthMessage] = useState();
    const [severity, setSeverity] = useState();
    const [isWaitingForReponse, setIsWaitingForReponse] = useState(false);
    const [httpResponseStatus, setHttpResponseStatus] = useState();

    const messageRef = useRef();

    useEffect(() => {
        !isWaitingForReponse && messageRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [isWaitingForReponse]);

    async function handleSubmit(e) {
        e.preventDefault();
        setIsWaitingForReponse(true);

        const fpQuery = await visitorDataQuery.refetch();
        console.log({status: fpQuery.status, error: fpQuery.error, fpQuery});
        const {requestId, visitorId} = fpQuery.data;

        const claimData = {
            couponCode,
            visitorId,
            requestId,
        };

        // Serverside handler for this route is located in api/credential-stuffing/authneticate.js file.
        const response = await fetch('/api/coupon-fraud/claim', {
            method: 'POST',
            body: JSON.stringify(claimData),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        const responseJson = await response.json();
        const responseStatus = response.status;
        if (responseStatus === 200) {
            setPrice(1000);
        }
        setAuthMessage(responseJson.message);
        setSeverity(responseJson.severity);
        setHttpResponseStatus(responseStatus);
        setIsWaitingForReponse(false);
    }

    return (
        <UseCaseWrapper
            sx={{width: '100%'}}
            title="Coupon fraud problem"
            description={
                <>
                    This page demonstrates how to solve coupon fraud problem.
                </>
            }
            listItems={[
                <>You can apply coupon to this item only once</>,
                <>You can&apos;t apply same coupon more than once</>,
                <>You can&apos;t spam coupon codes, there is a 1 hour threshold</>,
                <>You can&apos;t apply the same coupon in incognito mode</>,
                <>Sample coupon codes are <code>123456</code> and <code>098765</code></>
            ]}>

            <form onSubmit={handleSubmit}>
                <div className={styles.checkoutContainer}>
                    <div className={styles.productContainer}>
                        <div className={styles.productItem}>
                            <div className={styles.productInfo}>
                                <div className={styles.productTitle}>iPhone 14 Pro Max 256 GB - Deep Purple</div>
                                <div className={styles.productImage}>
                                    <img
                                        src="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deeppurple?wid=5120&hei=2880&fmt=jpeg&qlt=90&.v=1663703841896"
                                        alt="iPhone image"/>
                                </div>
                            </div>
                            <div className={styles.priceInfo}>
                                {new Intl.NumberFormat("en-US", { currency: 'USD', style: 'currency' }).format(price)}
                            </div>
                        </div>
                    </div>
                    <div className={styles.couponContainer}>
                        <div className={styles.couponInfo}>
                            Do you have a coupon? Apply to get discount!
                        </div>
                        <div className={styles.couponForm}>
                            <FormControl fullWidth variant="outlined">
                                <TextField
                                    placeholder="123456"
                                    variant="outlined"
                                    defaultValue={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    required
                                />
                            </FormControl>
                            <Button
                                className="Form_button"
                                disabled={isWaitingForReponse}
                                size="large"
                                type="submit"
                                variant="contained"
                                color="primary"
                                disableElevation
                                fullWidth
                            >
                                {isWaitingForReponse ? 'Applying...' : 'Apply'}
                            </Button>
                        </div>
                        <div className={styles.couponMessage}>
                            {httpResponseStatus ? (
                                <Alert ref={messageRef} severity={severity} className="UsecaseWrapper_alert">
                                    {authMessage}
                                </Alert>
                            ) : null}
                        </div>
                    </div>
                </div>
            </form>

        </UseCaseWrapper>
    )
}