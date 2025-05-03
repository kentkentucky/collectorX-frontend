import { useState } from "react";
import axios from "axios";
import { Stripe } from "@capacitor-community/stripe";
import { IonButton } from "@ionic/react";
import { useNavigate } from "react-router-dom";

import "./StripePaymentButton.css";

type StripePaymentButtonProps = {
  amount: number;
  authToken: string;
  listingID: string;
  sellerID: string;
  offerID?: string;
};

function StripePaymentButton({
  amount,
  authToken,
  listingID,
  sellerID,
  offerID,
}: StripePaymentButtonProps) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/payment/create",
        { amount, currency: "sgd", listingID, sellerID, offerID },
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
        if (paymentResult === "paymentSheetCompleted") {
          navigate("/profile");
        }
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
      {loading ? "Loading..." : "PAY"}
    </IonButton>
  );
}

export default StripePaymentButton;
