#include "pch.h"
#include <iostream>
#include <string>
#include "Encryptor.h"
#include "FileManager.h"
#include "Logger.h"

int main() {
	Encryptor encryptor;
	FileManager fileManager;

	int choice;
	std::string inputPath, outputPath, key, content, result;

	while (true) {
		// Display main menu
		std::cout << "\n=== Secure Encryption Tool ===\n";
		std::cout << "1. XOR Encrypt/Decrypt File\n";
		std::cout << "2. Simulate AES Encryption\n";
		std::cout << "3. Exit\n";
		std::cout << "Select an option: ";
		std::cin >> choice;
		std::cin.ignore();	// Clears leftover newline

		try {
			if (choice == 1) {
				std::cout << "Enter input file path: ";
				std::getline(std::cin, inputPath);
				std::cout << "Enter output file path: ";
				std::getline(std::cin, outputPath);
				std::cout << "Enter key: ";
				std::getline(std::cin, key);

				// Input validation
				if (key.empty()) throw std::invalid_argument("Key must not be empty.");

				content = fileManager.readFile(inputPath);
				result = encryptor.xorEncrypt(content, key);
				fileManager.writeFile(outputPath, result);

				Logger::log("Xor encryption/decryption completed.");
			}
			else if (choice == 2) {
				std::cout << "Enter input file path: ";
				std::getline(std::cin, inputPath);
				std::cout << "Enter output file path: ";
				std::getline(std::cin, outputPath);

				content = fileManager.readFile(inputPath);
				result = encryptor.simulatesAES(content);
				fileManager.writeFile(outputPath, result);

				Logger::log("Simulated AES Encryption completed.");
			}
			else if (choice == 3) {
				Logger::log("Exiting application.");
				break;
			}
			else {
				std::cout << "Invalid chocie. Try again.\n";
			}
		}
		catch (const std::exception& e) {
			// Display error to the user
			std::cerr << "[ERROR]: " << e.what() << std::endl;
		}
	}

	return 0;

}