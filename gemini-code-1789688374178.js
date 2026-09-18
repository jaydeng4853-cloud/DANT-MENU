const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// In-memory database simulation (Use MongoDB, PostgreSQL, etc., in production)
const tokenDatabase = new Map();

// Endpoint to generate a new token (Admin use)
app.post('/api/generate-token', (req, res) => {
    const { daysValid = 30, note = '' } = req.body;
    
    // Generate a secure random token prefixed with "DANTE-"
    const token = 'DANTE-' + crypto.randomBytes(16).toString('hex').toUpperCase();
    const expiresAt = Date.now() + (daysValid * 24 * 60 * 60 * 1000);

    tokenDatabase.set(token, {
        expiresAt,
        active: true,
        note
    });

    res.json({ success: true, token, expiresAt });
});

// Endpoint for the mod menu client to verify the token on startup
app.post('/api/verify-token', (req, res) => {
    const { token } = req.body;

    if (!tokenDatabase.has(token)) {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    const tokenData = tokenDatabase.get(token);

    if (!tokenData.active) {
        return res.status(403).json({ success: false, message: 'Token has been deactivated.' });
    }

    if (Date.now() > tokenData.expiresAt) {
        return res.status(403).json({ success: false, message: 'Token has expired.' });
    }

    res.json({ success: true, message: 'Token verified successfully. Welcome to DANTÈ MENU.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`DANTÈ MENU Token Auth Server running on port ${PORT}`);
});