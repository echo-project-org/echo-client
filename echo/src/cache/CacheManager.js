import Users from "@cache/user";
import Room from "@cache/room";
import Friends from "@cache/friends";

class CacheManager {
    constructor() {
        this.cachedFriends = new Friends();
        this.cachedRooms = new Room();
        this.cachedUsers = new Users();
    }
}

export default CacheManager;