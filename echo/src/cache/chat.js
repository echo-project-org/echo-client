class Chat {
    constructor() {
        this.messages = [];
        this.cached = false;
    }
    
    add(message) {
        message.dateDisplay = this.convertDate(message.date);
        this.messages.push(message);
        this.cached = true;
        return message;
    }
    
    get() {
        return this.messages;
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

export default Chat;