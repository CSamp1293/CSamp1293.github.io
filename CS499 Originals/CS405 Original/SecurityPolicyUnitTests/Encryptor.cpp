#include "pch.h"
#include "Encryptor.h"

// XOR encrypt/decrypt logic: applies key repeatedly across the data
std::string Encryptor::xorEncrypt(const std::string& data, const std::string& key) {
	std::string output = data;
	for (size_t i = 0; i < data.length(); ++i) {
		output[i] ^= key[i % key.length()];
	}
	return output;
}

// Simulates AES encryption by wrapping the text (placeholder only)
std::string Encryptor::simulatesAES(const std::string& data) {
	return "[AES_ENCRYPTED]" + data + "[/AES_ENCRYPTED]";
}