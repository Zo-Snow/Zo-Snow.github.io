/**
 * ============================================================================
 * Name:         Zuha Asim
 * Date:         May 28, 2026
 * Version:      1.0.0
 * Intent:       Acts as our temporary mock database module. Separating this file 
 *               ensures 'Separation of Concerns' so we can easily swap this out 
 *               for a live MongoDB connection file in Enhancement 3.
 * ============================================================================
 */

// Mock Database Array (Will be updated to an actual database in Enhancement 3 - Databases)
// This holds our grocery items, matching the original data from the C++ project.
//
// FUTURE ROADMAP (Enhancement 3): This entire hardcoded volatile array will be removed. 
// It will be replaced by a live MongoDB database collection using Mongoose schemas.
// Data will persist, meaning simulation sales won't disappear when the server restarts.
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

// High-speed key-value dictionary that acts as our database search lookup index
let inventoryLookupMap = {};

/**
 * Algorithmic pass: O(n) DATA MAPPING ENGINE
 * Loops through the raw data array exactly once to map aggregates into the Hash Map.
 *
 * FUTURE ROADMAP (Enhancement 3): In the next enhancement, we won't need to manually compute 
 * aggregates in server memory using this local loop function. Instead, we will offload this 
 * data preparation directly to MongoDB's built-in aggregation query framework to pull clean, 
 * pre-sorted totals effortlessly.
 */
function rebuildSearchIndex() {
    inventoryLookupMap = {}; // Reset index map

    inventory.forEach(item => {
        const key = item.name.toLowerCase();
        if (inventoryLookupMap[key]) {
            inventoryLookupMap[key].quantity += item.quantity;
        } else {
            inventoryLookupMap[key] = {
                name: item.name,
                quantity: item.quantity,
                date: item.date
            };
        }
    });
    console.log("[MOCK DB] Lookup dictionary index updated using O(n) data-mapping.");
}

// Generate the very first index pass when the server loads up this file
rebuildSearchIndex();

// Clean database operational exports to share data with server.js safely
module.exports = {
    
    // Read operations
    // FUTURE ROADMAP (Enhancement 3): This will be swapped out for a standard 
    // database query that reads records from our persistent MongoDB collection.
    getAllItems: () => inventory,
    
    // Optimized search operation: Achieves true O(1) retrieval speeds
    //
    // FUTURE ROADMAP (Enhancement 3): Right now, our in-memory dictionary provides a 
    // brilliant O(1) lookup speed. When we transition to MongoDB, we will establish an index 
    // on the 'name' field. MongoDB uses a B-Tree structure to index entries on disk, 
    // which will shift our database search operations to a highly efficient O(log n) 
    // time complexity, perfectly satisfying industry standards for large datasets.
    searchItemByName: (name) => {
        const searchKey = name.trim().toLowerCase();
        return inventoryLookupMap[searchKey] || null;
    },

    // Write operation: Updates matching arrays and re-maps the index for integrity
    //
    // FUTURE ROADMAP (Enhancement 3): Instead of running manual local array manipulation, 
    // this will be upgraded to a secure database update statement that modifies the persistent 
    // item totals directly, ensuring no sales data is ever lost if the server restarts.
    saveOrUpdateRecord: (name, quantitySold, todayDate) => {
        const targetRecord = inventory.find(item => 
            item.name.toLowerCase() === name.toLowerCase() && item.date === todayDate
        );

        if (targetRecord) {
            targetRecord.quantity += quantitySold;
        } else {
            inventory.push({ name, quantity: quantitySold, date: todayDate });
        }

        // Keep index accurate immediately after a state alteration
        rebuildSearchIndex();
    }
};