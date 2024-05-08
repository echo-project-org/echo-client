import Users from "@cache/user";
import Room from "@cache/room";
import Friends from "@cache/friends";

class CacheManager {
    constructor() {
        this.cachedFriends = new Friends();
        this.cachedUsers = new Users();
        this.cachedRooms = null;
    }

    cacheRoom(roomId) {
        this.cachedRooms = new Room(roomId);
    }
}

export default CacheManager;