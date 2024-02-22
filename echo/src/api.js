import { storage, ep } from './index';


const API_URL = "https://echo.kuricki.com/api/";
// const API_URL = "http://localhost:6980/api/";

export async function call(path, method = "GET", body = null, forceString = true, forceContentType = false) {
  return new Promise((resolve, reject) => {
    // if method is not GET, then add the body to the request
    if (method !== "GET" && body === null) reject("Body is null");
    if (method === "GET" && body !== null) reject("Body is not null");

    const options = {
      method: method,
      cache: 'no-cache',
      cors: false,
      headers: new Headers({
        'Content-Type': forceContentType ? null : 'application/json',
        "Authorization": storage.get("token")
      }),
      body: body ? (forceString ? JSON.stringify(body) : body) : null
    };

    fetch(API_URL + path, options)
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
    switch (status) {
      case 400:
        // Bad request
        console.warn(status + ": Bad request");
        break;
      case 401:
        // Unauthorized
        ep.apiUnauthorized();
        console.warn(status + ": Unauthorized");
        break;
      case 403:
        // Forbidden
        console.warn(status + ": Forbidden");
        break;
      case 413:
        // Payload too large
        console.warn(status + ": Payload too large");
        break;
      case 404:
        // Not found
        console.warn(status + ": Not found");
        break;
      case 500:
        // Internal server error
        console.warn(status + ": Internal server error");
        break;
      default:
        console.warn(status + ": Unknown error");
        break;
    }
  }
  return response;
}