export async function call(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    // if method is not GET, then add the body to the request
    if (method !== "GET" && body === null) reject("Body is null");
    if (method === "GET" && body !== null) reject("Body is not null");

    var options;

    if (method === "GET")
      options = {
        method: method,
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("token")
        }
      }
    else
      options = {
        method: method,
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: typeof body === "string" ? body : JSON.stringify(body)
      }


    fetch(process.env.API_URL + path, options)
      .then((response) => {
        return new Promise((resolve) => response.json()
          .then((json) => resolve(
            {
              status: response.status,
              ok: response.ok,
              json,
            }
          )));
      })
      .then(({ status, json, ok }) => {
        if (!handleErrors(status, json)) return reject({ status, message: json.message || "Something went wrong :(" });
        if (!ok) return reject({ status, message: json.message });
        if (typeof json === "string") json = JSON.parse(json);
        resolve({ status, message: json.message, json, ok });
      })
      .catch(reject);
  });
}

const handleErrors = (status, response) => {
  if (status !== 200) {
    if (response.message) {
      console.log(status + ": " + response.message);
      return false;
    }
    else
      switch (status) {
        case 400:
          // Bad request
          console.log(status + ": Bad request");
          break;
        case 401:
          // Unauthorized
          console.log(status + ": Unauthorized");
          break;
        case 403:
          // Forbidden
          console.log(status + ": Forbidden");
          break;
        case 404:
          // Not found
          console.log(status + ": Not found");
          break;
        case 500:
          // Internal server error
          console.log(status + ": Internal server error");
          break;
        default:
          console.log(status + ": Unknown error");
          break;
      }
  }
  return response;
}