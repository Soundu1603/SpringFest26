import QRCode from "react-qr-code";

function PaymentQR({ fee, upiLink }) {
  return (
    <div className="payment-card">
      <h3>Payment</h3>

      <div className="qr-box">
        <QRCode
          value={upiLink}
          size={180}
          bgColor="#ffffff"
          fgColor="#673ab7"
        />
      </div>

      <p className="fee-text">Registration Fee: {fee}</p>
    </div>
  );
}

export default PaymentQR;