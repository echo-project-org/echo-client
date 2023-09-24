class LocalStorage {
  constructor() {
    this.storage = window.localStorage;
  }

  _get(key) {
    return this.storage.getItem(key);
  }

  _set(key, value) {
    this.storage.setItem(key, value);
  }

  _remove(key) {
    this.storage.removeItem(key);
  }

  _clear() {
    this.storage.clear();
  }
}

class TokenManager extends LocalStorage {
  constructor() {
    super();
  }

  setToken(token) {
  }
}    

// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
class Storage extends LocalStorage {
  constructor() {
    super();
  
    this.db = null;
    this.request = window.indexedDB.open("EchoDB", 3);

    this.request.onerror = function(event) {
      console.log("Why didn't you allow my web app to use IndexedDB?!");
    };

    this.request.onsuccess = function(event) {
      console.log("Success!");
      this.db = event.target.result;
    };

    this.request.onupgradeneeded = function(event) {
      this.db = event.target.result;
      // var objectStore = this.db.createObjectStore("echo", { keyPath: "id" });
      // objectStore.createIndex("id", "id", { unique: true });
      // objectStore.createIndex("data", "data", { unique: false });
    }
  }

  set(key, value, type = "local") {
    if (type === "local") {
      this._set(key, value);
    } else if (type === "indexed") {
      const transaction = this.db.transaction(["echo"], "readwrite");
      const objectStore = transaction.objectStore("echo");
      const request = objectStore.add({ id: key, data: value });
      request.onsuccess = function(event) {
        console.log("Success!");
      };
    }
  }

  get(key, type = "local") {
    if (type === "local") {
      return this._get(key);
    } else if (type === "indexed") {
      const transaction = this.db.transaction(["echo"], "read");
      const objectStore = transaction.objectStore("echo");
      const request = objectStore.get(key);
      request.onsuccess = function(event) {
        console.log("Success!");
        return request.result;
      };
    }
  }

  clear(type = "local") {
    if (type === "local") {
      this._clear();
    } else if (type === "indexed") {
      const transaction = this.db.transaction(["echo"], "readwrite");
      const objectStore = transaction.objectStore("echo");
      const request = objectStore.clear();
      request.onsuccess = function(event) {
        console.log("Success!");
      };
    }
  }

  remove(key, type = "local") {
    if (type === "local") {
      this._remove(key);
    } else if (type === "indexed") {
      const transaction = this.db.transaction(["echo"], "readwrite");
      const objectStore = transaction.objectStore("echo");
      const request = objectStore.delete(key);
      request.onsuccess = function(event) {
        console.log("Success!");
      };
    }
  }
}

export default Storage;