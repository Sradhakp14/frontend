import React, { useState } from "react";


export const GpayPopup = ({ amount, onClose, onSuccess }) => {
  const [step, setStep] = useState("pin");
  const [pin, setPin] = useState("");

  const handlePay = () => {
    if (pin.length !== 4) {
      alert("Enter 4-digit PIN");
      return;
    }

    setStep("processing");

    setTimeout(() => {
      setStep("success");

      setTimeout(() => {
        onSuccess();
      }, 1000);
    }, 1200);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        {step === "pin" && (
          <>
            <h3>GPay Payment</h3>
            <p>Enter UPI PIN to pay ₹{amount}</p>

            <input
              type="password"
              maxLength="4"
              value={pin}
              placeholder="****"
              onChange={(e) => setPin(e.target.value)}
              style={styles.input}
            />

            <button style={styles.payBtn} onClick={handlePay}>
              Pay ₹{amount}
            </button>
            <button style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
          </>
        )}

        {step === "processing" && (
          <div style={{ textAlign: "center" }}>
            <div style={styles.loader}></div>
            <p>Processing...</p>
          </div>
        )}

        {step === "success" && (
          <div style={{ textAlign: "center" }}>
            <h3 style={{ color: "green" }}>✓ Payment Successful</h3>
            <p>₹{amount} Paid</p>
          </div>
        )}
      </div>
    </div>
  );
};


export const CardPopup = ({ amount, onClose, onSuccess }) => {
  const [step, setStep] = useState("form");

  const payNow = () => {
    setStep("processing");

    setTimeout(() => {
      setStep("success");

      setTimeout(onSuccess, 1000);
    }, 1200);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        {step === "form" && (
          <>
            <h3>Card Payment</h3>

            <input placeholder="Card Number" style={styles.input} />
            <input placeholder="Expiry Date" style={styles.input} />
            <input placeholder="CVV" style={styles.input} />

            <button style={styles.payBtn} onClick={payNow}>
              Pay ₹{amount}
            </button>
            <button style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
          </>
        )}

        {step === "processing" && (
          <div style={{ textAlign: "center" }}>
            <div style={styles.loader}></div>
            <p>Processing...</p>
          </div>
        )}

        {step === "success" && (
          <div style={{ textAlign: "center" }}>
            <h3 style={{ color: "green" }}>✓ Payment Successful</h3>
            <p>₹{amount} Paid</p>
          </div>
        )}
      </div>
    </div>
  );
};


export const CodPopup = ({ onClose, onSuccess }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <h3>Cash on Delivery</h3>
        <p>Confirm your order?</p>

        <button style={styles.payBtn} onClick={onSuccess}>
          Confirm Order
        </button>

        <button style={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};


const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  box: {
    width: "300px",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    animation: "fadeIn 0.2s ease",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
  },
  payBtn: {
    marginTop: "15px",
    width: "100%",
    padding: "12px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
  cancelBtn: {
    marginTop: "10px",
    background: "transparent",
    color: "#444",
    border: "none",
    cursor: "pointer",
  },
  loader: {
    width: "35px",
    height: "35px",
    border: "4px solid #ccc",
    borderTop: "4px solid #1976d2",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "auto",
  },
};
