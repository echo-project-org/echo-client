const crypto = require("node:crypto");
const fs = require("node:fs");
const { log } = require('@lib/logger');

const ALGORITHM_NAME = "aes-256-cbc";
const ALGORITHM_IV_SIZE = 16;
const ALGORITHM_KEY_SIZE = 32;
const PBKDF2_NAME = "sha256";
const PBKDF2_SALT_SIZE = 16;
const PBKDF2_ITERATIONS = 32767;

function encryptString(plaintext, password) {
    // Generate a 128-bit salt using a CSPRNG.
    let salt = crypto.randomBytes(PBKDF2_SALT_SIZE);
    // Derive a key using PBKDF2.
    let key = crypto.pbkdf2Sync(Buffer.from(password, "utf8"), salt, PBKDF2_ITERATIONS, ALGORITHM_KEY_SIZE, PBKDF2_NAME);
    // Encrypt and prepend salt.
    let ciphertextAndIvAndSalt = Buffer.concat([salt, encrypt(Buffer.from(plaintext, "utf8"), key)]);
    // Return as base64 string.
    return ciphertextAndIvAndSalt.toString("base64");
}

function decryptString(base64CiphertextAndIvAndSalt, password) {
    // Decode the base64.
    let ciphertextAndIvAndSalt = Buffer.from(base64CiphertextAndIvAndSalt, "base64");
    // Create buffers of salt and ciphertextAndIv.
    let salt = ciphertextAndIvAndSalt.slice(0, PBKDF2_SALT_SIZE);
    let ciphertextAndIv = ciphertextAndIvAndSalt.slice(PBKDF2_SALT_SIZE);
    // Derive the key using PBKDF2.
    let key = crypto.pbkdf2Sync(Buffer.from(password, "utf8"), salt, PBKDF2_ITERATIONS, ALGORITHM_KEY_SIZE, PBKDF2_NAME);
    // Decrypt and return result.
    return decrypt(ciphertextAndIv, key).toString("utf8");
}

function encrypt(plaintext, key) {
    // Generate a 128-bit IV using a CSPRNG.
    let iv = crypto.randomBytes(ALGORITHM_IV_SIZE);
    // Create the cipher instance.
    let cipher = crypto.createCipheriv(ALGORITHM_NAME, key, iv);
    // Encrypt and prepend IV.
    let ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    return Buffer.concat([iv, ciphertext]);
}

function decrypt(ciphertextAndIv, key) {
    // Create buffers of IV and ciphertext.
    let iv = ciphertextAndIv.slice(0, ALGORITHM_IV_SIZE);
    let ciphertext = ciphertextAndIv.slice(ALGORITHM_IV_SIZE);
    // Create the cipher instance.
    let decipher = crypto.createDecipheriv(ALGORITHM_NAME, key, iv);
    // Decrypt and return result.
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

// const mod = crypto.getDiffieHellman("modp15");
// console.log(mod.getPrime().toString("hex"));

// const keys = mod.generateKeys();
// console.log(keys.toString("hex"));

const makeUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export const initCommunication = () => {
    return new Promise((resolve, reject) => {
        fetch("http://localhost:3000/init", {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                log("[initCommunication] Data received from server: ", data);
                if (!data || !data.prime || !data.publicKey) {
                    log("[initCommunication] Error: Invalid data received from server");
                    reject(new Error("Invalid data received from server"));
                    return;
                }
                log("[initCommunication] Data received from server: ", data);

                const prime = data.prime;
                const publicKey = data.publicKey;

                const mod = crypto.createDiffieHellman(prime, "hex");
                mod.generateKeys();
                const myPublicKey = mod.getPublicKey().toString("hex");

                const secret = mod.computeSecret(publicKey, "hex");
                log("---------------------")
                log("Shared secret: " + secret.toString("hex"));
                log("---------------------")

                let rsaPublicKey = "";
                let rsaPrivateKey = "";
                let uuid = "";

                // save keys in the electron folder if we are in a development environment
                // otherwise save keys in the current folder
                let keyPath = "";
                if (process.env.NODE_ENV === "development") {
                    keyPath = "./keys/";
                } else {
                    keyPath = "./keys/";
                }

                // create keys folder if it doesn't exist
                if (!fs.existsSync("keys")) {
                    fs.mkdirSync("keys");
                }

                if (fs.existsSync("keys/private.pem") && fs.existsSync("keys/public.pem")) {
                    rsaPublicKey = fs.readFileSync("keys/public.pem", "utf-8");
                    rsaPrivateKey = fs.readFileSync("keys/private.pem", "utf-8");
                    uuid = fs.readFileSync("keys/uuid.txt", "utf-8");
                } else {
                    const rsa = crypto.generateKeyPairSync("rsa", {
                        modulusLength: 2048,
                        publicKeyEncoding: {
                            type: 'spki',
                            format: 'pem'
                        },
                        privateKeyEncoding: {
                            type: 'pkcs8',
                            format: 'pem',
                        }
                    });

                    rsaPrivateKey = rsa.privateKey.toString("base64");
                    rsaPublicKey = rsa.publicKey.toString("base64");
                    uuid = makeUUID();

                    // save private and public key to file
                    fs.writeFileSync("keys/private.pem", rsaPrivateKey);
                    fs.writeFileSync("keys/public.pem", rsaPublicKey);
                }

                const sharedSecret = secret.toString("hex");
                console.log("UUID: " + uuid);
                fs.writeFileSync("keys/uuid.txt", uuid);

                const toEncryptPayload = {
                    secret: sharedSecret,
                    rsaPublicKey: rsaPublicKey,
                    uuid: uuid,
                };

                const toEncrypt = Buffer.from(JSON.stringify(toEncryptPayload)).toString("base64");
                // encrypt payload with shared secret
                const encrypted = encryptString(toEncrypt, secret).toString("base64");
                console.log("Encrypted: " + encrypted);

                resolve({
                    publicKey: myPublicKey,
                    encrypted: encrypted,
                })
            })
            .catch((err) => {
                log("[initCommunication] Error: ", err);
                reject(err);
            });
    });
}

export const verifyCommunication = (data) => {
    return new Promise((resolve, reject) => {
        fetch("http://localhost:3000/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                publicKey: data.publicKey,
                encrypted: data.encrypted,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                log("[verifyCommunication] Data received from server: ", data);
                if (!data || !data.success) {
                    log("[verifyCommunication] Error: Invalid data received from server");
                    reject(new Error("Invalid data received from server"));
                    return;
                }
                resolve(data);
            })
            .catch((err) => {
                log("[verifyCommunication] Error: ", err);
                reject(err);
            });
    });
}

// check if private.pem and public.pem exist

if (fs.existsSync("keys/private.pem") && fs.existsSync("keys/public.pem")) {
    const privateKey = fs.readFileSync("keys/private.pem", "utf-8");
    const publicKey = fs.readFileSync("keys/public.pem", "utf-8");
    const uuid = fs.readFileSync("keys/uuid.txt", "utf-8");

    const veryCoolMessage = "Hello, this is a very cool message";
    const toEncrypt = Buffer.from(veryCoolMessage);

    const encrypted = crypto.privateEncrypt(privateKey, toEncrypt);
    console.log("Encrypted: " + encrypted.toString("hex"));

    fetch("http://localhost:3000/sendData", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message: encrypted.toString("hex"),
            uuid: uuid,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            if (data.success) {
                console.log("Data sent successfully");
            } else {
                console.log("Data not sent");
                initCommunication();
            }
        })
        .catch((err) => {
            console.log(err);
            initCommunication();
        });

} else {
    initCommunication();
}