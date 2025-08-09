#pragma once
#include <string>

// Logger provides basic console output for status and errors
class Logger {
public:
	static void log(const std::string& message);
};
