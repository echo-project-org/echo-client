const sqlite3 = requrie("sqlite3");

class Database {
    constructor(config) {
        this.config = config.database;
        // crete db file in data folder
        const path = "./data/" + this.config.name + ".db";
        this.db = new sqlite3.Database(path);
        // init the database creating all the tables
        this.init();
    }

    init() {
        this.db.run("CREATE TABLE IF NOT EXISTS incidents (id TEXT, name TEXT, status TEXT, message TEXT)");
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
        const sql = "INSERT INTO incidents (name, id, status, message) VALUES (?, ?, ?, ?)";
        this.db.run(sql, [incident.name, incident.status, incident.message, incident.timestamp]);
    }

    /**
     * 
     * @returns {Promise<Array>} array of incidents
     */
    getActiveIncidents() {
        const sql = "SELECT * FROM incidents WHERE status <> ?";
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