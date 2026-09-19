function PersonalDetails({ values, onChange, errors, onContinue, isValid }) {
  return (
    <div className="form-panel">
      <div className="panel-header">
        <p className="eyebrow">STEP 1</p>
        <h2>Personal Details</h2>
        <p className="panel-copy">Please provide your basic information to continue with the symposium registration.</p>
      </div>

      <div className="field-group">
        <label htmlFor="fullName">Full Name *</label>
        <input id="fullName" name="fullName" value={values.fullName} onChange={onChange} placeholder="Enter your full name" />
        {errors.fullName && <p className="field-error">{errors.fullName}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="email">Email Address *</label>
        <input id="email" type="email" name="email" value={values.email} onChange={onChange} placeholder="name@example.com" />
        {errors.email && <p className="field-error">{errors.email}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="phone">Phone Number *</label>
        <input id="phone" type="tel" name="phone" value={values.phone} onChange={onChange} placeholder="Enter 10-digit phone number" />
        {errors.phone && <p className="field-error">{errors.phone}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="college">College Name *</label>
        <input id="college" name="college" value={values.college} onChange={onChange} placeholder="Your college or university" />
        {errors.college && <p className="field-error">{errors.college}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="department">Department *</label>
        <input id="department" name="department" value={values.department} onChange={onChange} placeholder="Department name" />
        {errors.department && <p className="field-error">{errors.department}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="year">Year of Studying *</label>
        <select id="year" name="year" value={values.year} onChange={onChange}>
          <option value="">Select year</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
        </select>
        {errors.year && <p className="field-error">{errors.year}</p>}
      </div>

      <div className="field-group">
        <label>Food Preference *</label>
        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" name="foodPreference" value="Veg" checked={values.foodPreference === "Veg"} onChange={onChange} />
            <span>Veg</span>
          </label>
          <label className="radio-option">
            <input type="radio" name="foodPreference" value="Non-Veg" checked={values.foodPreference === "Non-Veg"} onChange={onChange} />
            <span>Non-Veg</span>
          </label>
        </div>
        {errors.foodPreference && <p className="field-error">{errors.foodPreference}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="event">Select Event *</label>
        <select id="event" name="event" value={values.event} onChange={onChange}>
          <option value="">Choose an event</option>
          <option value="Paper Presentation">Paper Presentation</option>
          <option value="AI Prompt Sprint">AI Prompt Sprint</option>
          <option value="Bug Blitz">Bug Blitz</option>
          <option value="Idea Pitch">Idea Pitch</option>
          <option value="Code Insight">Code Insight</option>
          <option value="Chess Arena">Chess Arena</option>
          <option value="Meme Sprint">Meme Sprint</option>
          <option value="Snap Rush">Snap Rush</option>
          <option value="Guess The Beat">Guess The Beat</option>
          <option value="Workshop">Workshop</option>
        </select>
        {errors.event && <p className="field-error">{errors.event}</p>}
      </div>

      <button type="button" className="primary-btn" onClick={onContinue} disabled={!isValid}>
        Continue
      </button>
    </div>
  );
}

export default PersonalDetails;
