import Users from "@cache/user";
import Room from "@cache/room";
import Friends from "@cache/friends";

class CacheManager {
    constructor() {
        this.cachedFriends = new Friends();
        this.cachedUsers = new Users();
        this.cachedRooms = new Map();
    }

    cacheRoom(room) {
        this.cachedRooms.set(room.id, new Room(room));
    }

    getRoom(roomId) {
        return this.cachedRooms.get(roomId);
    }
}

export default CacheManager;