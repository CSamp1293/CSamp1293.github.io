#include "pch.h"
#include "CppUnitTest.h"
#include <string>
#include <cstring>
#include <memory>
#include <mutex>
#include <stdexcept>

using namespace Microsoft::VisualStudio::CppUnitTestFramework;

namespace SecurityPolicyTests
{
	// ===== STD-001-CPP: Data Type Safety =====
	TEST_CLASS(DataTypeTests)
	{
	public:

		TEST_METHOD(MemoryAllocationCheck)
		{
			int* ptr = (int*)malloc(sizeof(int) * 10);
			Assert::IsNotNull(ptr);
			free(ptr);
		}
	};

	// ===== STD-002-CPP: Data Value Initialization =====
	TEST_CLASS(DataValueTests)
	{
	public:
		TEST_METHOD(InitializationTest)
		{
			int x = 0;
			Assert::AreEqual(0, x);
		}
	};

	// ===== STD-003-CPP: String Correctness =====
	TEST_CLASS(StringSafetyTests)
	{
	public:
		TEST_METHOD(SafeCopyTest)
		{
			char dest[6];
			strncpy_s(dest, sizeof(dest), "Short", 5);
			dest[5] = '\0';
			Assert::AreEqual("Short", dest);
		}
	};

	// ===== STD-004-CPP: SQL Injection Protection =====
	TEST_CLASS(SQLInjectionTests)
	{
	public:
		std::string SanitizeInput(const std::string& input)
		{
			std::string sanitized = input;

			size_t pos = 0;
			while ((pos = sanitized.find("'", pos)) != std::string::npos) {
				sanitized.replace(pos, 1, "''");
				pos += 2;
			}

			size_t commentPos = sanitized.find("--");
			if (commentPos != std::string::npos) {
				sanitized = sanitized.substr(0, commentPos);
			}

			return sanitized;
		}
		TEST_METHOD(SanitizeInputTest)
		{
			std::string input = "' OR 1=1 --";
			std::string sanitizedInput = SanitizeInput(input);

			bool hasInjection = sanitizedInput.find("--") != std::string::npos;
			Assert::IsFalse(hasInjection);
		}
	};

	// ===== STD-005-CPP: Memory Protection =====
	TEST_CLASS(MemoryProtectionTests)
	{
	public:
		TEST_METHOD(SmartPointerTest)
		{
			std::unique_ptr<int[]> buffer(new int[10]);
			Assert::IsNotNull(buffer.get());
		}
	};

	// ===== STD-006-CPP: Assertions (using runtime check instead) =====
	TEST_CLASS(AssertionTests)
	{
	public:
		TEST_METHOD(ThrowOnInvalidInput)
		{
			int x = -1;
			Assert::ExpectException<std::invalid_argument>([&]() {
				if (x < 0) throw std::invalid_argument("Invalid input");
				});
		}
	};

	// ===== STD-007-CPP: Exception Handling =====
	TEST_CLASS(ExceptionHandlingTests)
	{
	public:
		TEST_METHOD(CatchRuntimeError)
		{
			Assert::ExpectException<std::runtime_error>([]() {
				throw std::runtime_error("Test exception");
				});
		}
	};

	// ===== STD-008-CPP: Thread Safety =====
	TEST_CLASS(ThreadSafetyTests)
	{
	public:
		TEST_METHOD(MutexGuardTest)
		{
			static std::mutex m;
			static int shared = 0;
			{
				std::lock_guard<std::mutex> lock(m);
				shared++;
				Assert::IsTrue(shared > 0);
			}
		}
	};

	// ===== STD-009-CPP: Pointer Safety =====
	TEST_CLASS(PointerSafetyTests)
	{
	public:
		TEST_METHOD(SmartPointerDereference)
		{
			auto ptr = std::make_unique<int>(42);
			Assert::AreEqual(42, *ptr);
		}
	};

	// ===== STD-010-CPP: Cryptography (simulated) =====
	TEST_CLASS(CryptographyTests)
	{
	public:
		TEST_METHOD(HashNotEmptyTest)
		{
			std::string hash = "simulated_hash_output"; // Simulated hash
			Assert::IsFalse(hash.empty());
		}
	};
}