#include "pch.h"
#include "Logger.h"
#include <iostream>

// Outputs a prefixed log message to the console
void Logger::log(const std::string& message) {
	std::cout << "[LOG]: " << message << std::endl;
}