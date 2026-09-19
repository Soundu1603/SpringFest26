import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";

const EVENTS = [
  "Paper Presentation",
  "AI Prompt Sprint",
  "Bug Blitz",
  "Idea Pitch",
  "Code Insight",
  "Chess Arena",
  "Meme Sprint",
  "Snap Rush",
  "Guess The Beat",
  "Workshop",
];

function CoordinatorCheckIn() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAdminAuth();

  const [selectedEvent, setSelectedEvent] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [status, setStatus] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const processingRef = useRef(false);

  const stopScanner = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setScannerActive(false);
    setCameraReady(false);
  }, []);

  const scanFrameRef = useRef(null);

  const loadAttendance = useCallback(async () => {
    if (!selectedEvent) {
      setAttendanceRecords([]);
      setAttendanceError("");
      setAttendanceLoading(false);
      return;
    }

    setAttendanceLoading(true);
    setAttendanceError("");

    try {
      // Use the existing protected registration endpoint so the original
      // registrations database remains unchanged. Only checked-in students
      // for the selected event are displayed below the scanner.
      const response = await fetch("/api/registrations", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load attendance records");
      }

      const data = await response.json();
      const checkedInForEvent = data
        .filter(
          (record) =>
            record.event === selectedEvent &&
            record.attendanceStatus === "checked-in"
        )
        .sort(
          (a, b) =>
            new Date(b.checkInTime || 0) -
            new Date(a.checkInTime || 0)
        );

      setAttendanceRecords(checkedInForEvent);
    } catch (error) {
      console.error("Attendance records error:", error);
      setAttendanceError(
        error?.message || "Unable to load attendance records."
      );
      setAttendanceRecords([]);
    } finally {
      setAttendanceLoading(false);
    }
  }, [selectedEvent]);

  const handleScan = useCallback(
    async (decodedText) => {
      if (processingRef.current || !selectedEvent) return;

      const qrToken = decodedText.trim();
      if (!qrToken) return;

      processingRef.current = true;
      setProcessing(true);
      setScannerError("");
      setStatus(null);

      stopScanner();

      try {
        console.log("QR decoded:", qrToken);
        console.log("Selected event:", selectedEvent);

        // Keep the request same-origin so the existing Vite /api proxy
        // and admin session cookie are used.
        const response = await fetch("/api/attendance/check-in", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            qrToken,
            event: selectedEvent,
          }),
        });

        console.log("Attendance response status:", response.status);
        console.log(
          "Attendance response content-type:",
          response.headers.get("content-type")
        );

        const responseText = await response.text();
        console.log("Attendance response:", responseText);

        let data = {};

        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          throw new Error(
            `Server returned an unexpected response (HTTP ${response.status}).`
          );
        }

        if (!response.ok) {
          setStatus({
            type:
              response.status === 409 && data.alreadyCheckedIn
                ? "warning"
                : "error",
            message:
              data.message ||
              `Attendance check-in failed (HTTP ${response.status}).`,
            registration: data.registration || null,
          });
          return;
        }

        setStatus({
          type: "success",
          message: data.message || "Check-in successful.",
          registration: data.registration || null,
        });

        // Refresh the selected-event attendance list immediately after
        // a successful check-in.
        await loadAttendance();
      } catch (error) {
        console.error("ATTENDANCE CHECK-IN ERROR:", error);

        setStatus({
          type: "error",
          message:
            error?.message ||
            "Unable to connect to the server. Please try again.",
        });
      } finally {
        setProcessing(false);
        processingRef.current = false;
      }
    },
    [selectedEvent, stopScanner, loadAttendance]
  );

  // Keep the camera scan loop in a callback instead of assigning a ref
  // during render. This avoids React hook/lint errors while keeping the
  // existing jsQR scanner behaviour unchanged.
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      !video ||
      !canvas ||
      video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA ||
      processingRef.current
    ) {
      if (!processingRef.current && streamRef.current) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Scan the complete camera frame. jsQR locates the QR code itself,
    // so the QR does not have to be perfectly centered in the guide box.
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!context) {
      setScannerError("Unable to read the camera image.");
      stopScanner();
      return;
    }

    context.drawImage(video, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, width, height);

    const code = jsQR(
      imageData.data,
      imageData.width,
      imageData.height,
      {
        inversionAttempts: "attemptBoth",
      }
    );

    if (code?.data) {
      handleScan(code.data);
      return;
    }

    if (streamRef.current) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
  }, [handleScan, stopScanner]);

  useEffect(() => {
    scanFrameRef.current = scanFrame;

    return () => {
      if (scanFrameRef.current === scanFrame) {
        scanFrameRef.current = null;
      }
    };
  }, [scanFrame]);

  const startScanner = async () => {
    if (!selectedEvent) {
      setScannerError("Please select the event before opening the scanner.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerError(
        "Camera access is not supported by this browser. Please use the latest Chrome."
      );
      return;
    }

    setScannerError("");
    setStatus(null);
    setProcessing(false);
    processingRef.current = false;

    stopScanner();

    try {
      // Start with a normal webcam request. This is more compatible with
      // Windows laptops than forcing a facingMode or a camera ID.
      let stream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { ideal: "environment" },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        throw new Error("Camera preview is not available.");
      }

      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.muted = true;

      await video.play();

      setScannerActive(true);
      setCameraReady(true);

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    } catch (error) {
      console.error("Camera scanner error:", error);
      stopScanner();

      if (error?.name === "NotAllowedError") {
        setScannerError(
          "Camera permission was denied. Allow camera access for localhost and try again."
        );
      } else if (error?.name === "NotFoundError") {
        setScannerError("No camera was found on this device.");
      } else {
        setScannerError(
          "Camera could not be opened. Please check the camera permission and try again."
        );
      }
    }
  };

  const scanAgain = () => {
    setStatus(null);
    setScannerError("");
    startScanner();
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/admin-login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="admin-status">Checking admin access...</div>
      </div>
    );
  }

  return (
    <div className="admin-page coordinator-page">
      <div className="admin-header coordinator-header">
        <p className="admin-tag">Event Coordinator</p>
        <h1>QR Check-in</h1>
        <p className="coordinator-intro">
          Scan a student's registration QR code to verify their event and mark
          attendance.
        </p>

        <button
          type="button"
          className="secondary-btn coordinator-back-btn"
          onClick={() => {
            stopScanner();
            navigate("/admin");
          }}
        >
          ← Back to Admin
        </button>
      </div>

      <div className="coordinator-card">
        <div className="coordinator-event-select">
          <label htmlFor="coordinator-event">Select Event</label>
          <select
            id="coordinator-event"
            value={selectedEvent}
            onChange={(event) => {
              stopScanner();
              setSelectedEvent(event.target.value);
              setStatus(null);
              setScannerError("");
            }}
            disabled={scannerActive || processing}
          >
            <option value="">Choose the event</option>
            {EVENTS.map((event) => (
              <option key={event} value={event}>
                {event}
              </option>
            ))}
          </select>
        </div>

        <div className="coordinator-scanner-card">
          <div
            className={`coordinator-camera-wrap ${
              cameraReady ? "camera-active" : ""
            }`}
          >
            <video
              ref={videoRef}
              className="coordinator-camera"
              autoPlay
              muted
              playsInline
            />
            <div className="coordinator-scan-frame" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            {cameraReady && (
              <div className="coordinator-camera-hint">
                Position the complete QR code anywhere inside the camera view.
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="coordinator-scan-canvas" />

          {!scannerActive && !processing && (
            <div className="scanner-placeholder">
              <div className="scanner-icon">▣</div>
              <h2>Ready to Scan</h2>
              <p>
                Select the event, open the camera, and show the student's QR
                code clearly to the webcam.
              </p>
            </div>
          )}
        </div>

        <div className="coordinator-actions">
          {!scannerActive ? (
            <button
              type="button"
              className="primary-btn"
              onClick={startScanner}
              disabled={!selectedEvent || processing}
            >
              {processing ? "Processing..." : "Open QR Scanner"}
            </button>
          ) : (
            <button
              type="button"
              className="secondary-btn"
              onClick={stopScanner}
            >
              Stop Scanner
            </button>
          )}
        </div>

        {scannerError && (
          <div className="coordinator-result coordinator-error">
            {scannerError}
          </div>
        )}

        {status && (
          <div className={`coordinator-result coordinator-${status.type}`}>
            <strong>{status.message}</strong>

            {status.registration && (
              <div className="coordinator-result-details">
                <p>
                  <strong>Student:</strong>{" "}
                  {status.registration.fullName}
                </p>
                {status.registration.college && (
                  <p>
                    <strong>College:</strong>{" "}
                    {status.registration.college}
                  </p>
                )}
                <p>
                  <strong>Event:</strong> {status.registration.event}
                </p>
                {status.registration.checkInTime && (
                  <p>
                    <strong>Check-in time:</strong>{" "}
                    {new Date(
                      status.registration.checkInTime
                    ).toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              className="primary-btn"
              onClick={scanAgain}
              disabled={processing}
            >
              Scan Again
            </button>
          </div>
        )}
      </div>

      {selectedEvent && (
        <div className="coordinator-card coordinator-attendance-card">
          <div className="attendance-header">
            <div>
              <p className="admin-tag">Selected Event</p>
              <h2>{selectedEvent} - Attendance</h2>
              <p>
                Only students who have successfully checked in for this event
                are shown here.
              </p>
            </div>
          </div>

          {attendanceLoading ? (
            <div className="admin-status">Loading attendance records...</div>
          ) : attendanceError ? (
            <div className="admin-status error">{attendanceError}</div>
          ) : attendanceRecords.length === 0 ? (
            <div className="admin-status">
              No students have checked in for {selectedEvent} yet.
            </div>
          ) : (
            <div className="admin-table-wrap coordinator-attendance-table-wrap">
              <table
                className="admin-table coordinator-attendance-table"
                style={{ width: "100%", minWidth: 0, tableLayout: "fixed" }}
              >
                <thead>
                  <tr>
                    <th style={{ width: "17%" }}>Registration ID</th>
                    <th style={{ width: "15%" }}>Name</th>
                    <th style={{ width: "20%" }}>College</th>
                    <th style={{ width: "18%" }}>Department</th>
                    <th style={{ width: "10%" }}>Year</th>
                    <th style={{ width: "20%" }}>Check-in Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>{record.id}</td>
                      <td style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>{record.fullName}</td>
                      <td style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>{record.college}</td>
                      <td style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>{record.department}</td>
                      <td style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>{record.year}</td>
                      <td style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
                        {record.checkInTime
                          ? new Date(record.checkInTime).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CoordinatorCheckIn;
