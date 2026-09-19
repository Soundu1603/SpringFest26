import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const EVENT_FEES = {
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

const getEventFee = (eventName) => EVENT_FEES[eventName] ?? "-";

function Admin() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [foodFilter, setFoodFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filteredRegistrations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return registrations.filter((registration) => {
      const matchesEvent =
        eventFilter === "all" || registration.event === eventFilter;

      const matchesCollege =
  collegeFilter === "all" ||
  registration.college?.trim().toLowerCase() ===
    collegeFilter.trim().toLowerCase();

const matchesDepartment =
  departmentFilter === "all" ||
  registration.department?.trim().toLowerCase() ===
    departmentFilter.trim().toLowerCase();

      const matchesFood =
        foodFilter === "all" ||
        registration.foodPreference === foodFilter;

      const searchableText =
        `${registration.fullName || ""} ${registration.email || ""} ${registration.phone || ""}`.toLowerCase();
      const matchesSearch = !query || searchableText.includes(query);

      return (
        matchesEvent &&
        matchesCollege &&
        matchesDepartment &&
        matchesFood &&
        matchesSearch
      );
    });
  }, [registrations, searchTerm, eventFilter, collegeFilter, departmentFilter, foodFilter]);

  const exportToCSV = () => {
    if (!filteredRegistrations.length) return;

    const headers = [
      "ID",
      "Event",
      "Full Name",
      "Email",
      "Phone",
      "College",
      "Department",
      "Year",
      "Food Preference",
      "Amount Paid",
      "Paper Domain",
      "Paper Title",
      "Paper Team Size",
      "Transaction ID",
      "Payment File Name",
      "Submitted At",
    ];

    const escapeCSVValue = (value) => {
      const safeValue =
        value === null || value === undefined ? "" : String(value);
      return `"${safeValue.replace(/"/g, '""')}"`;
    };

    const rows = filteredRegistrations.map((registration) =>
      [
        registration.id,
        registration.event,
        registration.fullName,
        registration.email,
        registration.phone,
        registration.college,
        registration.department,
        registration.year,
        registration.foodPreference,
        getEventFee(registration.event),
        registration.paperDomain,
        registration.paperTitle,
        registration.paperTeamSize,
        registration.transactionId,
        registration.paymentFileName,
        registration.timestamp,
      ]
        .map(escapeCSVValue)
        .join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `technova26-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const deleteRegistration = async (id) => {
    const confirmed = window.confirm("Delete this registration record?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to delete registration.");
      }

      setRegistrations((currentRegistrations) =>
        currentRegistrations.filter((registration) => registration.id !== id)
      );
    } catch (err) {
      setError(err.message || "Failed to delete registration.");
    }
  };

  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        const response = await fetch("/api/registrations", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load registrations");
        }

        const data = await response.json();
        setRegistrations(data);
      } catch (err) {
        setError(err.message || "Unable to load registrations.");
      } finally {
        setLoading(false);
      }
    };

    loadRegistrations();
  }, []);

  const uniqueEvents = [
    "all",
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
    ...new Set(registrations.map((item) => item.event).filter(Boolean)),
  ].filter((event, index, array) => array.indexOf(event) === index);

  const uniqueColleges = [
  "all",
  ...Array.from(
    new Map(
      registrations
        .filter((item) => item.college)
        .map((item) => [
          item.college.trim().toLowerCase(),
          item.college.trim(),
        ])
    ).values()
  ),
].filter((college, index, array) => array.indexOf(college) === index);

  const uniqueDepartments = [
  "all",
  ...Array.from(
    new Map(
      registrations
        .filter((item) => item.department)
        .map((item) => [
          item.department.trim().toLowerCase(),
          item.department.trim(),
        ])
    ).values()
  ),
].filter((department, index, array) => array.indexOf(department) === index);

  const foodPreferences = ["all", "Veg", "Non-Veg"];

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
    } finally {
      navigate("/admin-login", { replace: true });
    }
  };

  return (
    <div className="admin-page" style={{ position: "relative" }}>
    

      <style>{`
        .column-filter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          width: 100%;
          white-space: nowrap;
        }

        .column-filter select {
          width: 22px;
          min-width: 22px;
          height: 22px;
          padding: 0 2px;
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 5px;
          background: rgba(255,255,255,0.12);
          color: #FFFFFF;
          cursor: pointer;
          outline: none;
        }

        .column-filter select option {
          color: #2B1738;
          background: #FFFFFF;
        }
      `}</style>


      <div className="admin-header">
        <p className="admin-tag">Admin Panel</p>
        <h1>Registration Records</h1>
        <div className="admin-header-actions">
          <button
            className="coordinator-nav-btn"
            onClick={() => navigate("/coordinator")}
          >
            QR Check-in
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-status">Loading registrations...</div>
      ) : (
        <>
          {error && <div className="admin-status error">{error}</div>}

          <div className="combined-admin-controls">

  {/* Top row */}
  <div className="admin-controls-top">

  <div className="admin-search-box">
    <label htmlFor="registration-search">SEARCH</label>

    <input
      id="registration-search"
      type="text"
      placeholder="Name, email, phone"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
        </div>

<div className="admin-controls-bottom">

  <strong>
    {filteredRegistrations.length} records shown
  </strong>

  <button
    type="button"
    className="export-btn"
    onClick={exportToCSV}
  >
    Export Excel Sheet
  </button>

</div>

        </div>

          {filteredRegistrations.length === 0 ? (
            <div className="admin-status">
              No registrations match your current filters.
            </div>
          ) : (
            <div
              className="admin-table-wrap"
              style={{ maxWidth: "none", width: "100%", overflowX: "auto" }}
            >
              <table className="admin-table" style={{ minWidth: "1500px" }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>
                      <div className="column-filter">
                        <span>EVENT</span>
                        <select
                          value={eventFilter}
                          onChange={(e) => setEventFilter(e.target.value)}
                          title="Filter by event"
                          aria-label="Filter by event"
                        >
                          {uniqueEvents.map((event) => (
                            <option key={event} value={event}>
                              {event === "all" ? "All Events" : event}
                            </option>
                          ))}
                        </select>
                      </div>
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>
                      <div className="column-filter">
                        <span>COLLEGE</span>
                        <select
                          value={collegeFilter}
                          onChange={(e) => setCollegeFilter(e.target.value)}
                          title="Filter by college"
                          aria-label="Filter by college"
                        >
                          {uniqueColleges.map((college) => (
                            <option key={college} value={college}>
                              {college === "all" ? "All Colleges" : college}
                            </option>
                          ))}
                        </select>
                      </div>
                    </th>
                    <th>
                      <div className="column-filter">
                        <span>DEPARTMENT</span>
                        <select
                          value={departmentFilter}
                          onChange={(e) => setDepartmentFilter(e.target.value)}
                          title="Filter by department"
                          aria-label="Filter by department"
                        >
                          {uniqueDepartments.map((department) => (
                            <option key={department} value={department}>
                              {department === "all"
                                ? "All Departments"
                                : department}
                            </option>
                          ))}
                        </select>
                      </div>
                    </th>
                    <th>Year</th>
                    <th>
                      <div className="column-filter">
                        <span>FOOD</span>
                        <select
                          value={foodFilter}
                          onChange={(e) => setFoodFilter(e.target.value)}
                          title="Filter by food preference"
                          aria-label="Filter by food preference"
                        >
                          {foodPreferences.map((food) => (
                            <option key={food} value={food}>
                              {food === "all" ? "All Food" : food}
                            </option>
                          ))}
                        </select>
                      </div>
                    </th>
                    <th>Amount Paid</th>
                    <th>Transaction ID</th>
                    <th>Payment Screenshot</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.id}</td>
                      <td>{entry.event}</td>
                      <td>{entry.fullName}</td>
                      <td>{entry.email}</td>
                      <td>{entry.phone}</td>
                      <td>{entry.college}</td>
                      <td>{entry.department}</td>
                      <td>{entry.year}</td>
                      <td>{entry.foodPreference || "-"}</td>
                      <td>
                        {getEventFee(entry.event) === "-"
                          ? "-"
                          : `₹${getEventFee(entry.event)}`}
                      </td>
                      <td>{entry.transactionId || "-"}</td>
                      <td>{entry.paymentFileName || "-"}</td>
                      <td>
                        {entry.timestamp
                          ? new Date(entry.timestamp).toLocaleString()
                          : "-"}
                      </td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => deleteRegistration(entry.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Admin;
