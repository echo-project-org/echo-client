class Chat {
    constructor(roomId) {
        this.roomId = roomId;
        this.messages = new Object();
    }

    sendMessage(message) {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const date = new Date();

        var hours = date.getHours();
        var minutes = date.getMinutes();
        var timeZone = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;

        this.messages.push({
            date,
            message,
            dateDisplay: days[d.getDay()] + ", " + monthNames[d.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " " + hours + ':' + minutes + ' ' + timeZone
        })
    }
}

module.exports = Chat;