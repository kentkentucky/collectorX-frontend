import { useState } from "react";
import axios from "axios";
import { Stripe } from "@capacitor-community/stripe";
import { IonButton } from "@ionic/react";

import "./StripePaymentButton.css";

type StripePaymentButtonProps = {
  amount: number;
  authToken: string;
};

function StripePaymentButton({ amount, authToken }: StripePaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/payment/create",
        { amount, currency: "sgd" },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response) {
        await Stripe.createPaymentSheet({
          paymentIntentClientSecret: response.data.clientSecret,
          merchantDisplayName: "CollectorX",
        });

        const { paymentResult } = await Stripe.presentPaymentSheet();
        console.log(paymentResult);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonButton
      onClick={handleCheckout}
      disabled={loading}
      className="payment-button"
    >
      {loading ? "Loading..." : "Buy"}
    </IonButton>
  );
}

export default StripePaymentButton;
