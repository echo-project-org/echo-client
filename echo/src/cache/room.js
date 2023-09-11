class Room {
    constructor(data) {
        console.log("created room to cache", data)

        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.maxUsers = data.maxUsers;
    }
}

export default Room;