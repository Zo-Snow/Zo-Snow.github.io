#include "HelperFunctions.h"
#include <iostream>
#include <iomanip>
#include <algorithm>

using namespace std;

/**
 * Prints a horizontal border line composed of dashes.
 * @param length Number of dashes to print (no default here — default is in header).
 */
void PrintBorder(int length) { 
    // Loop 'length' number of times to print that many dashes
    for (int i = 0; i < length; i++) {
        cout << "-";
    }
    cout << endl;
}

/**
 * Prints a formatted header for item-frequency output.
 * The header shows the labels "Item" and "Frequency" within a bordered line.
 */
void PrintHeader() {
    PrintBorder(46); // Print top border
    // Print column headers with left alignment and fixed width
    cout << "| " << left << setw(20) << "Item"
        << "| " << setw(20) << "Frequency" << " |" << endl;
    PrintBorder(46); // Print bottom border
}

/**
 * Converts a given string to all lowercase letters
 * for case-insensitive comparisons (e.g. matching user input to stored items).
 * @param str The input string to convert.
 * @returns A new string containing the lowercase version of str.
 */
string ToLower(const string& str) {
    string lowerStr = str;
    // Transform each character in the string to lowercase
    transform(lowerStr.begin(), lowerStr.end(), lowerStr.begin(), ::tolower);
    return lowerStr;
}