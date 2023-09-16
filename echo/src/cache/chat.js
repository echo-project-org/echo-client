class Chat {
    constructor() {
        this.messages = [];
        this.cached = false;
    }

    add(message) {
        message.dateDisplay = this.convertDate(message.date);
        this.messages.push(message);
        if (!message.insertDate && message.date) message.insertDate = message.date;
        this.cached = true;
        return message;
    }

    get() {
        // sort messages by insertDate and most recent last
        this.messages = this.messages.sort((a, b) => {
            return new Date(b.insertDate) - new Date(a.insertDate);
        });
        console.log("[CACHE] Got messages from cache", this.messages);
        return this.messages;
    }

    clear() {
        this.messages = [];
        this.cached = false;
    }

    updateUser(data) {
        this.messages.forEach((message) => {
            if (String(message.userId) === String(data.id)) {
                if (data.field === "userImage") message.img = data.value;
                if (data.field === "name") message.name = data.value;
            }
        });
    }

    // convert date to current timezone and display format
    convertDate(date) {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dateObj = new Date(date);

        var hours = dateObj.getHours();
        var minutes = dateObj.getMinutes();
        var timeZone = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;

        return days[dateObj.getDay()] + ", " + monthNames[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear() + " " + hours + ':' + minutes + ' ' + timeZone;
    }
}

// https://en.wikipedia.org/wiki/Schwartzian_transform
// (function () {
//     if (typeof Object.defineProperty === 'function') {
//         try { Object.defineProperty(Array.prototype, 'sortBy', { value: sb }); } catch (e) { }
//     }
//     if (!Array.prototype.sortBy) Array.prototype.sortBy = sb;

//     function sb(f) {
//         for (var i = this.length; i;) {
//             var o = this[--i];
//             this[i] = [].concat(f.call(o, o, i), o);
//         }
//         this.sort(function (a, b) {
//             for (var i = 0, len = a.length; i < len; ++i) {
//                 if (a[i] != b[i]) return a[i] < b[i] ? -1 : 1;
//             }
//             return 0;
//         });
//         for (var i = this.length; i;) {
//             this[--i] = this[i][this[i].length - 1];
//         }
//         return this;
//     }
// })();

export default Chat;