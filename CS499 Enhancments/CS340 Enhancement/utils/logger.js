// Logging utility using Morgan to track HTTP requests.
// Logs detailed information to a file and concise logs to the console.
// Helps monitor server activity and aids in debugging or auditing.

const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

// Define the directory path for storing log files
const logDirectory = path.join(__dirname, "..", "logs");

// Ensure the logs directory exists; create it if it doesn't
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Create a writable stream for the access log file in append mode
const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, "access.log"),
    { flags: "a" }  // Append mode
);

// Define two separate loggers:
// - `fileLogger`: uses 'combined' format for comprehensive logs, directed to file
// - `consoleLogger`: uses 'dev' format for concise real-time logging to console
const fileLogger = morgan("combined", { stream: accessLogStream });
const consoleLogger = morgan("dev");

// Export both loggers for integration in the main app
module.exports = {
    fileLogger,
    consoleLogger
};