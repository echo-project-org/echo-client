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
                console.error(err);
                if (this.con) this.con.release();
                this.connected = false;
                console.error("Retrying connection to database. Maybe offline?");
                setTimeout(() => { this.enstablishConnection() }, this.config.database.retryInterval * 1000 * 60 || 20000);
            });
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.pool = mysql.createPool(this.config.database);
            this.con = this.pool.getConnection((err, connection) => {
                if(err){
                    connection.release();
                    reject(err);
                }
            })
            resolve();
        });
    }
    
    getConnection() {
        if (!this.connected) return false;
        return this.pool;
    }

    query(query, callback){
        this.pool.getConnection((err, connection) => {
            if(err){
                console.error(err);
                connection.release();
                return false;
            }
            connection.query(query, (err, result) => {
                connection.release();
                if(err){
                    console.error(err);
                    return false;
                }
                callback(result);
            });
        });
    }
}

module.exports = SQL;