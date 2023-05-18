export async function call(endpoint) {
    const res = await fetch('https://timspik.ddns.net/' + endpoint);
    return res;
}