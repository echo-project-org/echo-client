import Users from "@cache/user";
import Room from "@cache/room";
import Friends from "@cache/friends";

class CacheManager {
    constructor() {
        this.cachedFriends = new Friends();
        this.cachedUsers = new Users();
        this.cachedRooms = new Map();
    }

    addRoom(room) {
        this.cachedRooms.set(room.id, new Room(room));
    }

    getRoom(roomId) {
        return this.cachedRooms.get(roomId);
    }

    addUser(user) {
        this.cachedUsers.add(user);
    }

    updateUser(user) {
        this.cachedUsers.set(user.id, user);
    }

    getUser(userId) {
        if(!userId) {
            return this.cachedUsers.get(sessionStorage.getItem("id"));
        } else {
            return this.cachedUsers.get(userId);
        }
    }

    getUsersInRoom(roomId) {
        return this.cachedUsers.getInRoom(roomId);
    }
}

export default CacheManager;