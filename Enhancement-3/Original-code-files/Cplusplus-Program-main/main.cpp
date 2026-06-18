#include <iostream>
#include <string>
#include "ItemTracker.h"
#include "HelperFunctions.h"

using namespace std;

// Function Declarations
void DisplayMenu();
int GetUserInput(); 
string GetUserString();

int main() {
    int userChoice = 1; // Stores the user's menu selection. Initialized to 1 to start loop
    string userString = ""; // Stores item name entered by the user

    ItemTracker Items; 
    Items.LoadFile("CS210_Project_Three_Input_File.txt"); // Load data from file

    // Main program loop
    while (userChoice != 4) {
        DisplayMenu(); // Show menu options to the user

        cout << "Enter your choice from the Menu (A number from 1 to 4): ";
        userChoice = GetUserInput(); // Get and validate user input

        
        if (userChoice == 1) {
            // Ask user for an item name and display its purchase count
            userString = GetUserString(); // Get and validate user input string
            Items.DisplaySingleItemsQuantity(userString);
        }
        else if (userChoice == 2) {
            // Display all items and how many times each was purchased
            Items.DisplayAllItemsQuantity();
        }
        else if (userChoice == 3) {
            // Display all items with a histogram of purchase frequencies
            Items.DisplayAllItemsHistogram();
        }
        else if (userChoice == 4) {
            // Exit the program
            cout << "Program Exited. Have a nice day." << endl;
        }           
    }

    return 0;
}

// Function Definitions 

/**
 * Reads and validates numeric input from the user (1 to 4).
 * Ensures the input is an integer and handles invalid or out-of-range values.
 * @return A valid integer between 1 and 4.
 */
int GetUserInput() {
    int validChoice;

    while (true) {
        string input;
        cin >> input;  // Read the input as a string

        try {
            // Try to convert the string input to an integer
            validChoice = stoi(input);

            // Check if the number is within the valid range
            if (validChoice >= 1 && validChoice <= 4) {
                break;  // Break the loop if input is valid
            }
            else {
                cout << "Kindly choose a number between 1 and 4 : ";
            }
        }
        catch (const invalid_argument& e) {
            // If stoi() fails due to non-numeric input, catch the exception
            cout << "Invalid input. Kindly enter a number between 1 and 4: ";
        }
        catch (const out_of_range& e) {
            // If stoi() fails due to number being too large for int type
            cout << "The number you entered is out of range. Kindly enter a number between 1 and 4: ";
        }
    }
    return validChoice;
}
/**
 * Prompts the user to enter an item name.
 * Ensures the input is not empty and within a reasonable length.
 * Accepts strings that may contain numbers (e.g., 7UP, E6000).
 * @return A valid item name string entered by the user.
 */
string GetUserString() {
    string userInput;
    const size_t maxLength = 20;  // Value set corresponding to current output layout for Item Name

    cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');  // Clear input buffer

    while (true) {
        cout << "Enter item name: ";
        getline(cin, userInput); // Read entire line from input

        if (userInput.empty()) {
            cout << "Input cannot be empty. Please try again. ";
        }
        else if (userInput.length() > maxLength) {
            cout << "Input too long. Please enter a valid item name. ";
        }
        else {
            break; // valid input
        }
    }
    return userInput;
}
/**
 * Displays the formatted program menu to the console.
 * Uses borders and spacing to improve readability.
 */
void DisplayMenu() {
    PrintBorder(); // Prints a decorative border line
    cout << "|                                    Menu                                 |" << endl;
    PrintBorder();
    cout << "| 1. Enter an item's name to see how many times it was purchased          |" << endl;
    PrintBorder();
    cout << "| 2. View all items and see how many times each was purchased             |" << endl;
    PrintBorder();
    cout << "| 3. View all items with a histogram of how many times each was purchased |" << endl;
    PrintBorder();
    cout << "| 4. Exit the program                                                     |" << endl;
    PrintBorder();
}



