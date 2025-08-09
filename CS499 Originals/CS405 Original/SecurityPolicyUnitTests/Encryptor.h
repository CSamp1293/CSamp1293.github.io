#pragma once
#include <string>

// Encryptor class handles basic XOR and AES-stub encryption logic
class Encryptor {
public:
	// XOR-based encryption and decryption using a user-defined key
	std::string xorEncrypt(const std::string& data, const std::string& key);

	// Stubbed method simulating AES-like output for demonstration
	std::string simulatesAES(const std::string& data);
};
