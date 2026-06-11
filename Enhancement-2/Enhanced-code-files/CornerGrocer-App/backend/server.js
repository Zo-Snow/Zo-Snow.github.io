/**
 * ============================================================================
 * Name:         Zuha Asim
 * Date:         May 28, 2026
 * Version:      2.0.0
 * Intent:       Acts as the backend server controller to handle web request routes. 
 *               Built for Enhancement 1 to move our old C++ project into a modern web app.
 * --- UPDATES FOR ENHANCEMENT 2 (Algorithms & Data Structures) --- :
 *               Extracted raw dataset storage to an isolated data module ('dbMock.js') 
 *               to preserve architectural integrity. Re-routed search queries to 
 *               take advantage of the data module's high-speed O(1) constant-time 
 *               lookup map instead of the old slow O(n) linear array scan.
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');

// IMPORT DATA MODULE LAYER: Connects our controller to the mock database module.
// In the next enhancement milestone, we will simply replace this file import line 
// with a live MongoDB configuration file, leaving our server paths completely untouched.
const db = require('./dbMock');

const app = express();

// --- 1. CONFIGURATION AND SETTINGS ---
// Storing all fixed values in one place so we don't use magic numbers
const CONFIG = {
    PORT: 3000,
    STATUS_OK: 200,
    STATUS_CREATED: 201,
    STATUS_BAD_REQUEST: 400,
    STATUS_NOT_FOUND: 404,
    PAD_LENGTH: 2,
    MONTH_CORRECTION: 1
};

// --- 2. MIDDLEWARE CONFIGURATION ---
app.use(cors());
app.use(express.json());

// --- 3. API PATHS / ROUTES ---

/**
 * GET /api/items
 * Sends back the entire primary raw sales log data array.
 * @returns {Array} The complete list of items fetched from our data layer.
 */
app.get('/api/items', (req, res) => {
    res.status(CONFIG.STATUS_OK).json(db.getAllItems());
});

/**
 * GET /api/items/search
 * Looks for a single grocery item by its name using a high-efficiency algorithm.
 * @param {string} req.query.name - The name of the item to find.
 * @returns {Object} The found item or an error status message.
 * * ALGORITHMIC OPTIMIZATION LAYER:
 * The old route used 'inventory.find()', which was a linear search with a slow O(n) complexity.
 * By pulling directly from our pre-compiled database lookup map, the backend delivers 
 * a true O(1) constant-time data lookup. It responds instantly without the manual overhead 
 * of re-scanning the entire dataset!
 */
app.get('/api/items/search', (req, res) => {
    const rawName = req.query.name;
    const itemName = rawName ? rawName.trim() : "";
    
    // Defensive check: If the search box was empty, stop and give a warning
    if (!itemName) {
        return res.status(CONFIG.STATUS_BAD_REQUEST).json({ 
            error: "Missing Name", 
            message: "Please provide an item name to search for." 
        });
    }

    // HIGH-PERFORMANCE LOOKUP: Accessing a Hash Map key directly takes O(1) time
    const foundItem = db.searchItemByName(itemName);

    if (foundItem) {
        res.status(CONFIG.STATUS_OK).json(foundItem);
    } else {
        res.status(CONFIG.STATUS_NOT_FOUND).json({ 
            error: "Not Found", 
            message: `Could not find any items matching '${rawName}'.` 
        });
    }
});

/**
 * POST /api/update-inventory
 * Adds sales to an item. Updates today's record if it exists, or makes a new one.
 * @body {string} name - Name of the grocery item.
 * @body {number} quantitySold - How many items were sold.
 * @returns {Object} Success status message.
 */
app.post('/api/update-inventory', (req, res) => {
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

    // Pass data records straight down to the processing database module layer.
    // This safely saves the purchase and automatically forces our O(1) lookup dictionary index map to refresh.
    db.saveOrUpdateRecord(name, quantitySold, today);
    
    res.status(CONFIG.STATUS_OK).json({ 
        success: true, 
        action: "Transaction processed and data indexes updated successfully." 
    });
});

// --- 4. STARTING THE SERVER ---
app.listen(CONFIG.PORT, () => {
    console.log(`[STATUS] Corner Grocer Server is running at http://localhost:${CONFIG.PORT}`);
});