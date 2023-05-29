export async function call(path, method = "GET", body = null) {
    console.log("new request", path, method, body);
    return new Promise((resolve, reject) => {
        // if method is not GET, then add the body to the request
        if (method !== "GET" && body === null) reject("Body is null");
        if (method === "GET" && body !== null) reject("Body is not null");

        if (method !== "GET")
            fetch('http://localhost:6980/' + path, {
                method: method,
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                    "Authentication": "Bearer " + localStorage.getItem("token")
                },
                body
            })
            .then((response) => { return response.json(); })
            .then((data) => { resolve(data); })
            .catch(reject);
        else
            fetch('http://localhost:6980/' + path, {
                method: method,
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                    "Authentication": "Bearer " + localStorage.getItem("token")
                },
            })
            .then((response) => { return response.json(); })
            .then((data) => { resolve(data); })
            .catch(reject);
    });
}

export async function login(path) {
    return new Promise((resolve, reject) => {
        fetch('http://localhost:6980/' + path, {
            method: "GET",
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then((response) => { return response.json(); })
        .then((data) => { resolve(data); })
        .catch(reject);
    });
}

export async function getRooms() {
    return new Promise((resolve, reject) => {
        fetch("https://timspik.ddns.net/getRooms")
            .then(async (response) => {
                const data = await response.json();
                resolve(data);
            })
            .catch(reject);
    })
}