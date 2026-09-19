import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../App.css";

import ProgressBar from "../components/ProgressBar";
import PersonalDetails from "../components/PersonalDetails";
import PaperPresentationForm from "../components/PaperPresentationForm";
import PaymentQR from "../components/PaymentQR";
import RegistrationSuccess from "../components/RegistrationSuccess";

const initialValues = {
  fullName: "",
  email: "",
  phone: "",
  college: "",
  department: "",
  year: "",
  foodPreference: "",
  event: "",
  paperDomain: "",
  paperTitle: "",
  paperTeamSize: "",
  transactionId: "",
};

const registrationFees = {
  "Paper Presentation": 300,
  "AI Prompt Sprint": 100,
  "Bug Blitz": 100,
  "Idea Pitch": 100,
  "Code Insight": 100,
  "Chess Arena": 100,
  "Meme Sprint": 100,
  "Snap Rush": 100,
  "Guess The Beat": 100,
  Workshop: 350,
};

function getRegistrationFee(eventName) {
  return registrationFees[eventName] ?? 100;
}

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedEvent = searchParams.get("event") || "";

  const [step, setStep] = useState(1);

  const [formValues, setFormValues] = useState(() => ({
    ...initialValues,
    event: selectedEvent,
  }));

  const [errors, setErrors] = useState({});
  const [selectedFileName, setSelectedFileName] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [registrationData, setRegistrationData] = useState(null);

  const registrationFee = getRegistrationFee(formValues.event);
  const paymentFee = `₹${registrationFee}`;

  const paymentLink = `upi://pay?pa=technova@upi&pn=TECHNOVA26&am=${registrationFee}&cu=INR`;

  const validatePersonalDetails = (values) => {
    const nextErrors = {};

    if (!values.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!values.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(values.phone)) {
      nextErrors.phone = "Phone number must be exactly 10 digits.";
    }

    if (!values.college.trim()) {
      nextErrors.college = "College name is required.";
    }

    if (!values.department.trim()) {
      nextErrors.department = "Department is required.";
    }

    if (!values.year) {
      nextErrors.year = "Please select your year of studying.";
    }

    if (!values.foodPreference) {
      nextErrors.foodPreference = "Food preference is required.";
    }

    if (!values.event) {
      nextErrors.event = "Please select an event.";
    }

    return nextErrors;
  };

  const validateStepTwo = (eventName, values) => {
    const nextErrors = {};

    if (!values.transactionId.trim()) {
      nextErrors.transactionId = "Transaction ID is required.";
    }

    if (!selectedFileName) {
      nextErrors.paymentFile = "Payment screenshot is required.";
    }

    // Only Paper Presentation has additional event-specific fields.
    if (eventName === "Paper Presentation") {
      if (!values.paperDomain) {
        nextErrors.paperDomain = "Please select a domain.";
      }

      if (!values.paperTitle.trim()) {
        nextErrors.paperTitle = "Paper title is required.";
      }

      if (!values.paperTeamSize) {
        nextErrors.paperTeamSize = "Team size is required.";
      }
    }

    return nextErrors;
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setFormValues((previous) => {
      const nextValues = {
        ...previous,
        [name]: value,
      };

      const personalValidation = validatePersonalDetails(nextValues);

      setErrors((prev) => ({
        ...prev,
        [name]: personalValidation[name] || "",
      }));

      return nextValues;
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setSelectedFileName("");

      setErrors((previous) => ({
        ...previous,
        paymentFile: "Payment screenshot is required.",
      }));

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    const extension = file.name
      .split(".")
      .pop()
      ?.toLowerCase();

    const isAllowedType =
      allowedTypes.includes(file.type) ||
      ["jpg", "jpeg", "png"].includes(extension);

    if (!isAllowedType) {
      setErrors((previous) => ({
        ...previous,
        paymentFile:
          "Only JPG, JPEG, and PNG files are allowed.",
      }));

      setSelectedFileName("");
      event.target.value = "";

      return;
    }

    if (file.size > 100 * 1024) {
      setErrors((previous) => ({
        ...previous,
        paymentFile: "File size must be less than 100 KB",
      }));

      setSelectedFileName("");
      event.target.value = "";

      return;
    }

    setSelectedFileName(file.name);

    setErrors((previous) => ({
      ...previous,
      paymentFile: "",
    }));
  };

  const isPersonalDetailsValid =
    Object.keys(validatePersonalDetails(formValues)).length === 0;

  const handleContinue = () => {
    const nextErrors = validatePersonalDetails(formValues);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setStep(2);
      setSubmitMessage("");
    }
  };

  const handleBack = () => {
    setStep(1);
    setSubmitMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateStepTwo(
      formValues.event,
      formValues
    );

    setErrors((previous) => ({
      ...previous,
      ...nextErrors,
    }));

    if (Object.keys(nextErrors).length === 0) {
      const id = `REG-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      const payload = {
        id,
        event: formValues.event,
        fullName: formValues.fullName,
        email: formValues.email,
        phone: formValues.phone,
        college: formValues.college,
        department: formValues.department,
        year: formValues.year,
        foodPreference: formValues.foodPreference,

        paperDomain: formValues.paperDomain,
        paperTitle: formValues.paperTitle,
        paperTeamSize: formValues.paperTeamSize,

        transactionId: formValues.transactionId,
        paymentFileName: selectedFileName,

        timestamp: new Date().toISOString(),
      };

      try {
        const response = await axios.post(
          "/api/register",
          payload
        );

        setRegistrationData({
          ...payload,
          qrToken: response.data?.qrToken || "",
        });

        setSubmitMessage(
          `Registration successfully submitted for ${formValues.event}.`
        );

        setStep(3);
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          "Unable to save registration. Please try again.";

        setSubmitMessage(message);
      }
    }
  };

  const renderStepTwoForm = () => {
    /*
      PAPER PRESENTATION
      ------------------
      Your existing PaperPresentationForm.jsx is used
      exactly as it is. No changes are made to it.
    */
    if (formValues.event === "Paper Presentation") {
      return (
        <PaperPresentationForm
          values={formValues}
          onChange={handleFieldChange}
          errors={errors}
          onFileChange={handleFileChange}
          selectedFileName={selectedFileName}
          fee={paymentFee}
          upiLink={paymentLink}
        />
      );
    }

    /*
      ALL OTHER EVENTS
      ----------------
      Same structure/classes as PaperPresentationForm.jsx,
      but ONLY:
      - Payment QR
      - Transaction ID
      - Payment Screenshot
    */
    return (
      <div className="form-panel">
        <div className="panel-header">
          <p className="eyebrow">STEP 2</p>

          <h2>{formValues.event}</h2>
        </div>

        <PaymentQR
          fee={paymentFee}
          upiLink={paymentLink}
        />

        <div className="field-group">
          <label htmlFor="transactionId">
            Transaction ID *
          </label>

          <input
            id="transactionId"
            name="transactionId"
            value={formValues.transactionId}
            onChange={handleFieldChange}
            placeholder="Enter the transaction reference"
          />

          {errors.transactionId && (
            <p className="field-error">
              {errors.transactionId}
            </p>
          )}
        </div>

        <div className="field-group">
          <label htmlFor="paymentFile">
            Upload Payment Screenshot *
          </label>

          <input
            id="paymentFile"
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handleFileChange}
          />

          {selectedFileName && (
            <p className="helper-text">
              Selected file: {selectedFileName}
            </p>
          )}

          {errors.paymentFile && (
            <p className="field-error">
              {errors.paymentFile}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="register-container">
      <button
        type="button"
        className="register-page-back"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="register-banner">
        <h1>SPRING FEST&apos;26</h1>

        <p>
          National Level Technical Symposium Registration
        </p>
      </div>

      <div className="form-card">
        <ProgressBar step={step} />

        {submitMessage && (
          <div className="success-banner">
            {submitMessage}
          </div>
        )}

        {step === 1 ? (
          <PersonalDetails
            values={formValues}
            onChange={handleFieldChange}
            errors={errors}
            onContinue={handleContinue}
            isValid={isPersonalDetailsValid}
          />
        ) : step === 2 ? (
          <form
            onSubmit={handleSubmit}
            className="fade-in"
          >
            {renderStepTwoForm()}

            <div className="action-row">
              <button
                type="button"
                className="secondary-btn"
                onClick={handleBack}
              >
                Back
              </button>

              <button
                type="submit"
                className="primary-btn"
              >
                Submit Registration
              </button>
            </div>
          </form>
        ) : step === 3 ? (
          <RegistrationSuccess
            data={registrationData}
            onNew={() => {
              setFormValues({
                ...initialValues,
                event: "",
              });

              setSelectedFileName("");
              setErrors({});
              setRegistrationData(null);
              setStep(1);
              setSubmitMessage("");
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default Register;