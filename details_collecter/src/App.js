import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css"; // Import external CSS
import { FaCheckCircle, FaDownload, FaTable, FaThLarge } from "react-icons/fa";

// Original Form Component
const StudentForm = () => {
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
      if (res.ok) setSucess(true);
      const data = await res.json();
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
            college placement portal is hosted in the future, you won't need to
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
          <label style={{ width: "100%" }}>Profile Image</label>
          <img src={previewImage} alt="Add Profile Below" />
          <input
            style={{ width: "94%" }}
            type="file"
            accept=".jpg, .jpeg, .png"
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
        <h3>Placement Details </h3>
        <h5>(Please enter your placement details by pressing the "+ Add Company" button below.)</h5>
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

// Enhanced Poster Generator Component
const PosterGenerator = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentData, setStudentData] = useState([]);
  const [companyData, setCompanyData] = useState({});
  const [selectedCompany, setSelectedCompany] = useState("");
  const [viewMode, setViewMode] = useState("card"); // "table" or "card"
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [companyNormalizations, setCompanyNormalizations] = useState(new Map());
  const canvasRefs = useRef({});

  console.log(companyData);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://hire-stream-backend.onrender.com/api/user/alllist");
        const data = await response.json();
        console.log("Fetched student data:", data);

        // Filter ISE students only (USN starts with 1bi21is or 1BI21IS followed by 3 digits)
        const iseStudents = data.users.filter((student) => {
          const uid = student.uid.trim().toUpperCase();
          return /^1BI21IS\d{3}$/i.test(uid);
        });

        console.log(
          `Found ${iseStudents.length} ISE students out of ${data.length} total students`
        );
        setStudentData(iseStudents);

        // Process company data
        processCompanyData(iseStudents);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setError("Failed to fetch student data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  // This function creates a canonical form of the company name for comparison
  const getCanonicalForm = (name) => {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  };

  // Updated normalizeCompanyName function that uses the component state
  const normalizeCompanyName = (name) => {
    if (!name) return "";

    // Get the canonical form for comparison
    const canonicalForm = getCanonicalForm(name);

    // If we've seen this canonical form before, return the normalized name
    if (companyNormalizations.has(canonicalForm)) {
      return companyNormalizations.get(canonicalForm);
    }

    // For a new company, use the lowercase, trimmed version as the normalized form
    const normalizedName = name.trim().toLowerCase();

    // Update our normalizations map with this new entry
    const updatedNormalizations = new Map(companyNormalizations);
    updatedNormalizations.set(canonicalForm, normalizedName);
    setCompanyNormalizations(updatedNormalizations);

    return normalizedName;
  };

  const processCompanyData = (students) => {
    // Initialize empty object to store company data
    const companies = {};

    // Track canonical forms we've seen to group variations of the same company
    const seenCanonicalForms = new Map();

    // First pass: Identify all unique companies and their canonical forms
    students.forEach((student) => {
      if (student.companies && student.companies.length > 0) {
        student.companies.forEach((companyInfo) => {
          const rawCompanyName = companyInfo.company || "";
          if (rawCompanyName) {
            const canonicalForm = getCanonicalForm(rawCompanyName);
            const normalizedName = rawCompanyName.trim().toLowerCase();

            if (!seenCanonicalForms.has(canonicalForm)) {
              seenCanonicalForms.set(canonicalForm, normalizedName);
            }
          }
        });
      }
    });

    // Update our normalizations map
    setCompanyNormalizations(seenCanonicalForms);

    // Second pass: Process student data using the normalization mapping
    students.forEach((student) => {
      if (student.companies && student.companies.length > 0) {
        student.companies.forEach((companyInfo) => {
          const rawCompanyName = companyInfo.company || "";
          if (rawCompanyName) {
            const canonicalForm = getCanonicalForm(rawCompanyName);
            const normalizedCompanyName = seenCanonicalForms.get(canonicalForm);

            if (normalizedCompanyName) {
              // Initialize company entry if it doesn't exist
              if (!companies[normalizedCompanyName]) {
                companies[normalizedCompanyName] = {
                  name: normalizedCompanyName,
                  students: [],
                  jobTypes: new Set(),
                  packages: [],
                };
              }

              // Add student to company's student list
              companies[normalizedCompanyName].students.push({
                name: student.name,
                usn: student.uid,
                userimg: student.profileImageUrl,
                jobType: companyInfo.jobType,
                package: companyInfo.package,
              });

              // Track job types and packages
              companies[normalizedCompanyName].jobTypes.add(
                companyInfo.jobType
              );
              companies[normalizedCompanyName].packages.push(
                parseFloat(companyInfo.package) || 0
              );
            }
          }
        });
      }
    });

    // Process additional stats for each company
    Object.keys(companies).forEach((companyName) => {
      const company = companies[companyName];

      // Convert job types set to array
      company.jobTypes = Array.from(company.jobTypes);

      // Determine most common job type
      const jobTypeCounts = {};
      company.students.forEach((student) => {
        jobTypeCounts[student.jobType] =
          (jobTypeCounts[student.jobType] || 0) + 1;
      });

      let mostCommonJobType = "";
      let maxCount = 0;
      Object.entries(jobTypeCounts).forEach(([jobType, count]) => {
        if (count > maxCount) {
          mostCommonJobType = jobType;
          maxCount = count;
        }
      });

      company.mostCommonJobType = mostCommonJobType;

      // Calculate average package
      const validPackages = company.packages.filter((p) => p > 0);
      company.avgPackage =
        validPackages.length > 0
          ? (
            validPackages.reduce((sum, pkg) => sum + pkg, 0) /
            validPackages.length
          ).toFixed(2)
          : "N/A";

      console.log(
        `Processed ${company.students.length} students for ${companyName}`
      );
    });

    console.log("Processed company data:", companies);
    setCompanyData(companies);
  };

  const renderPoster = (companyName) => {
    setSelectedCompany(companyName);
  };

  // Format job type for display
  const formatJobType = (jobType) => {
    switch (jobType) {
      case "fulltime":
        return "Full Time Offer";
      case "internship":
        return "Internship";
      case "fulltime_internship":
        return "Full Time + Internship";
      default:
        return jobType;
    }
  };

  // Format package based on job type
  const formatPackage = (packageValue, jobType) => {
    if (!packageValue) return "N/A";

    packageValue = parseFloat(packageValue);

    switch (jobType) {
      case "fulltime":
        return `₹${packageValue.toFixed(2)} LPA`;
      case "internship":
        return `₹${packageValue.toFixed(2)}k (Monthly)`;
      case "fulltime_internship":
        return `₹${packageValue.toFixed(2)} LPA`;
      default:
        return `₹${packageValue.toFixed(2)}`;
    }
  };

  // Download all posters as a batch
  const downloadAllPosters = async () => {
    setIsDownloadingAll(true);

    try {
      // Create a zip file using JSZip
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Add each poster to the zip file
      const companyNames = Object.keys(companyData);

      for (const companyName of companyNames) {
        const canvas = canvasRefs.current[companyName];
        if (canvas) {
          const dataUrl = canvas.toDataURL("image/png");
          // Convert data URL to blob
          const response = await fetch(dataUrl);
          const blob = await response.blob();

          // Add to zip
          zip.file(`${companyName.replace(/\s+/g, "-")}-poster.png`, blob);
        }
      }

      // Generate and download the zip file
      const zipContent = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipContent);
      link.download = "all-company-posters.zip";
      link.click();
    } catch (error) {
      console.error("Error downloading all posters:", error);
      alert("Failed to download all posters. Please try again later.");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <div className="poster-generator-container">
      <h2>Company Placement Posters</h2>

      {loading && <p>Loading student data...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="company-list">
          <div className="controls">
            <h3>Select a Company to Generate Poster</h3>
            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
              >
                <FaTable /> Table View
              </button>
              <button
                className={`view-btn ${viewMode === "card" ? "active" : ""}`}
                onClick={() => setViewMode("card")}
              >
                <FaThLarge /> Card View
              </button>
              <button
                className="download-all-btn"
                onClick={downloadAllPosters}
                disabled={isDownloadingAll}
              >
                <FaDownload />{" "}
                {isDownloadingAll ? "Downloading..." : "Download All Posters"}
              </button>
            </div>
          </div>

          {Object.keys(companyData).length === 0 ? (
            <p>No company data found.</p>
          ) : viewMode === "table" ? (
            // Table view
            <div className="companies-table-container">
              <table className="companies-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Students</th>
                    <th>Job Types</th>
                    <th>Avg Package</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(companyData).map((companyName) => (
                    <tr key={companyName}>
                      <td>{companyName}</td>
                      <td>{companyData[companyName].students.length}</td>
                      <td>
                        {companyData[companyName].jobTypes
                          .map(formatJobType)
                          .join(", ")}
                      </td>
                      <td>₹{companyData[companyName].avgPackage} {companyData[companyName].jobTypes.includes("fulltime") || companyData[companyName].jobTypes.includes("fulltime_internship") ? "LPA" : ""}</td>
                      <td>
                        <button
                          onClick={() => renderPoster(companyName)}
                          className="generate-btn"
                        >
                          Generate Poster
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Card view
            <div className="companies">
              {Object.keys(companyData).map((companyName) => (
                <div className="company-card" key={companyName}>
                  <h4>{companyName}</h4>
                  <p>Students: {companyData[companyName].students.length}</p>
                  <p>Avg Package: ₹{companyData[companyName].avgPackage} LPA</p>
                  <p>
                    Job Types:{" "}
                    {companyData[companyName].jobTypes
                      .map(formatJobType)
                      .join(", ")}
                  </p>
                  <button
                    onClick={() => renderPoster(companyName)}
                    className="generate-btn"
                  >
                    Generate Poster
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hidden canvas elements for pre-rendering all posters */}
      <div style={{ display: "none" }}>
        {Object.keys(companyData).map((companyName) => (
          <CompanyPoster
            key={companyName}
            companyName={companyName}
            jobTitle={formatJobType(companyData[companyName].mostCommonJobType)}
            list={companyData[companyName].students}
            package={`₹${companyData[companyName].avgPackage} ${companyData[companyName].jobTypes.includes("fulltime") || companyData[companyName].jobTypes.includes("fulltime_internship") ? "LPA" : ""}`}
            baseImageUrl="https://res.cloudinary.com/dw8dsa7ei/image/upload/v1740761538/asnluucipeljgiukb4g9.png"
            formatJobType={formatJobType}
            formatPackage={formatPackage}
            canvasRef={(el) => (canvasRefs.current[companyName] = el)}
          />
        ))}
      </div>

      {selectedCompany && (
        <div className="poster-container">
          <h3>Poster for {selectedCompany}</h3>
          <CompanyPoster
            companyName={selectedCompany}
            jobTitle={formatJobType(
              companyData[selectedCompany].mostCommonJobType
            )}
            list={companyData[selectedCompany].students}
            package={`₹${companyData[selectedCompany].avgPackage} ${companyData[selectedCompany].jobTypes.includes("fulltime") || companyData[selectedCompany].jobTypes.includes("fulltime_internship") ? "LPA" : ""}`}
            baseImageUrl="https://res.cloudinary.com/dw8dsa7ei/image/upload/v1740761538/asnluucipeljgiukb4g9.png"
            formatJobType={formatJobType}
            formatPackage={formatPackage}
            canvasRef={(el) =>
              (canvasRefs.current[`visible-${selectedCompany}`] = el)
            }
            visible={true}
          />
          <button onClick={() => setSelectedCompany("")} className="back-btn">
            Back to Companies
          </button>
        </div>
      )}
    </div>
  );
};

// Enhanced Poster Component with Borders and Package Display
const CompanyPoster = ({
  baseImageUrl,
  companyName,
  jobTitle,
  list,
  package: salary,
  formatJobType,
  formatPackage,
  canvasRef,
  visible = false,
  gap = 20,
  overlapAmount = 10,
}) => {
  const localCanvasRef = useRef(null);

  const setRef = (el) => {
    localCanvasRef.current = el;
    if (canvasRef) {
      canvasRef(el);
    }
  };

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => {
        console.error(`Failed to load image: ${url}`, e);
        reject(new Error(`Image load failed: ${url}`));
      };
      img.src = url;
    });
  };

  useEffect(() => {
    const createCollage = async () => {
      try {
        const canvas = localCanvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const baseImage = await loadImage(baseImageUrl);
        const images = await Promise.all(
          list.map((item) => loadImage(item.userimg).catch(() => null))
        ).then((imgs) => imgs.filter(Boolean));

        if (images.length === 0) return;

        const canvasWidth = baseImage.width;
        const canvasHeight = baseImage.height;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        context.drawImage(baseImage, 0, 0, canvasWidth, canvasHeight);

        const usableTop = canvasHeight * (6 / 12) - overlapAmount;
        const usableBottom = canvasHeight * (10 / 12);
        const usableHeight = usableBottom - usableTop;
        const usableWidth = canvasWidth * 0.9;

        // Display Company Name - Package
        context.font = "bold 36px Georgia";
        context.fillStyle = "#FFD700";
        context.textAlign = "center";
        context.fillText(
          companyName.toUpperCase(),
          canvasWidth / 2,
          usableTop - 80
        );

        context.font = "italic 24px Arial";
        context.fillStyle = "#FFA500";
        context.fillText(`${jobTitle} - ${salary}`, canvasWidth / 2, usableTop - 40);

        const numImages = images.length;
        const gridSize = Math.ceil(Math.sqrt(numImages * 4));
        let imgDiameter = (usableWidth - gap * (gridSize + 1)) / gridSize;
        if (numImages === 1) imgDiameter = (imgDiameter * 3) / 4;
        const imgRadius = imgDiameter / 2;

        images.forEach((img, index) => {
          const row = Math.floor(index / gridSize);
          const col = index % gridSize;
          const imagesInRow = Math.min(gridSize, numImages - row * gridSize);
          const rowWidth = imagesInRow * (imgDiameter + gap) - gap;
          const xOffset = (canvasWidth - rowWidth) / 2 - gap;
          const x = col * (imgDiameter + gap) + gap + imgRadius + xOffset;
          const y = row * (imgDiameter + gap) + gap + imgRadius + usableTop;

          context.save();
          context.beginPath();
          context.arc(x, y, imgRadius, 0, Math.PI * 2, true);
          context.closePath();
          context.clip();
          context.drawImage(
            img,
            x - imgRadius,
            y - imgRadius,
            imgDiameter,
            imgDiameter
          );
          context.restore();

          // Add Border Around Image
          context.beginPath();
          context.arc(x, y, imgRadius, 0, Math.PI * 2);
          context.lineWidth = 4;
          context.strokeStyle = "#FFD700";
          context.stroke();

          context.font = "bold 14px Arial";
          context.fillStyle = "#FFFFFF";
          context.textAlign = "center";
          context.fillText(
            list[index].name || "Unknown",
            x,
            y + imgRadius + 20
          );

          context.font = "12px Courier New";
          context.fillStyle = "#FFD700";
          context.fillText(
            list[index].usn || "USN Missing",
            x,
            y + imgRadius + 40
          );

          // context.font = "12px Courier New";
          // context.fillStyle = "#FFD700";
          // context.fillText(
          //   formatPackage(list[index].package, list[index].jobType) || "package Missing",
          //   x,
          //   y + imgRadius + 60
          // );
        });
      } catch (err) {
        console.error("Error creating collage:", err);
      }
    };

    createCollage();
  }, [
    list,
    baseImageUrl,
    companyName,
    jobTitle,
    formatPackage,
    gap,
    overlapAmount,
  ]);

  const handleDownload = () => {
    const canvas = localCanvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${companyName.replace(/\s+/g, "-")}-poster.png`;
      link.click();
    }
  };

  return (
    <div className={`poster-component ${visible ? "visible" : ""}`}>
      <canvas ref={setRef} className="poster-canvas" />
      {visible && (
        <button onClick={handleDownload} className="download-btn">
          Download Poster
        </button>
      )}
    </div>
  );
};

// Navigation Component
const Navigation = () => {
  return (
    <nav className="main-nav">
      <ul>
        <li>
          <Link to="/">Student Form</Link>
        </li>
        <li>
          <Link to="/gen">Generate Posters</Link>
        </li>
      </ul>
    </nav>
  );
};

// Main App Component with React Router
const App = () => {
  return (
    <Router>
      <div className="app-container">
        {/* <Navigation /> */}
        <Routes>
          <Route path="/" element={<StudentForm />} />
          <Route path="/gen" element={<PosterGenerator />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
