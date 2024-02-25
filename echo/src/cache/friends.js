import { storage } from "../index";

class Friends {
  constructor() {
    this.friends = {};
  }

  typeCheck(data) {
    if (data === undefined || data === null) throw new Error("[CACHE] Data is required to type check");
    if (typeof data !== "object") {
      if (typeof data === "boolean") return data;
      return data = String(data);
    }

    if (data.img) data.img = String(data.img);
    if (data.name) data.name = String(data.name);
    if (data.status) data.status = String(data.status);
    if (data.online) data.online = String(data.online);

    return data;
  }

  add(data) {
    if (!data) return console.error("[CACHE] Data is required to add a friend to the cache");
    data = this.typeCheck(data);
    
    if (typeof data.id === "string") data.id = Number(data.id);
    if (!data.id) return console.error("[CACHE] ID is required to add a friend to the cache");
    if (!data.type) return console.error("[CACHE] Type is required to add a friend to the cache");
    if (this.friends[data.id]) return console.warn(`[CACHE] Friend ${data.id} already exists in cache`);

    this.friends[data.id] = {
      id: data.id,
      type: data.type,
      img: data.img || "",
      name: data.name || "",
      online: data.online || "0",
      status: data.status || "",
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

  has(id) {
    id = this.typeCheck(id);
    return this.friends[id] ? true : false;
  }

  update(id, field, value) {
    id = this.typeCheck(id);
    field = this.typeCheck(field);
    value = this.typeCheck(value);
    if (!this.friends[id]) return console.error(`[CACHE] Friend ${id} does not exist in cache`);
    this.friends[id][field] = value;
  }
}

export default Friends;