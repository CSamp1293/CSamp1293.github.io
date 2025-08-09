#include "pch.h"
#include "FileManager.h"
#include <fstream>
#include <sstream>
#include <stdexcept>

// Reads file from disk and returns content as a string
std::string FileManager::readFile(const std::string& filepath) {
	std::ifstream file(filepath);
	if (!file) throw std::runtime_error("Cannot open input file.");

	std::ostringstream ss;
	ss << file.rdbuf();
	return ss.str();

}

// Writes string content to file; throws if write fails
void FileManager::writeFile(const std::string& filepath, const std::string& content) {
	std::ofstream file(filepath);
	if (!file) throw std::runtime_error("Cannot write to output file.");

	file << content;
}