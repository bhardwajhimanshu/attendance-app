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

const Attendance = mongoose.model("Attendance", AttendanceSchema);

/* ================= USERS ================= */

const users = [
  { id: "1", username: "himanshu", password: "1234", role: "admin", name: "Himanshu" },
  { id: "2", username: "madhukar", password: "1234", role: "staff", name: "Madhukar Gaur" },
  { id: "3", username: "santosh", password: "1234", role: "staff", name: "Santosh Kumar" },
  { id: "4", username: "munesh", password: "1234", role: "staff", name: "Munesh Singh" },
  { id: "5", username: "kksharma", password: "1234", role: "staff", name: "Dr. K.K Sharma" },
  { id: "6", username: "zoya", password: "1234", role: "staff", name: "Zoya" },
  { id: "7", username: "somvati", password: "1234", role: "staff", name: "Somvati" },
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
    const { staffId, action } = req.body;

    const date = new Date().toISOString().split("T")[0];

    const time = new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    let record = await Attendance.findOne({ staffId, date });

    if (!record) {
      record = new Attendance({
        staffId,
        date,
        checkIn: "",
        checkOut: "",
      });
    }

    if (action === "IN") record.checkIn = time;
    if (action === "OUT") record.checkOut = time;

    await record.save();

    res.send(`Saved ${action} at ${time}`);
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

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("Server running"));
