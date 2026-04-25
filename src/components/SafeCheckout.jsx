import React from "react";
import { FaCcAmex, FaCcDiscover, FaCcMastercard, FaCcVisa } from "react-icons/fa";

const paymentMethods = [
  { label: "Visa", Icon: FaCcVisa },
  { label: "Mastercard", Icon: FaCcMastercard },
  { label: "American Express", Icon: FaCcAmex },
  { label: "Discover", Icon: FaCcDiscover },
];

const SafeCheckout = () => (
  <div className="safe-checkout">
    <p className="checkout-title">Guaranteed Safe Checkout</p>
    <div className="payment-icons" aria-label="Accepted payment methods">
      {paymentMethods.map(({ label, Icon }) => (
        <Icon key={label} aria-label={label} title={label} />
      ))}
    </div>
  </div>
);

export default SafeCheckout;
