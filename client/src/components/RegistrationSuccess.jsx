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

  const svgData = new XMLSerializer().serializeToString(svg);

  const svgBlob = new Blob(
    [svgData],
    { type: "image/svg+xml;charset=utf-8" }
  );

  const url = URL.createObjectURL(svgBlob);

  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement("canvas");

    canvas.width = 700;
    canvas.height = 700;

    const ctx = canvas.getContext("2d");

    // White background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 700, 700);

    // Draw QR in the center
    ctx.drawImage(
      img,
      100,
      100,
      500,
      500
    );

    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      if (!blob) {
        alert("Could not save QR code.");
        return;
      }

      const pngUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = pngUrl;
      link.download =
        `SPRING-FEST-26-${data.id}-Attendance-QR.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(pngUrl);
      }, 1000);
    }, "image/png");
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
    alert("Could not create QR image.");
  };

  img.src = url;
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