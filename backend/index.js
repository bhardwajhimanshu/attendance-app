const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= DB CONNECTION ================= */

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const AttendanceSchema = new mongoose.Schema({
  staffId: String,
  date: String,
  checkIn: String,
  checkOut: String,
});
AttendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });
const Attendance = mongoose.model("Attendance", AttendanceSchema);

/* ================= USERS ================= */

const users = [
  { id: "1", username: "himanshu", password: "1234", role: "admin", name: "Himanshu Bhardwaj" },
  { id: "2", username: "madhukar", password: "1234", role: "staff", name: "Madhukar Gaur" },
  { id: "3", username: "santosh", password: "1234", role: "staff", name: "Santosh Kumar" },
  { id: "4", username: "munesh", password: "1234", role: "staff", name: "Munesh Singh" },
  { id: "5", username: "kksharma", password: "1234", role: "staff", name: "Dr. K.K Sharma" },
  { id: "6", username: "zoya", password: "1234", role: "staff", name: "Zoya" },
  { id: "7", username: "somvati", password: "1234", role: "staff", name: "Somvati" },
  { id: "8", username: "pooja", password: "1234", role: "staff", name: "Pooja" },
];

/* ================= ROUTES ================= */

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) return res.status(401).send("Invalid credentials");

  res.json(user);
});

app.post("/attendance", async (req, res) => {
  try {
    const { staffId, action, lat, lng } = req.body;

    // 🏥 Hospital Location
    const officeLat = 28.2070;
    const officeLng = 77.8123;

    // 📏 Distance formula
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;

      const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI/180) *
        Math.cos(lat2 * Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const distance = getDistance(lat, lng, officeLat, officeLng);

    // 🚫 Block if outside 0.1 km (100 meters)
    if (distance > 0.1) {
      return res.send("❌ You are outside hospital location");
    }

    // ✅ Continue attendance logic
    const date = new Date().toISOString().split("T")[0];

    const time = new Date().toLocaleTimeString("en-IN", {
timeZone: "Asia/Kolkata",
hour: "2-digit",
minute: "2-digit",
hour12: true,
});

// 🔥 Prepare update
const update =
action === "IN"
? { checkIn: time }
: { checkOut: time };

// 🔥 Atomic update (NO duplicates possible)
await Attendance.findOneAndUpdate(
		{ staffId, date },
		{ $set: update },
		{ upsert: true, new: true }
		);

res.send(`✅ ${action} marked at ${time}`);
} catch (err) {
	console.error(err);
	res.status(500).send("Error saving attendance");
}
});
app.get("/admin", async (req, res) => {
		try {
		const data = await Attendance.find();
		res.json(data);
		} catch (err) {
		console.error(err);
		res.status(500).send("Error fetching attendance");
		}
		});
app.get("/monthly-report", async (req, res) => {
		try {
		const { month, year } = req.query;

		const totalDays = new Date(year, month, 0).getDate();

		const data = await Attendance.find({
date: { $regex: `${year}-${month}` } // filter month
});

		const report = {};

		data.forEach((entry) => {
			if (!report[entry.staffId]) {
			report[entry.staffId] = {
present: 0,
};
}

if (entry.checkIn) {
report[entry.staffId].present += 1;
}
});

// Add absent calculation
Object.keys(report).forEach((staffId) => {
		report[staffId].absent = totalDays - report[staffId].present;
		});

res.json(report);

} catch (err) {
	console.error(err);
	res.status(500).send("Error generating report");
}
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("Server running"));
