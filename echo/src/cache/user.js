class User {
    constructor(data, self = false) {
        console.log("created user to cache", data, self)
        this.id = data.id;
        this.name = data.name;
        this.userImage = data.img;
        this.online = data.online;
        this.currentRoom = String(data.roomId);

        this.muted = false;
        this.deaf = false;
        this.self = self;
    }

    getData() {
        return {
            id: this.id,
            name: this.name,
            img: this.userImage,
            online: this.online,
            currentRoom: this.currentRoom
        }
    }

    updatecurrentRoom(roomId) {
        console.log("updatecurrentRoom in user cache", roomId, this.id)
        if (isNaN(roomId)) return console.error("NOT A VALID ROOM NUMBER IN setCurrentRoom")
        this.currentRoom = String(roomId);
    }

    updatename(name) {
        this.name = name;
    }

    updateuserImage(img) {
        this.userImage = img;
    }

    updateonline(online) {
        this.online = online;
    }

    updatemuted(muted) {
        console.log("updatemute in user cache", muted, this.id)
        this.muted = muted;
    }

    updatedeaf(deaf) {
        console.log("updatedeaf in user cache", deaf, this.id)
        this.deaf = deaf;
    }
}

export default User;