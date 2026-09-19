import PaymentQR from "./PaymentQR";

function PaperPresentationForm({ values, onChange, errors, onFileChange, selectedFileName, fee, upiLink }) {
  return (
    <div className="form-panel">
      <div className="panel-header">
        <p className="eyebrow">STEP 2</p>
        <h2>{values.event}</h2>
      </div>

      <div className="field-group">
        <label htmlFor="paperDomain">Domain *</label>
        <select id="paperDomain" name="paperDomain" value={values.paperDomain} onChange={onChange}>
          <option value="">Select domain</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Machine Learning">Machine Learning</option>
          <option value="Cyber Security">Cyber Security</option>
          <option value="Cloud Computing">Cloud Computing</option>
          <option value="Web Development">Web Development</option>
          <option value="Data Science">Data Science</option>
          <option value="Internet of Things">Internet of Things</option>
        </select>
        {errors.paperDomain && <p className="field-error">{errors.paperDomain}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="paperTitle">Paper Title *</label>
        <input id="paperTitle" name="paperTitle" value={values.paperTitle} onChange={onChange} placeholder="Title of your paper" />
        {errors.paperTitle && <p className="field-error">{errors.paperTitle}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="paperTeamSize">Team Size *</label>
        <select id="paperTeamSize" name="paperTeamSize" value={values.paperTeamSize} onChange={onChange}>
          <option value="">Select team size</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
        <p className="helper-text">Maximum team size: 3</p>
        {errors.paperTeamSize && <p className="field-error">{errors.paperTeamSize}</p>}
      </div>

      <PaymentQR fee={fee} upiLink={upiLink} />

      <div className="field-group">
        <label htmlFor="transactionId">Transaction ID *</label>
        <input id="transactionId" name="transactionId" value={values.transactionId} onChange={onChange} placeholder="Enter the transaction reference" />
        {errors.transactionId && <p className="field-error">{errors.transactionId}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="paymentFile">Upload Payment Screenshot *</label>
        <input id="paymentFile" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={onFileChange} />
        {selectedFileName && <p className="helper-text">Selected file: {selectedFileName}</p>}
        {errors.paymentFile && <p className="field-error">{errors.paymentFile}</p>}
      </div>
    </div>
  );
}

export default PaperPresentationForm;
