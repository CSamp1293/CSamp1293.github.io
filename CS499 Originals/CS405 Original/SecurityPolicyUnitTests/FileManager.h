#pragma once
#include <string>

// FileManager class abstracts file reading and writing
class FileManager {
public:
	// Reads entire file content from a path and returns as string
	std::string readFile(const std::string& filepath);

	// Writes the content string to the specified file path
	void writeFile(const std::string& filepath, const std::string& content);
};
