import Users from "@cache/user";
import Room from "@cache/room";
import Friends from "@cache/friends";

class CacheManager {
    constructor() {
        this.cachedFriends = new Friends();
        this.cachedUsers = new Users();
        this.cachedRooms = new Map();
    }

    cacheRoom(roomId) {
        this.cachedRooms.set(roomId, new Room(roomId));
    }

    getRoom(roomId) {
        return this.cachedRooms.get(roomId);
    }
}

export default CacheManager;