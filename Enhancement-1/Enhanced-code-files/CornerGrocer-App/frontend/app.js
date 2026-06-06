/**
 * ============================================================================
 * Name:         Zuha Asim
 * Date:         May 20, 2026
 * Version:      1.0.0
 * Intent:       Manages the user interface, buttons, and communicates with the backend. 
 *               Built from scratch for Enhancement 1 to deliver a clean dashboard 
 *               experience featuring client-side security checks, optimized table 
 *               rendering, structured configuration variables and updates the cart counts 
 *               smoothly.
 * ============================================================================
 */

// --- 1. CONFIGURATION AND SETTINGS ---
// Storing our fixed variables in one place
const CONFIG = {
    API_URL: 'http://localhost:3000/api',
    MAX_ITEM_QTY: 10,
    SHAKE_TIMEOUT_MS: 200,
    SUCCESS_TIMEOUT_MS: 2000,
    DEFAULT_COLOR: '#888',
    ERROR_COLOR: '#e74c3c',
    TEXT_COLOR: 'var(--dark-text)'
};

// --- 2. STATE MANAGEMENT ---
// This temporary object tracks what items the user is currently ordering
let currentOrder = {};

// --- 3. DOM ELEMENT SELECTORS ---
// Gathering our HTML page elements so JavaScript can control them
const dashboardPage = document.getElementById('dashboard-page');
const simulationPage = document.getElementById('simulation-page');
const inventoryBody = document.getElementById('inventory-body');
const tableView = document.getElementById('table-view');
const graphView = document.getElementById('graph-view');
const itemSearchInput = document.getElementById('item-search');
const orderCard = document.getElementById('order-card');
const orderList = document.getElementById('order-items-list');
const dateFilter = document.getElementById('date-filter'); 

// Emoji lookup map to add images to the simulation screen item buttons
const itemIcons = {
    "Apples": "🍎", "Beets": "🍠", "Broccoli": "🥦", "Cantaloupe": "🍈",
    "Cauliflower": "🥬", "Celery": "🌿", "Cranberries": "🍒", "Cucumbers": "🥒",
    "Garlic": "🧄", "Limes": "🍋", "Onions": "🧅", "Peaches": "🍑",
    "Pears": "🍐", "Peas": "🟢", "Potatoes": "🥔", "Pumpkins": "🎃",
    "Radishes": "🍅", "Spinach": "🍃", "Yams": "🍠", "Zucchini": "🥒"
};

// --- 4. INITIAL LOAD SEQUENCE ---
// Run this setup script as soon as the HTML completely loads
window.addEventListener('DOMContentLoaded', () => {
    refreshDateDropdown();
});

// --- 5. NAVIGATION HANDLERS ---
// Switch view to the main Dashboard screen
document.getElementById('nav-dashboard').addEventListener('click', () => {
    dashboardPage.classList.remove('hidden');
    simulationPage.classList.add('hidden');
    refreshDateDropdown(); // Update dropdown choices in case new entries exist
});

// Switch view to the backend simulation ordering page
document.getElementById('nav-simulation').addEventListener('click', () => {
    simulationPage.classList.remove('hidden');
    dashboardPage.classList.add('hidden');
    refreshSimulationButtons(); // Draw the item buttons fresh
});

// --- 6. DASHBOARD LOGIC ---

/**
 * Scans the full inventory to find unique dates and populates the filter.
 */
async function refreshDateDropdown() {
    try {
        // Fetch the full data list from our API
        const response = await fetch(`${CONFIG.API_URL}/items`);
        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }
        const allItems = await response.json();
        
        // Use a Set to strip out duplicates and get a clean list of dates
        const uniqueDates = [...new Set(allItems.map(item => item.date))];
        
        // Remember whatever date the user was looking at so we don't clear it
        const currentSelection = dateFilter.value;
        
        // Reset the drop-down menu with a default option
        dateFilter.innerHTML = '<option value="all">All Dates</option>';
        
        // Loop through dates and inject them into the HTML select tag
        uniqueDates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = date;
            dateFilter.appendChild(option);
        });

        // Try to snap back to their old choice, or default back to "all"
        dateFilter.value = currentSelection || "all";
    } catch (error) {
        console.error("Error updating date filter:", error);
    }
}

/**
 * Fetch and Render Items with Date Filtering
 */
document.getElementById('show-all-btn').addEventListener('click', async () => {
    const selectedDate = dateFilter.value;
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/items`);
        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }
        let data = await response.json();
        
        // Filter the rows down if they chose a specific date
        if (selectedDate !== 'all') {
            data = data.filter(item => item.date === selectedDate);
        }
        
        // Draw the fresh table array and swap visibilities
        renderTable(data);
        tableView.classList.remove('hidden');
        graphView.classList.add('hidden');
    } catch (error) {
        console.error("Technical Error:", error);
    }
});

/**
 * Search Handler: Filtered by Selected Date
 */
document.getElementById('search-btn').addEventListener('click', async () => {
    // Trim extra spaces from the search box
    const rawQuery = itemSearchInput.value.trim();
    const selectedDate = dateFilter.value;
    
    // Stop early if the search box is completely empty
    if (!rawQuery) {
        return; 
    }

    // Security Check: Make sure they only typed standard characters (A-Z)
    const alphaOnly = /^[a-zA-Z\s]+$/;
    if (!alphaOnly.test(rawQuery)) {
        renderTableMessage(
            "⚠️ <strong>Invalid Input</strong>", 
            "Please use letters only. Numbers and symbols are not allowed.",
            CONFIG.ERROR_COLOR
        );
        itemSearchInput.value = ''; // Clean up input text field
        return;
    }

    const query = rawQuery.toLowerCase();

    try {
        const response = await fetch(`${CONFIG.API_URL}/items`);
        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }
        const allItems = await response.json();
        
        // Filter elements based on name matching AND date selection rules
        const foundItems = allItems.filter(item => {
            const matchesName = item.name.toLowerCase() === query;
            const matchesDate = (selectedDate === 'all' || item.date === selectedDate);
            return matchesName && matchesDate;
        });

        // Show the results table if found, otherwise display a missing alert row
        if (foundItems.length > 0) {
            renderTable(foundItems);
            tableView.classList.remove('hidden');
        } else {
            renderTableMessage(
                `🔍 No results for "<strong>${rawQuery}</strong>"`, 
                "Try selecting 'All Dates' or check your spelling.",
                CONFIG.DEFAULT_COLOR
            );
        }
    } catch (error) {
        console.error("Search Error:", error);
    }
});

/**
 * Renders the tabular inventory views safely
 */
function renderTable(items) {
    // Optimization: Build rows as a single text string before touching the real page DOM
    const rows = items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.date}</td>
        </tr>
    `).join('');
    
    inventoryBody.innerHTML = rows;
}

// Temporary placeholder trigger for the enhancement 2 assignment milestones
document.getElementById('show-graph-btn').addEventListener('click', () => {
    tableView.classList.add('hidden');
    
    renderTableMessage(
        "📊 <strong>Bar Graph</strong>",
        "The dynamic bar graph visualization is scheduled for implementation in <strong>Enhancement 2: Algorithms and Data Structures</strong>.",
        CONFIG.TEXT_COLOR
    );
});

// --- 7. SIMULATION LOGIC ---

/**
 * Creates and displays ordering buttons dynamically based on items available
 */
async function refreshSimulationButtons() {
    const itemGrid = document.getElementById('item-grid');
    itemGrid.innerHTML = ''; // Empty out any leftover button blocks

    try {
        const response = await fetch(`${CONFIG.API_URL}/items`);
        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }
        const allItems = await response.json();
        
        // Map names into a unique collection so we don't draw duplicate buttons
        const uniqueNames = [...new Set(allItems.map(item => item.name))];

        // Loop through each product name and generate a grid button
        uniqueNames.forEach(name => {
            const btn = document.createElement('button');
            btn.className = 'item-btn';
            const icon = itemIcons[name] || "📦";
            btn.innerHTML = `<span>${icon}</span><br>${name}`;
            btn.onclick = () => addToOrder(name);
            itemGrid.appendChild(btn);
        });
    } catch (error) {
        console.error("Error loading simulation buttons.", error);
    }
}

/**
 * Handles adding an item to the active order while enforcing cart constraints
 */
function addToOrder(itemName) {
    const currentQty = currentOrder[itemName] || 0;

    // Safety check: Prevent ordering more than our maximum limit constant
    if (currentQty >= CONFIG.MAX_ITEM_QTY) {
        const btn = [...document.querySelectorAll('.item-btn')]
                        .find(b => b.innerText.includes(itemName));
        
        // Play a quick shake CSS animation if they cross the limit line
        if (btn) {
            btn.style.animation = "shake 0.2s ease-in-out";
            setTimeout(() => {
                btn.style.animation = "";
            }, CONFIG.SHAKE_TIMEOUT_MS);
        }
        return; 
    }

    // Advance the cart count by one and redraw the list box layout
    currentOrder[itemName] = currentQty + 1;
    orderCard.classList.remove('hidden');
    renderOrderList();
}

/**
 * Updates the temporary cart list visibility state
 */
function renderOrderList() {
    orderList.innerHTML = ''; // Clear out the previous text list
    
    // Convert tracking object map into human-readable bullet items
    for (const [name, qty] of Object.entries(currentOrder)) {
        const li = document.createElement('li');
        li.style.listStyle = 'none';
        li.style.padding = '8px 0';
        li.style.borderBottom = '1px solid #eee';
        li.innerHTML = `<strong>${name}</strong>: ${qty} units`;
        orderList.appendChild(li);
    }
}

/**
 * Submits gathered simulation order objects out to our web service API layer
 */
document.getElementById('place-order-btn').addEventListener('click', async () => {
    // Safety check: Don't do anything if the cart is blank
    if (Object.keys(currentOrder).length === 0) {
        return;
    }

    try {
        // Send a distinct POST request for every unique type of item in the cart
        for (const [itemName, qty] of Object.entries(currentOrder)) {
            await fetch(`${CONFIG.API_URL}/update-inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: itemName, quantitySold: qty })
            });
        }

        // Display confirmation toast feedback box
        const msg = document.getElementById('order-success-msg');
        msg.classList.remove('hidden');

        // Hide the confirmation card after a few brief seconds
        setTimeout(() => {
            msg.classList.add('hidden'); 
            orderCard.classList.add('hidden');
        }, CONFIG.SUCCESS_TIMEOUT_MS);

        // Clear layout states so it's clean for the next action
        tableView.classList.add('hidden');       
        itemSearchInput.value = '';             

        // Completely clear our order state tracking parameters
        currentOrder = {};
        orderList.innerHTML = '';
        refreshDateDropdown();
    } catch (error) {
        console.error("Failed to submit order transaction:", error);
    }
});

/**
 * Displays a nice message box directly inside our inventory data table frame
 */
function renderTableMessage(title, message, color = CONFIG.DEFAULT_COLOR) {
    inventoryBody.innerHTML = `
        <tr>
            <td colspan="3" style="padding: 40px; text-align: center; color: ${color};">
                <p style="font-size: 1.2rem; margin-bottom: 10px;">${title}</p>
                <p>${message}</p>
            </td>
        </tr>
    `;
    tableView.classList.remove('hidden');
}