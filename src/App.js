import React, { useState } from "react";

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

return <Dashboard user={user} />;
}

function Dashboard({ user }) {
  const markAttendance = async (action) => {
    const res = await fetch("https://attendance-app-1p2d.onrender.com/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        staffId: user.id,
        action,
      }),
    });

    const data = await res.text();
    alert(data);
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

      {/* ✅ FIXED BUTTON */}
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

      {/* ✅ FIXED BUTTON */}
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

      {user.role === "admin" && <AdminPanel />}
    </div>
  );
}

function AdminPanel() {
	const [data, setData] = useState([]);

	// ✅ Define here (NOT inside map)
	const staffMap = {
		"1": "Himanshu",
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

	return (
			<div>
			<h3>Admin Panel</h3>
			<button onClick={loadData}>Load Attendance</button>

			<table border="1" style={{ marginTop: "20px" }}>
			<thead>
			<tr>
			<th>Staff Name</th> {/* changed */}
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
		</div>
		);
}

