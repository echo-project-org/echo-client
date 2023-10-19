const path = require("path");
const fs = require("fs");

class Logger {
    constructor() {
        this.path = "./logs"
        this.fileStream = null;
        this.logStream = null;
        this.logFile = path.join(this.path, "log.txt");

        this.log = this.log.bind(this);
        this.checkFolder();
        this.checkFile();
        this.createStream();

        this.internalId = this.id();
        console.log = this.log;

        console.log("------------------------- LOG STARTED -------------------------");
    }

    // make id function where A are letters and 0 are numbers
    // 0A00AA0000AAA
    id() {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        let id = "";
        for (let i = 0; i < 12; i++) {
            if (i == 1 || i == 4) {
                id += numbers.charAt(Math.floor(Math.random() * numbers.length));
            } else {
                id += letters.charAt(Math.floor(Math.random() * letters.length));
            }
        }
        return id;
    }

    createStream() {
        // create write stream
        this.logStream = fs.createWriteStream(this.logFile, { flags: "a" });
        // get size of logs.txt file
        fs.stat(this.logFile, (err, stats) => {
            if (err) console.error(err);
            console.error("size of file is", stats.size, "bytes");
            // check if file is bigger than 50MB
            if (stats.size > 50000000) {
                // rotate log file
                this.rotate();
            }
        });
    }

    checkFolder() {
        // create main data folder (here since this module gets required first)
        if (!fs.existsSync(this.path)) fs.mkdirSync(this.path);
        // check if folder exists
        if (!fs.existsSync(path.join(this.path))) fs.mkdirSync(path.join(this.path));
    }

    checkFile() {
        // check if file exists
        if (!fs.existsSync(this.logFile)) {
            // create file
            fs.writeFileSync(this.logFile, "");
        }
    }

    rotate() {
        this.checkFile();
        // rename file
        const date = new Date();
        // create new log file and rename adding date as DD/MM/YYYY HH:MM:SS
        const newFile = path.join(this.path, `log_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.txt`);
        // print file rotation
        console.log(`Renaming log file to ${newFile}`);
        // end the stream of the current log file
        this.logStream.end();
        // rename the current log file to the new path
        fs.renameSync(this.logFile, newFile);
        // create new stream after rename
        this.createStream();
    }
    
    async log(...args) {
        // check if args have array or object, if so, stringify it
        args = args.map(arg => {
            if (typeof arg === "object") {
                return JSON.stringify(arg);
            } else {
                return arg;
            }
        });
        // add date to log as DD/MM/YYYY HH:MM:SS
        const date = new Date();
        // check if date is single digit, if so, add a 0 before it
        var dateString = `[${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}/${date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1}/${date.getFullYear()} ${date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()}]`;
        args.unshift(this.internalId + " | " + dateString);
        // create message
        const message = Array.from(args).join(" ") + "\r\n"
        // write to stdout
        process.stdout.write(message);
        // write to log file
        this.logStream.write(message);
        // check if file size is bigger than 50MB
        if (this.logStream.bytesWritten > 50000000) {
            // rotate log file
            this.rotate();
        }
    }
}

module.exports = { Logger };