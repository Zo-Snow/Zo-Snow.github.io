#pragma once

#include <string>
#include <map>

using namespace std;

/**
 * @class ItemTracker
 * @brief Manages a collection of items and their purchase frequencies.
 *
 * Provides functionality to load item data from a file, display
 * frequencies for single or all items, show a histogram of item frequencies,
 * and backup data to a file.
 */
class ItemTracker {
public:
    // Reads items from the given file name and counts their frequencies adding them to a map
    void LoadFile(const string& fileName);
    // Displays the purchase quantity of a single item
    void DisplaySingleItemsQuantity(string userString);
    // Displays all items and their purchase quantities
    void DisplayAllItemsQuantity();
    // Displays all items along with a histogram of their purchase frequencies
    void DisplayAllItemsHistogram();
private:
    // Creates a backup file named "frequency.dat" with item frequencies
    void BackupFile();
    // Stores item names and their corresponding purchase counts
    map<string, int> allItems;
};
