const config = require("../config.json");
// replace console.log function with a custom one that logs to a file
// and also send the log to the console
const fs = require("fs");
const path = require("path");
const logFile = path.join("./logs", "log.txt");
// create the new log file
var logStream = fs.createWriteStream(logFile, { flags: "a" });
console.log = async function () {
    if (!config.log === "verbose") return;
    if (arguments.length === 0) return;
    // check if content is object, then stringify it
    for (var i in arguments)
        if (typeof arguments[i] === "object")
            arguments[i] = JSON.stringify(arguments[i], null, 2);
    // write the stream to file and to stdout out
    logStream.write(new Date().toLocaleString() + " - " + Array.from(arguments).join(" ") + "\r\n");
    // write to standard output
    process.stdout.write(Array.from(arguments).join(" ") + "\r\n");
    // process.stderr.write(Array.from(arguments).join(" ") + "\r\n");
    // check if the current log file is bigger than 10MB and if so, rename it to the current date and time and create a new one
    if (logStream.bytesWritten > 10000000) await _rotateLog();
};

const _rotateLog = () => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(logFile)) {
            const date = new Date();
            // get the new path
            const newFile = path.join("./logs", `log_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.txt`);
            // print file rotation
            console.log(`Renaming log file to ${newFile}`);
            // end the stream of the current log file
            logStream.end();
            // rename the current log file to the new path
            fs.renameSync(logFile, newFile);
            // create a new log file
            logStream = fs.createWriteStream(logFile, { flags: "a" });
            resolve();
        }
    });
}