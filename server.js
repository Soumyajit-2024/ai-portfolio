// ==========================================
// Portfolio Backend Server (Contact Form)
// ==========================================
// Run using: node server.js

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

// Enable CORS (allow frontend to connect)
app.use(cors());

// Parse JSON data from frontend
app.use(express.json());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// ==========================================
// TEST ROUTE (check server working)
// ==========================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Portfolio backend running successfully"
    });

});

// ==========================================
// CONTACT FORM ROUTE
// ==========================================

app.post("/contact", (req, res) => {

    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {

        console.log("Missing form data");

        return res.status(400).json({
            success: false,
            error: "Please fill all fields"
        });

    }

    // Log message in terminal
    console.log("=================================");
    console.log("NEW CONTACT MESSAGE RECEIVED");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Message:", message);
    console.log("=================================");

    // Send success response
    res.json({
        success: true,
        message: "Message sent successfully"
    });

});

// ==========================================
// HANDLE UNKNOWN ROUTES
// ==========================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        error: "Route not found"
    });

});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log("=================================");
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Waiting for contact form messages...");
    console.log("=================================");

});
