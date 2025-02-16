import React, { useState } from "react";
import "./App.css"; // Import external CSS
import { FaCheckCircle } from "react-icons/fa";

const App = () => {
  const [formData, setFormData] = useState({
    uid: "",
    name: "",
    email: "",
    phoneNo: "",
    cgpa: "",
    dob: "",
    password: "",
    userimg: null,
    companies: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [sucess, setSucess] = useState(false);
  console.log(formData);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, userimg: e.target.files[0] });
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const addCompany = () => {
    setFormData({
      ...formData,
      companies: [
        ...formData.companies,
        { company: "", jobType: "", package: "" },
      ],
    });
  };

  const removeCompany = (index) => {
    const updatedCompanies = formData.companies.filter((_, i) => i !== index);
    setFormData({ ...formData, companies: updatedCompanies });
  };

  const handleCompanyChange = (index, field, value) => {
    const updatedCompanies = formData.companies.map((company, i) =>
      i === index ? { ...company, [field]: value } : company
    );
    setFormData({ ...formData, companies: updatedCompanies });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let submissionData = new FormData();
      for (let key in formData) {
        if (key === "companies") {
          submissionData.append(key, JSON.stringify(formData[key]));
        } else {
          submissionData.append(key, formData[key]);
        }
      }
      const res = await fetch(
        "https://hire-stream-backend.onrender.com/api/auth/details",
        {
          method: "POST",
          body: submissionData,
        }
      );
      console.log(res, res.error);
      if (res.ok) setSucess(true);
      const data = await res.json();
      console.log(data);
      if (!res.ok) setError(data.error);
      console.log("Form submitted successfully!");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sucess) {
    return (
      <div className="success-container">
        <div className="success-box">
          <FaCheckCircle className="success-icon" />
          <h2>Thank You for Your Submission!</h2>
          <p>
            This form is an <strong>automatic poster generation</strong> system
            for students selected in college placements.
          </p>
          <p>
            <strong>Why do we collect your password?</strong> In case our
            college placement portal is hosted in the future, you won’t need to
            sign up again. You can log in with the same credentials.
          </p>
          <p>
            We truly appreciate your time and effort in submitting the details.
          </p>
          <p>
            <strong>Thanks once again! 🎉</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="title">Enter Your Details</h2>
      <form onSubmit={handleSubmit}>
        {/* Profile Image Upload */}
        <div className="form-group profile-img">
          <label>Profile Image</label>
          <img src={previewImage} alt="Add Profile Photo Below" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="form-group">
          <label>USN</label>
          <input
            type="text"
            id="uid"
            value={formData.uid}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="number"
            id="phoneNo"
            value={formData.phoneNo}
            onChange={handleChange}
            min="1000000000"
            max="9999999999"
            required
          />
        </div>

        <div className="form-group">
          <label>CGPA</label>
          <input
            type="number"
            id="cgpa"
            value={formData.cgpa}
            onChange={handleChange}
            min="0"
            max="10"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            id="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            minLength="6"
            required
          />
        </div>

        {/* Placement Details */}
        <h3>Placement Details</h3>
        {formData.companies.map((company, index) => (
          <div className="form-group company" key={index}>
            <label>Company Name</label>
            <input
              type="text"
              value={company.company}
              onChange={(e) =>
                handleCompanyChange(index, "company", e.target.value)
              }
              required
            />

            <label>Job Type</label>
            <select
              value={company.jobType}
              onChange={(e) =>
                handleCompanyChange(index, "jobType", e.target.value)
              }
              required
            >
              <option value="">Select Type</option>
              <option value="internship">Internship</option>
              <option value="fulltime">Full Time</option>
              <option value="fulltime_internship">
                Full Time + Internship
              </option>
            </select>

            <label>Package (in LPA) or Internship Stipend</label>
            <input
              type="number"
              value={company.package}
              onChange={(e) =>
                handleCompanyChange(index, "package", e.target.value)
              }
              step="0.01"
              min="0"
              required
            />

            <button
              type="button"
              className="remove-company"
              onClick={() => removeCompany(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="add-company"
          onClick={addCompany}
          disabled={loading}
        >
          + Add Company
        </button>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default App;
