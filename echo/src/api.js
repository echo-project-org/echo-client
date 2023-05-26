export async function call(endpoint) {
    return new Promise((resolve, reject) => {
        fetch('https://timspik.ddns.net/' + endpoint)
            .then((response) => {
                resolve(response);
            })
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