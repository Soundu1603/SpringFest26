import QRCode from "react-qr-code";

function RegistrationSuccess({ data, onNew }) {
  if (!data) return null;

  const qrValue = data.qrToken || data.id;

  const handleSaveQR = () => {
  const svg = document.querySelector(".qr-large svg");

  if (!svg) {
    alert("QR code could not be found.");
    return;
  }

  const finalSvg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );

  finalSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  finalSvg.setAttribute("width", "700");
  finalSvg.setAttribute("height", "700");
  finalSvg.setAttribute("viewBox", "0 0 700 700");

  // White background
  const background = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );

  background.setAttribute("x", "0");
  background.setAttribute("y", "0");
  background.setAttribute("width", "700");
  background.setAttribute("height", "700");
  background.setAttribute("fill", "#FFFFFF");

  finalSvg.appendChild(background);

  // Clone the actual QR
  const qrClone = svg.cloneNode(true);

  qrClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  qrClone.setAttribute("x", "100");
  qrClone.setAttribute("y", "100");
  qrClone.setAttribute("width", "500");
  qrClone.setAttribute("height", "500");

  finalSvg.appendChild(qrClone);

  const svgData = new XMLSerializer().serializeToString(finalSvg);

  const blob = new Blob(
    [svgData],
    { type: "image/svg+xml;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `SPRING-FEST-26-${data.id}-Attendance-QR.svg`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};
  return (
    <div className="confirmation-card">
      <h2 className="success-title">Registration Confirmed</h2>

      <p className="success-sub">
        Show this QR code to the event coordinator at the venue for attendance
        check-in.
      </p>

      <div className="qr-large">
        <QRCode
          value={qrValue}
          size={280}
          level="M"
          fgColor="#000000"
          bgColor="#FFFFFF"
          style={{
            display: "block",
            width: "280px",
            height: "280px",
          }}
        />
      </div>

      <p className="qr-scan-note">
        Keep the QR code bright, clear, and fully visible when scanning.
      </p>

      <button
        type="button"
        className="save-attendance-qr-btn"
        onClick={handleSaveQR}
      >
        Save QR Code
      </button>

      <div className="confirmation-meta">
        <p>
          <strong>ID:</strong> {data.id}
        </p>

        <p>
          <strong>Name:</strong> {data.fullName}
        </p>

        <p>
          <strong>Event:</strong> {data.event}
        </p>
      </div>

      <div className="action-row" style={{ marginTop: 18 }}>
        <button className="secondary-btn" onClick={onNew}>
          New Registration
        </button>
      </div>
    </div>
  );
}

export default RegistrationSuccess;