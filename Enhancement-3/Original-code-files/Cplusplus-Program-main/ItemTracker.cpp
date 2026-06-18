#include "ItemTracker.h"
#include "HelperFunctions.h"

#include <iostream>
#include <fstream>
#include <iomanip>
#include <algorithm>

using namespace std;

/**
 * Loads items from the specified file and counts their frequencies.
 * Populates the allItems map with item names and their purchase counts.
 * Calls BackupFile() after loading to save frequency data.
 * @param filename The name of the input file containing item names.
 */
void ItemTracker::LoadFile(const string& filename) {
    ifstream inFS;
    string currentItem;

    inFS.open(filename);

    // Check if file opened successfully
    if (!inFS.is_open()) {
        cout << "Could not open file." << endl;
        return;
    }

    // Read first Item Name
    inFS >> currentItem;

    // Continue reading items until file ends or fails 
    while (!inFS.fail()) {

        // Checks if map contains current item
        if (allItems.count(currentItem) == 0) {
            // If it doesn't exist yet, add it to the map with the number of times it was purchased set to 1
            allItems.emplace(currentItem, 1);
        }
        else {
            // If it exists, increment the number of times it was purchased
            allItems.at(currentItem) += 1;
        }

        // Read next Item Name
        inFS >> currentItem;
    }

    // To check and output if any errors occur before end of file is reached
    if (!inFS.eof()) {
        cout << "Input failure before reaching end of file." << endl;
    }

    // Close file
    inFS.close();

    // Backup data to frequency.dat after loading from file
    BackupFile();
}

/**
 * Writes the contents of allItems map to a backup file named "frequency.dat".
 * Each line contains an item and its frequency seperated by a space.
 */
void ItemTracker::BackupFile() {
    ofstream outFS; // For writing to file

    outFS.open("frequency.dat"); // Open/create backup file

    // Check if file opened successfully
    if (!outFS.is_open()) {
        cout << "Could not open file." << endl;
        return;
    }

    // Loop through all items in the map and write each item along with how many times it was purchased
    for (const auto& item : allItems) {
        // Write each item and the number of times it was purchased
        outFS << item.first << " " << item.second << endl;
    }

    // Close file
    outFS.close();
}

/**
 * Displays a formatted list of all items and their purchase quantities.
 * Prints a header with the labels "Item" and "Frequency"
 * followed by each item's name and count.
 */
void ItemTracker::DisplayAllItemsQuantity() {
    // Print a header
    PrintHeader();

    // Print each item and its frequency
    for (const auto& item : allItems) {
        cout << "| " << left << setw(20) << item.first
            << "| " << setw(20) << item.second << " |" << endl;

    }
    PrintBorder(46);
}

/**
 * Displays all items along with a histogram representing purchase frequency.
 * Prints stars (*) equal to the count of each item for visualization.
 */
void ItemTracker::DisplayAllItemsHistogram() {
    // Print header
    PrintHeader();

    // For each item, print name and histogram bar of stars
    for (const auto& item : allItems) {
        cout << "| " << left << setw(20) << item.first << "| ";

        // Print stars equal to frequency
        for (int i = 0; i < item.second; i++) {
            cout << "*";
        }

        // Pad the histogram bar so all align to fixed width
        int maxWidth = 20; 
        int padding = maxWidth - item.second;
        for (int i = 0; i < padding; i++) {
            cout << " ";
        }

        cout << " |" << endl;
    }
    PrintBorder(46);
}

/**
 * Displays the purchase quantity for a single item input by the user.
 * If the item is not found, displays zero frequency.
 * Case-insensitive comparison is used.
 * @param userInput The name of the item to display.
 */
void ItemTracker::DisplaySingleItemsQuantity(string userInput) {
    string inputLower = ToLower(userInput);
    bool found = false;

    PrintHeader();

    // Search for item in the map matching user input (case-insensitive)
    for (const auto& item : allItems) {
        // If found, show with item name along with its frequency
        if (ToLower(item.first) == inputLower) {
            cout << "| " << left << setw(20) << item.first
                << "| " << setw(20) << item.second << " |" << endl;
            found = true;
            break;
        }
    }

    // If not found, show zero frequency
    if (!found) {
        // Print user input with 0 frequency
        cout << "| " << left << setw(20) << userInput
            << "| " << setw(20) << 0 << " |" << endl;
    }
    PrintBorder(46);
}