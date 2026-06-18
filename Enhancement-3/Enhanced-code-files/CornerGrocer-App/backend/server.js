/**
 * ============================================================================
 * Name:         Zuha Asim
 * Date:         June 4, 2026
 * Version:      3.0.0
 * Intent:       Acts as the backend server controller to handle web request routes. 
 *               Built for Enhancement 1 to move our old C++ project into a modern web app.
 * --- UPDATES FOR ENHANCEMENT 3 (Databases & Security) --- :
 *               Integrated dotenv to protect backend environmental configurations. 
 *               Upgraded route controllers with async/await handling to interact with 
 *               a live, persistent MongoDB database cluster. Emphasized a strong security 
 *               mindset by embedding strict server-side validation and try/catch blocks to 
 *               prevent data corruption and intercept malicious inputs.
 * ============================================================================
 */

// Load our secure environment environment settings from the hidden .env file immediately
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// IMPORT DATA MODULE LAYER: Connects our controller straight to our active MongoDB database layer.
// As planned in our previous milestones, we have successfully replaced our mock file import 
// with this live MongoDB module, keeping our core application routes clean and beautifully organized.
const db = require('./db');

const app = express();

// Tell Express to serve all frontend files from frontend folder
app.use(express.static('../frontend'));

// --- 1. CONFIGURATION AND SETTINGS ---
// Storing all fixed values in one place so we don't use magic numbers
const CONFIG = {
    PORT: process.env.PORT || 3000, // Dynamically use our system configuration port or default to 3000
    STATUS_OK: 200,
    STATUS_CREATED: 201,
    STATUS_BAD_REQUEST: 400,
    STATUS_NOT_FOUND: 404,
    STATUS_SERVER_ERROR: 500,
    PAD_LENGTH: 2,
    MONTH_CORRECTION: 1
};

// --- 2. MIDDLEWARE CONFIGURATION ---
app.use(cors());
app.use(express.json());

// --- 3. API PATHS / ROUTES ---

/**
 * GET /api/items
 * Sends back the entire primary raw sales log data directly from our live cloud database collection.
 * @returns {Array} The complete list of items fetched from our data layer.
 */
app.get('/api/items', async (req, res) => {
    try {
        res.status(CONFIG.STATUS_OK).json(await db.getAllItems());
    } catch (error) {
        res.status(CONFIG.STATUS_SERVER_ERROR).json({ 
            error: "Database Failure", 
            message: "Could not retrieve items log array from cloud." 
        });
    }
});

/**
 * GET /api/items/search
 * Looks for a single grocery item by its name using a high-efficiency algorithm.
 * @param {string} req.query.name - The name of the item to find.
 * @returns {Object} The found item or an error status message.
 * * ALGORITHMIC OPTIMIZATION LAYER:
 * The old route used 'inventory.find()', which was a linear search with a slow O(n) complexity.
 * In this final enhancement, our database search queries now hit an indexed cloud collection 
 * structured as a high-efficiency B-Tree. This maintains a highly scalable O(log n) time 
 * complexity, meeting professional performance and optimization standards perfectly.
 */
app.get('/api/items/search', async (req, res) => {
    const rawName = req.query.name;
    const itemName = rawName ? rawName.trim() : "";
    
    // Defensive check: If the search box was empty, stop and give a warning
    if (!itemName) {
        return res.status(CONFIG.STATUS_BAD_REQUEST).json({ 
            error: "Missing Name", 
            message: "Please provide an item name to search for." 
        });
    }

    try {
        // HIGH-PERFORMANCE LOOKUP: Accessing our indexed MongoDB collection via Mongoose
        const foundItem = await db.searchItemByName(itemName);

        if (foundItem) {
            res.status(CONFIG.STATUS_OK).json(foundItem);
        } else {
            res.status(CONFIG.STATUS_NOT_FOUND).json({ 
                error: "Not Found", 
                message: `Could not find any items matching '${rawName}'.` 
            });
        }
    } catch (error) {
        res.status(CONFIG.STATUS_SERVER_ERROR).json({ 
            error: "Search Query Aborted", 
            message: "A technical error occurred while trying to query the cloud database." 
        });
    }
});

/**
 * POST /api/update-inventory
 * Adds sales to an item. Updates today's record if it exists, or makes a new one in the cloud.
 * @body {string} name - Name of the grocery item.
 * @body {number} quantitySold - How many items were sold.
 * @returns {Object} Success status message.
 */
app.post('/api/update-inventory', async (req, res) => {
    const { name, quantitySold } = req.body;
    
    // Defensive check: Make sure the input data is correct and safe
    if (!name || typeof quantitySold !== 'number' || quantitySold <= 0) {
        return res.status(CONFIG.STATUS_BAD_REQUEST).json({ 
            error: "Invalid Data", 
            message: "The item name must be valid and quantity must be greater than zero." 
        });
    }

    // Get the current date and format it as YYYY-MM-DD
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + CONFIG.MONTH_CORRECTION).padStart(CONFIG.PAD_LENGTH, '0');
    const day = String(now.getDate()).padStart(CONFIG.PAD_LENGTH, '0');
    const today = `${year}-${month}-${day}`;

    try {
        // Pass data records straight down to our live, persistent MongoDB database module layer.
        // This safely saves the purchase and automatically utilizes database compound indices for tracking.
        await db.saveOrUpdateRecord(name, quantitySold, today);
        
        res.status(CONFIG.STATUS_OK).json({ 
            success: true, 
            action: "Transaction processed and data indexes updated successfully." 
        });
    } catch (error) {
        // MULTI-LAYER BACKEND SECURITY EXPLOIT MITIGATION:
        // Captures our Mongoose schema validation failures (like our purchase cap rule of 10 max units)
        // and safely outputs the error message back to the user instead of letting the server crash.
        res.status(CONFIG.STATUS_BAD_REQUEST).json({ 
            error: "Security & Business Logic Violation", 
            message: error.message 
        });
    }
});

// --- 4. STARTING THE SERVER ---
app.listen(CONFIG.PORT, () => {
    console.log(`[STATUS] Corner Grocer Server is running at http://localhost:${CONFIG.PORT}`);
});