const mysql = require('mysql'); 

class SQL {
    constructor(config) {
        this.config = config;
        this.connected = false;
        this.enstablishConnection();
    }

    enstablishConnection() {
        this.connect()
            .then(() => {
                this.connected = true;
                console.log("Connected to database!")
            })
            .catch(err => {
                console.log(err);
                if (this.con) this.con.destroy();
                this.connected = false;
                console.error("Retrying connection to database. Maybe offline?");
                setTimeout(() => { this.enstablishConnection() }, this.config.database.retryInterval * 1000 * 60 || 20000);
            });
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.con = mysql.createConnection(this.config.database);
            this.con.connect((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
    
    getConnection() {
        if (!this.connected) return false;
        return this.con;
    }
}

module.exports = SQL;