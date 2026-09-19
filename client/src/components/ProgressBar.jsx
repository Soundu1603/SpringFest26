import React from "react";

function ProgressBar({ step }) {
  const steps = [
    { id: 1, label: "Personal Details" },
    { id: 2, label: "Event Details" },
  ];

  return (
    <div className="progress-shell">
      <div className="progress-labels">
        {steps.map((item) => (
          <div key={item.id} className="progress-step">
            <div className={`progress-circle ${step >= item.id ? "active" : ""}`}>
              {item.id}
            </div>
            <span className={step >= item.id ? "active-label" : ""}>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: step === 1 ? "50%" : "100%" }} />
      </div>
    </div>
  );
}

export default ProgressBar;
