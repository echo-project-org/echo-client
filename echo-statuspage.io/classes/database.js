const sqlite3 = require("sqlite3");

class Database {
    constructor(config) {
        this.config = config.database;
        // crete db file in data folder
        const path = "./data/" + this.config.name + ".db";
        this.db = new sqlite3.Database(path);
        // init the database creating all the tables
    }

    init() {
        return new Promise((resolve, reject) => {
            this.db.run("CREATE TABLE IF NOT EXISTS incidents (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, incId TEXT, status TEXT, message TEXT, data TEXT)");
            resolve();
        });
    }

    /**
     * 
     * @param {Array} incident
     * @param {String} incident.name name of the incident
     * @param {String} incident.id id returned by the statuspage api
     * @param {String} incident.status can be "investigating" "identified" "monitoring" "resolved" "scheduled" "in_progress" "verifying" "completed"
     * @param {String} incident.message message to be displayed on the statuspage
     */
    addIncident(incident) {
        const sql = "INSERT INTO incidents (name, incId, status, message, data) VALUES (?, ?, ?, ?, ?)";
        this.db.run(sql, [incident.name, incident.id, incident.status || "in_progress", incident.message, JSON.stringify(incident)]);
    }

    getIncident(incident) {
        const sql = "SELECT * FROM incidents WHERE incId = ? ORDER BY id DESC LIMIT 1";
        return new Promise((resolve, reject) => {
            this.db.all(sql, [incident.id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * 
     * @returns {Promise<Array>} array of incidents
     */
    getActiveIncidents() {
        const sql = "SELECT * FROM incidents WHERE id = ( SELECT MAX(id) FROM incidents WHERE status <> ? )";
        return new Promise((resolve, reject) => {
            this.db.all(sql, ["completed"], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = Database;