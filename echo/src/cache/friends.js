import { storage } from "../index";

class Friends {
    constructor() {
        this.friends = {};
    }

    typeCheck(data) {
        if (typeof data !== "object") {
            if (typeof data === "boolean") return data;
            return data = String(data);
        }

        if (data.id && typeof data.id !== "string") data.id = String(data.id);
        if (data.accepted && typeof data.accepted !== "boolean") {
            if (data.accepted === "true") data.accepted = true;
            else if (data.accepted === "false") data.accepted = false;
        }
        if (data.requested && typeof data.requested !== "boolean") {
            if (data.requested === "true") data.requested = true;
            else if (data.requested === "false") data.requested = false;
        }

        return data;
    }

    add(data) {
        if (!data) return console.error("[CACHE] Data is required to add a friend to the cache");

        data = this.typeCheck(data);

        if (!data.id) return console.error("[CACHE] ID is required to add a friend to the cache");

        if (this.friends[data.id]) return console.warn(`[CACHE] Friend ${data.id} already exists in cache`);

        this.friends[data.id] = {
            id: data.id,
            accepted: data.accepted || false,
            requested: data.requested || false,
        }
    }

    remove(id) {
        id = this.typeCheck(id);
        if (!this.friends[id]) return console.error(`[CACHE] Friend ${id} does not exist in cache`);
        delete this.friends[id];
    }

    getAll() {
        return this.friends;
    }

    get(id) {
        id = this.typeCheck(id);
        return this.friends[id];
    }

    getNotAccepted() {
        //friends requests that I have sent but have not been accepted yet
        let notAccepted = [];
        for (let id in this.friends) {
            if (!this.friends[id].accepted) notAccepted.push(this.friends[id]);
        }
        return notAccepted;
    }

    getRequested() {
        //friends requests that I have received but have not accepted yet
        let requested = [];
        for (let id in this.friends) {
            if (this.friends[id].requested) requested.push(this.friends[id]);
        }
        return requested;
    }

    getAccepted() {
        //actual friends
        let accepted = [];
        for (let id in this.friends) {
            if (this.friends[id].accepted && this.friends[id].requested) accepted.push(this.friends[id]);
        }
        return accepted;
    }

    update(id, field, value) {
        id = this.typeCheck(id);
        field = this.typeCheck(field);
        value = this.typeCheck(value);
        if (!this.friends[id]) return console.error(`[CACHE] Friend ${id} does not exist in cache`);
        this.users[id][field] = value;
    }
}

export default Friends;