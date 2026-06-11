#pragma once

#include <string>

using namespace std;

// Prints a horizontal line of dashes (default length set to 75 to match Menu's width where its used most times)
void PrintBorder(int length = 75);
// Prints a formatted header with labels "Item" and "Frequency"
void PrintHeader();
// Converts a string to lowercase
string ToLower(const string& str);

