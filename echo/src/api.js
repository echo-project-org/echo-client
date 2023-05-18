module.exports = {
     call: async function(endpoint) {
        const res = await fetch('https://timspik.ddns.net/' + endpoint)
        return res;
    }
}