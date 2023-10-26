const axios = require('axios');

class StatusPage {
    constructor(config) {
        this.config = config.statusPage
        this.incidents = {}
    }

    _computeStatus(service_status) {
        switch (service_status) {
            case "ok":
                return "resolved";
            case "error":
                return "critical";
            case "warning":
                return "major";
            default:
                return "minor";
        }
    }

    createIncident(service_name, service_error, service_status) {
        if (this.incidents[service_name]) return console.log("[STATUSPAGE] " + service_name + " incident already exists");

        const body = `The service ${service_name} is currently experiencing issues.\nThe error reported is: ${service_error} and the status of the service is now ${service_status}`
        const startDate = new Date();
        const plannedEndDate = new Date(startDate);
        plannedEndDate.setDate(plannedEndDate.getDate() + 4);
        const data = {
            incident: {
                name: `${service_name} incident, ${service_error}`,
                status: "in_progress",
                impact_override: this._computeStatus(service_status),
                body,
                auto_transition_to_maintenance_state: false,
                auto_transition_to_operational_state: false,
                component_ids: [ this.config.components[service_name] ],
                scheduled_for: startDate,
                scheduled_until: plannedEndDate,
                deliver_notifications: this._computeStatus(service_status) == "critical" ? true : false
            }
        }
        this.incidents[service_name] = data;
        this.postIncident(data, service_name);
    }

    postIncident(incident, service_name) {
        console.log(JSON.stringify(incident));
        axios.post(`${this.config.url}/pages/${this.config.PAGE_ID}/incidents`, incident, {
            headers: {
                "Authorization": `OAuth ${this.config.API_KEY}`,
            }
        })
            .then((response) => {
                console.log("[STATUSPAGE] " + service_name + " incident created");
                this.incidents[service_name].id = response.data.id;
            })
            .catch((error) => {
                console.log("[STATUSPAGE] " + service_name + " incident creation failed");
                console.warn(error);
            });
    }

}

module.exports = StatusPage;