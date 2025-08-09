/*
********************
* 
* CS300: Project Two
* Corey Sampson
* August 8th, 2023
* Dr. Webb
* DESCRIPTION: A console application that allows a user to view a sample course schedule, view a course
*			   and its prerequisites, and load data into a Vector data structure.
* 
********************
*/

#include <iostream>
#include <algorithm>
#include <fstream>	// Allows opening and manipulation of text file
#include <vector>	// Required for use of the vector data structure
#include <sstream>	// stringstream library made available

using namespace std;

class Course {
	// Public variables
public:
	int numPrereq;
	string courseName;
	string courseNumber;
	vector<string> prereqs;
};

vector<Course> s;

// User input for case 3 in switch statement located in main
string userInput;

void loadVector(string fileName) {

	// Creation of text string to read output from file
	
	// String to read file lines
	string courses;

	// Read text from the file
	ifstream myFile (fileName);

	// IF file is open
	if (myFile.is_open()) {

		while (getline(myFile, courses)) {
			string temp;
			// Pass string as a stream, passed into inputStream variable created below
			stringstream inputStream(courses);
			Course c;
			// Reject empty line with comma printing
			// Before the sample schedule
			if (courses == "") {
				continue;
			}

			// Obtains information from the string and decodes into a vector
			int end = courses.find(",");
			// Takes substring and assigns it to courseNumber
			c.courseNumber = courses.substr(0, end);
			courses = courses.substr(end + 1);
			end = courses.find(",");

			// IF no comma, then c.courseName = courses
			if (end == string::npos) {
				c.courseName = courses;
			}
			else {
				c.courseName = courses.substr(0, end);
				courses = courses.substr(end + 1);

				int i = 0;

				while (courses != "") {
					end = courses.find(",");

					if (end != string::npos) {
						temp = courses.substr(0, end);
						c.prereqs.push_back(temp);
						courses = courses.substr(end + 1);
					}
					else {
						c.prereqs.push_back(courses);
						break;
					}
				}
			}
			// push_back to store course in the courseList
			s.push_back(c);
		}
		// Close file once done reading from
		myFile.close();
	}
	else {
		cout << "File was not found." << endl;
	}
}

// Sorts stored array in ascending order of courseNumber
bool compareCourses(Course c1, Course c2) {
	return (c1.courseNumber < c2.courseNumber);
}

// isEqual function compares the courses
bool isEqual(Course c) {

	// Compares course saved in vector with userInput
	return (c.courseNumber == userInput);
}

int main() {

	// Variable declaration that runs the loop and cases
	int userChoice;

	// Decalres "it" within the vector
	vector<Course>::iterator it;

	cout << "Welcome to the course planner." << endl;

	// Do loop for the menu
	do {
		cout << endl;
		cout << "1. Load Data Structure." << endl;
		cout << "2. Print Course List." << endl;
		cout << "3. Print Course." << endl;
		cout << "9. Exit" << endl;
		cout << endl;

		cout << "What would you like to do? ";

		cin >> userChoice;

		switch (userChoice) {
		case 1: {
			// Load data structure
			// Call loadVector function with text file paramater
			string fileName;
			loadVector("ABCU_input.txt");

			// Sort the vector here to remove the need for multiple sorts
			sort(s.begin(), s.end(), compareCourses);
			break;
		}

		case 2: {
			cout << "Here is a sample schedule: " << endl;
			cout << endl;

			// FOR loop to print courses determined by size of the vector
			for (int i = 0; i < s.size(); ++i) {

				cout << s[i].courseNumber << "," << s[i].courseName << endl;
			}
			cout << endl;
			break;
		}

		case 3: {

			// Ask user for course they want to know about
			cout << "What course do you want to know about? ";

			// Get userInput, use of cin.ignore to avoid conflicts with input
			cin >> userInput;
			cin.ignore();

			// Iterator it is a type within the vector class used to sort and call isEqual function
			it = find_if(s.begin(), s.end(), isEqual);

			// Print course information using it as vector reference
			if (it != s.end()) {
				cout << it->courseNumber << ", " << it->courseName << endl;
				cout << "Prerequisites: ";

				for (int i = 0; i < it->prereqs.size(); ++i) {
					cout << it->prereqs[i];

					// Remove comma after the last prerequisite is found
					if (i == it->prereqs.size() - 1) {
						cout << endl;
					}
					else {
						
						// Add comma between prerequisites
						cout << ", ";
					}
				}
			}
			else {

				// Error message for invalid course input
				cout << "Course Number: " << userInput << " was not found." << endl;
			}
			break;
		}

		case 9: {

			// Exit application
			break;
		}

		default: {

			// Default case for when the user enters anything other than 1, 2, 3 or 9
			cout << userChoice << " is not a valid option." << endl;
		}
		}
	}

	// WHILE condition is met, continue to run the application
	while (userChoice != 9);

	return 0;
}