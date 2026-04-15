import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function App() {
	const [user, setUser] = useState(null);
	const [form, setForm] = useState({ username: "", password: "" });

	const login = async () => {
		const res = await fetch("https://attendance-app-1p2d.onrender.com/login", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(form),
});

if (res.status !== 200) {
	alert("Invalid login");
	return;
}

const data = await res.json();
setUser(data);
};

if (!user) {
	return (
			<div style={{ textAlign: "center", marginTop: "100px" }}>
			<h2>Login</h2>

			<input
			placeholder="Username"
			onChange={(e) =>
			setForm({ ...form, username: e.target.value })
			}
			/>
			<br /><br />

			<input
			type="password"
			placeholder="Password"
			onChange={(e) =>
			setForm({ ...form, password: e.target.value })
			}
			/>
			<br /><br />

			<button onClick={login}>Login</button>
			</div>
			);
}
return <Dashboard user={user} setUser={setUser} />;
}
function Dashboard({ user, setUser }) {
const markAttendance = async (action) => {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const res = await fetch("https://attendance-app-1p2d.onrender.com/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        staffId: user.id,
        action,
        lat,
        lng,
      }),
    });

    const data = await res.text();
    alert(data);
  }, () => {
    alert("Please allow location access");
  });
};

return (
  <div
    style={{
      maxWidth: "400px",
      margin: "auto",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      background: "#f9f9f9",
      textAlign: "center",
    }}
  >
    <h2 style={{ color: "#007bff" }}>
      🏥 Hospital Attendance System
    </h2>

    <h3>Welcome {user.name}</h3>

    <button
      style={{
        background: "#28a745",
        color: "white",
        padding: "10px",
        margin: "5px",
        border: "none",
        borderRadius: "5px",
      }}
      onClick={() => markAttendance("IN")}
    >
      Check In
    </button>

    <button
      style={{
        background: "#dc3545",
        color: "white",
        padding: "10px",
        margin: "5px",
        border: "none",
        borderRadius: "5px",
      }}
      onClick={() => markAttendance("OUT")}
    >
      Check Out
    </button>

    {/* ✅ Logout INSIDE div */}
    <button
      style={{
        background: "#6c757d",
        color: "white",
        padding: "8px",
        marginTop: "10px",
        border: "none",
        borderRadius: "5px",
      }}
      onClick={() => setUser(null)}
    >
      Logout
    </button>

    {user.role === "admin" && <AdminPanel />}
  </div>
);
}
function AdminPanel() {
  const [data, setData] = useState([]);
  const [report, setReport] = useState(null); // ✅ moved inside

  const staffMap = {
    "1": "Himanshu Bhardwaj",
    "2": "Madhukar Gaur",
    "3": "Santosh Kumar",
    "4": "Munesh Singh",
    "5": "Dr. K.K Sharma",
    "6": "Zoya",
    "7": "Somvati",
  };

  const loadData = async () => {
    try {
      const res = await fetch("https://attendance-app-1p2d.onrender.com/admin");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      alert("Error loading data");
    }
  };

  const loadMonthlyReport = async () => {
    const month = prompt("Enter month (01-12)");
    const year = prompt("Enter year (2026)");

    const res = await fetch(
      `https://attendance-app-1p2d.onrender.com/monthly-report?month=${month}&year=${year}`
    );

    const result = await res.json();
    setReport(result);
  };
const downloadExcel = () => {
  if (!report) {
    alert("Load report first");
    return;
  }

  const staffMap = {
    "1": "Himanshu",
    "2": "Madhukar Gaur",
    "3": "Santosh Kumar",
    "4": "Munesh Singh",
    "5": "Dr. K.K Sharma",
    "6": "Zoya",
    "7": "Somvati",
  };

  const excelData = Object.keys(report).map((id) => ({
    Name: staffMap[id] || id,
    Present: report[id].present,
    Absent: report[id].absent,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(file, "Monthly_Attendance_Report.xlsx");
};
return (
  <div>
    <h3>Admin Panel</h3>

    {/* Buttons */}
    <div style={{ marginBottom: "10px" }}>
      <button onClick={loadData}>Load Attendance</button>

      <button onClick={loadMonthlyReport} style={{ marginLeft: "10px" }}>
        Monthly Report
      </button>

      <button onClick={downloadExcel} style={{ marginLeft: "10px" }}>
        Download Excel
      </button>
    </div>

    {/* Attendance Table */}
    <table border="1" style={{ marginTop: "20px" }}>
      <thead>
        <tr>
          <th>Staff Name</th>
          <th>Date</th>
          <th>Check In</th>
          <th>Check Out</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={i}>
            <td>{staffMap[d.staffId] || d.staffId}</td>
            <td>{d.date}</td>
            <td>{d.checkIn}</td>
            <td>{d.checkOut}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* ✅ Monthly Report MUST be INSIDE SAME DIV */}
    {report && (
      <table border="1" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Staff Name</th>
            <th>Present Days</th>
            <th>Absent Days</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(report).map((id) => (
            <tr key={id}>
              <td>{staffMap[id] || id}</td>
              <td>{report[id].present}</td>
              <td>{report[id].absent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);
}
