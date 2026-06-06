/**
 * ============================================================================
 * Name:         Zuha Asim
 * Date:         May 20, 2026
 * Version:      1.0.0
 * Intent:       Acts as the backend server to handle grocery data requests. Built for 
 *               Enhancement 1 to move our old C++ project into a modern web app. 
 *               It handles fetching data, filters items safely, saves daily sales logs, 
 *               and responds with clear status checks like 400 for bad input data or 
 *               404 for missing items.
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');

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

// --- 3. IN-MEMORY INVENTORY DATA ---
/**
 * Mock Database Array (Will be updated to an actual database in Enhancement 3 - Databases)
 * This holds our grocery items, matching the original data from the C++ project.
 */
let inventory = [
    { name: "Apples", quantity: 4, date: "2026-05-15" },
    { name: "Beets", quantity: 3, date: "2026-05-15" },
    { name: "Broccoli", quantity: 7, date: "2026-05-15" },
    { name: "Cantaloupe", quantity: 2, date: "2026-05-15" },
    { name: "Cauliflower", quantity: 6, date: "2026-05-15" },
    { name: "Celery", quantity: 6, date: "2026-05-15" },
    { name: "Cranberries", quantity: 10, date: "2026-05-15" },
    { name: "Cucumbers", quantity: 9, date: "2026-05-15" },
    { name: "Garlic", quantity: 8, date: "2026-05-15" },
    { name: "Limes", quantity: 1, date: "2026-05-15" },
    { name: "Onions", quantity: 4, date: "2026-05-15" },
    { name: "Peaches", quantity: 5, date: "2026-05-15" },
    { name: "Pears", quantity: 1, date: "2026-05-15" },
    { name: "Peas", quantity: 8, date: "2026-05-15" },
    { name: "Potatoes", quantity: 5, date: "2026-05-15" },
    { name: "Pumpkins", quantity: 2, date: "2026-05-15" },
    { name: "Radishes", quantity: 3, date: "2026-05-15" },
    { name: "Spinach", quantity: 5, date: "2026-05-15" },
    { name: "Yams", quantity: 5, date: "2026-05-15" },
    { name: "Zucchini", quantity: 10, date: "2026-05-15" },
];

// --- 4. API PATHS / ROUTES ---

/**
 * GET /api/items
 * Sends back the entire inventory list.
 * @returns {Array} The complete list of items.
 */
app.get('/api/items', (req, res) => {
    res.status(CONFIG.STATUS_OK).json(inventory);
});

/**
 * GET /api/items/search
 * Looks for a single grocery item by its name.
 * @param {string} req.query.name - The name of the item to find.
 * @returns {Object} The found item or an error message.
 */
app.get('/api/items/search', (req, res) => {
    const rawName = req.query.name;
    const itemName = rawName ? rawName.trim().toLowerCase() : "";
    
    // Defensive check: If the search box was empty, stop and give a warning
    if (!itemName) {
        return res.status(CONFIG.STATUS_BAD_REQUEST).json({ 
            error: "Missing Name", 
            message: "Please provide an item name to search for." 
        });
    }

    // Look for the item using lowercase letters to avoid matching mistakes
    const foundItem = inventory.find(item => item.name.toLowerCase() === itemName);

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
 * @returns {Object} Success message.
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

    // Look for an entry that matches both the name and today's date
    const targetRecord = inventory.find(item => 
        item.name.toLowerCase() === name.toLowerCase() && item.date === today
    );

    if (targetRecord) {
        // If it already exists for today, add the new sales to the total quantity
        targetRecord.quantity += quantitySold;
        res.status(CONFIG.STATUS_OK).json({ 
            success: true, 
            action: "Updated existing item quantity for today." 
        });
    } else {
        // If it doesn't exist yet for today, create a brand new item row
        const freshRecordEntry = {
            name: name,
            quantity: quantitySold,
            date: today
        };
        inventory.push(freshRecordEntry);
        res.status(CONFIG.STATUS_CREATED).json({ 
            success: true, 
            action: "Created a new item record for today." 
        });
    }
});

// --- 5. STARTING THE SERVER ---
app.listen(CONFIG.PORT, () => {
    console.log(`[STATUS] Corner Grocer Server is running at http://localhost:${CONFIG.PORT}`);
});