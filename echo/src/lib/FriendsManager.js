import { ee, cm } from "@root";
const { error, warn, log } = require("@lib/logger");

export function addFriend(friend) {
    log("ep.addFriend", friend);
    // if (typeof friend.targetId !== "string") friend.targetId = Number(friend.targetId);
    // populate info with cached user data
    if (!friend.name && !friend.img) {
        const user = cm.cachedUsers.get(friend.targetId);
        log("user", user);
        if (user) {
            friend.img = user.img || user.userImage;
            friend.name = user.name;
            friend.status = user.status;
            friend.online = user.online;
        } else {
            error(`User ${friend.targetId} not found in cache, adding to cache...`)
            ee.needUserCacheUpdate({ id: friend.targetId, call: { function: "addFriend", args: friend } });
        }
    }
    friend.id = friend.targetId;
    cm.cachedFriends.add(friend);
    ee.friendCacheUpdated(cm.cachedFriends.getAll());
}

export function updateFriends({ id, field, value }) {
    cm.cachedFriends.update(id, field, value);
    ee.friendCacheUpdated(cm.cachedFriends.getAll());
}

export function removeFriend(data) {
    log("ep.removeFriend", data);
    cm.cachedFriends.remove(data.targetId);
    ee.friendCacheUpdated(cm.cachedFriends.getAll());
}

export function getFriend(id) {
    let friend = cm.cachedFriends.get(id);
    let userFriend = cm.cachedUsers.get(id);
    if (friend && userFriend) {
        return userFriend;
    } else {
        // ee.needUserCacheUpdate({ id, call: { function: "getFriend", args: { id } } });
        warn("Friend not found in cache, probably offline and we don't handle it, ID:", id)
    }
}

//TODO change this to work with new api events
export function wsFriendAction(data) {
    log("wsFriendAction", data)

    if (data.operation === "add") {
        this.addFriend(data);
    } else if (data.operation === "remove") {
        this.removeFriend(data);
    }
}