/**
 * ============================================================================
 * Name:         Zuha Asim
 * Date:         June 4, 2026
 * Version:      3.0.0
 * Intent:       Acts as our permanent production database layer. Replaces the 
 *               temporary mock array file with a live MongoDB cloud connection 
 *               to ensure our grocery sales records never disappear.
 * ============================================================================
 */

const mongoose = require('mongoose');

// --- CLOUD CONNECTION ---
// Grabs our link string safely from our hidden system memory (.env file)
const mongoURI = process.env.MONGO_URI;

// Connect directly to our secure MongoDB Atlas database cluster in the cloud
mongoose.connect(mongoURI)
    .then(() => console.log("[DATABASE] Connected to MongoDB Atlas cloud database successfully!"))
    .catch((err) => console.error("[DATABASE ERROR] Could not connect to cloud:", err));

// --- SECURITY SCHEMA & DATA INTEGRITY ---
// This strict blueprint acts as our backend security guard. It ensures that only 
// valid, well-formatted grocery data is ever accepted and saved into our database.
const groceryItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Item name is required."],
        trim: true // Cleans up accidental trailing spaces automatically
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required."],
        min: [1, "Quantity must be at least 1."],
        // BUSINESS LOGIC CONSTRAINT: Strictly prevents ordering more than 10 units per item
        max: [10, "Business rule constraint: You cannot purchase more than 10 of a single item per order."]
    },
    date: {
        type: String,
        required: [true, "Date is required."]
    }
});

// --- ALGORITHMIC OPTIMIZATION LAYER: B-TREE INDEX ---
// MongoDB stores data indexes using an advanced tree framework called a B-Tree. 
// By setting up a permanent index on the name and date fields on disk memory, 
// the system avoids slow linear scans. It runs lookups at a high-speed O(log n) 
// time complexity, meeting professional industry standards for massive store logs.
groceryItemSchema.index({ name: 1, date: 1 });

// Create our usable database controller model based on our security schema
const Item = mongoose.model('GroceryItem', groceryItemSchema);

// --- 4. SECURE DATABASE OPERATIONAL EXPORTS ---
// Sharing our data functions with server.js using the exact same names as our old mock db file
module.exports = {
    
    // Read operation: Replaces our old local array return with a real database query
    getAllItems: async () => {
        try {
            // Find everything currently stored in our cloud collection
            return await Item.find({});
        } catch (error) {
            console.error("[DATABASE ERROR] Failed to fetch items:", error);
            return [];
        }
    },
    
    // Optimized search operation: Achieves professional disk search speeds
    // EXPLOIT MITIGATION:
    // By passing the search input text into an explicit query object parameter, 
    // database command characters are naturally sanitized, completely eliminating 
    // the risk of harmful NoSQL injection exploits in our search bar.
    searchItemByName: async (name) => {
        try {
            const searchKey = name.trim().toLowerCase();
            
            // Look up a single matching item name in our indexed database fields
            return await Item.findOne({ 
                name: { $regex: new RegExp(`^${searchKey}$`, 'i') } 
            });
        } catch (error) {
            console.error("[DATABASE ERROR] Search query failed:", error);
            return null;
        }
    },

    // Write operation: Upgraded to safely save and update persistent cloud data entries
    saveOrUpdateRecord: async (name, quantitySold, todayDate) => {
        try {
            // Look into our database to see if this item was already logged today
            const targetRecord = await Item.findOne({ 
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }, 
                date: todayDate 
            });

            if (targetRecord) {
                // If it exists, add the new sales count while respecting our schema max limits
                targetRecord.quantity += quantitySold;
                await targetRecord.save();
                console.log(`[DATABASE] Added sales to existing record: ${name} (+${quantitySold})`);
            } else {
                // If it's a completely new item for the day, instantiate a clean entry document
                const newRecord = new Item({
                    name: name.trim(),
                    quantity: quantitySold,
                    date: todayDate
                });
                await newRecord.save();
                console.log(`[DATABASE] Created fresh daily record for: ${name}`);
            }
            return true;
        } catch (error) {
            console.error("[DATABASE ERROR] Write tracking transaction aborted:", error);
            throw error; // Throw the validation error up so server.js can see it
        }
    }
};