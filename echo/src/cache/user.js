class Users {
    constructor() {
        this.users = {};
    }

    typeCheck(data) {
        if (typeof data !== "object") {
            return data = String(data);
        }
        if (data.img) data.userImage = data.img;
        if (data.roomId) data.currentRoom = data.roomId;
        if (data.id && typeof data.id !== "string") data.id = String(data.id);
        if (data.name && typeof data.name !== "string") data.name = String(data.name);
        if (data.online && typeof data.online !== "string") data.online = String(data.online);
        if (data.currentRoom && typeof data.currentRoom !== "string") data.currentRoom = String(data.currentRoom);
        if (data.muted && typeof data.muted !== "boolean") data.muted = Boolean(data.muted);
        if (data.deaf && typeof data.deaf !== "boolean") data.deaf = Boolean(data.deaf);
        return data;
    }

    add(data, self = false) {
        // data type check
        data = this.typeCheck(data);
        console.log("[CACHE] Added user in cache", data)

        if (self) {
            localStorage.setItem("id", data.id);
            localStorage.setItem("name", data.name);
            localStorage.setItem("userImage", data.userImage);
            localStorage.setItem("online", data.online);
        }

        if (!data.id) return console.error("ID is required to add a user to the cache");
        if (!data.name) return console.error("Name is required to add a user to the cache");
        if (!data.online) return console.error("Online is required to add a user to the cache");
        
        this.users[data.id] = {
            id: data.id,
            name: data.name,
            userImage: data.userImage || "",
            online: data.online,
            currentRoom: data.currentRoom || "0",
            muted: data.muted || false,
            deaf: data.deaf || false,
            self
        };

        return this.users[data.id];
    }

    getAll() {
        return this.users;
    }

    get(id) {
        // data type check
        id = this.typeCheck(id);
        return this.users[id];
    }

    getInRoom(roomId) {
        // data type check
        roomId = this.typeCheck(roomId);
        const users = [];
        for (const user in this.users) {
            if (this.users[user].currentRoom === roomId) {
                users.push(this.users[user]);
            }
        }
        console.log("getInRoom", users)
        return users;
    }

    update(id, field, value) {
        // data type check
        id = this.typeCheck(id);
        field = this.typeCheck(field);
        value = this.typeCheck(value);
        this.users[id][field] = value;
    }
}

export default Users;