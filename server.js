const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// MYSQL CONNECTION
// ===============================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Prince@12345",
    database: "smartprocure"
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:");
        console.error(err.message);
        return;
    }

    console.log("MySQL connected successfully!");
});

// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {
    res.send("SmartProcure Backend is Running!");
});

// ===============================
// FARMER REGISTRATION
// ===============================

app.post("/api/register", (req, res) => {

    console.log("========== REGISTER START ==========");

    const {
        name,
        farmerId,
        mobile,
        email,
        state,
        district,
        village,
        password
    } = req.body;
    console.log("Registration data received:");
    console.log(req.body);


    if (!name || !mobile || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, mobile and password are required."
        });
    }

    const sql = `
        INSERT INTO farmers
        (name, farmer_id, mobile, email, state, district, village, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        name,
        farmerId || null,
        mobile,
        email || null,
        state || null,
        district || null,
        village || null,
        password
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error("Database error:");
            console.error(err.message);

            return res.status(500).json({
                success: false,
                message: "Failed to register farmer."
            });
        }

        console.log("Farmer saved in MySQL!");
        console.log("Farmer database ID:", result.insertId);
        console.log("========== REGISTER END ==========");

        res.status(201).json({
            success: true,
            message: "Farmer registered successfully!",
            farmerId: result.insertId
        });
    });
});

// ===============================
// FARMER LOGIN
// ===============================

app.post("/api/login", (req, res) => {

    console.log("========== LOGIN START ==========");

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email/mobile and password are required."
        });
    }

    const sql = `
        SELECT *
        FROM farmers
        WHERE email = ? OR mobile = ?
        LIMIT 1
    `;

    db.query(sql, [email, email], (err, results) => {

        if (err) {
            console.error("Database error:");
            console.error(err.message);

            return res.status(500).json({
                success: false,
                message: "Login failed due to server error."
            });
        }

        if (results.length === 0) {
            console.log("Farmer not found.");

            return res.status(401).json({
                success: false,
                message: "No account found with this email/mobile."
            });
        }

        const farmer = results[0];

        if (farmer.password !== password) {
            console.log("Incorrect password.");

            return res.status(401).json({
                success: false,
                message: "Incorrect password."
            });
        }

        console.log("Farmer logged in:", farmer.name);
        console.log("========== LOGIN END ==========");

        res.status(200).json({
            success: true,
            message: "Login successful!",
            role: "farmer",
            id: farmer.id,
            name: farmer.name,
            email: farmer.email,
            mobile: farmer.mobile,
            token: "temp-token-" + farmer.id
        });
    });
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, "127.0.0.1", () => {
    console.log("=================================");
    console.log("SmartProcure Backend Started");
    console.log(`Server: http://localhost:${PORT}`);
    console.log("=================================");
});