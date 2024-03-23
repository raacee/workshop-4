import {webcrypto} from "crypto";

// #############
// ### Utils ###
// #############

// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

// Generates a pair of private / public RSA keys
type GenerateRsaKeyPair = {
  publicKey: webcrypto.CryptoKey;
  privateKey: webcrypto.CryptoKey;
};

export async function generateRsaKeyPair(): Promise<GenerateRsaKeyPair> {
  const algorithm = {
    name: "RSA-OAEP",
    modulusLength: 2048, // RSA key size in bits
    publicExponent: new Uint8Array([1, 0, 1]), // public exponent value
    hash: "SHA-256", // hash function used for OAEP
  };

  const keyPair = await webcrypto.subtle.generateKey(
      algorithm,
      true, // whether the key is extractable
      ["encrypt", "decrypt"] // key usages
  );

  const publicKey = keyPair.publicKey;
  const privateKey = keyPair.privateKey;

  return { publicKey, privateKey };
}

// Export a crypto public key to a base64 string format
export async function exportPubKey(key: webcrypto.CryptoKey): Promise<string> {
  const keyData = await webcrypto.subtle.exportKey("spki", key);
  return arrayBufferToBase64(keyData);
}

// Export a crypto private key to a base64 string format
export async function exportPrvKey(
    key: webcrypto.CryptoKey | null
): Promise<string | null> {
  if (!key) {
    return null;
  }

  const keyData = await webcrypto.subtle.exportKey("pkcs8", key);
  return arrayBufferToBase64(keyData);
}


// Import a base64 string public key to its native format
export async function importPubKey(
    strKey: string
): Promise<webcrypto.CryptoKey> {
  const keyData = base64ToArrayBuffer(strKey);
  return await webcrypto.subtle.importKey(
      "spki",
      keyData,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
  );
}


// Import a base64 string private key to its native format
export async function importPrvKey(
    strKey: string
): Promise<webcrypto.CryptoKey> {
  const keyData = base64ToArrayBuffer(strKey);
  return await webcrypto.subtle.importKey(
      "pkcs8",
      keyData,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["decrypt"]
  );
}


// Encrypt a message using an RSA public key
export async function rsaEncrypt(
    b64Data: string,
    strPublicKey: string
): Promise<string> {
  const data = base64ToArrayBuffer(b64Data);
  const publicKey = await importPubKey(strPublicKey);
  const encryptedData = await webcrypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      data
  );
  return arrayBufferToBase64(encryptedData);
}

// Decrypts a message using an RSA private key
export async function rsaDecrypt(
    data: string,
    privateKey: webcrypto.CryptoKey
): Promise<string> {
  const encryptedData = base64ToArrayBuffer(data);
  const decryptedData = await webcrypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encryptedData
  );
  const decryptedText = new TextDecoder().decode(new Uint8Array(decryptedData));
  return arrayBufferToBase64(new TextEncoder().encode(decryptedText));
}


// ######################
// ### Symmetric keys ###
// ######################

// Generates a random symmetric key
export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  const algorithm = {
    name: "AES-CBC",
    length: 256, // key length in bits
  };
  return await webcrypto.subtle.generateKey(
    algorithm,
    true, // whether the key is extractable
    ["encrypt", "decrypt"] // key usages
  );
}


// Export a crypto symmetric key to a base64 string format
export async function exportSymKey(key: webcrypto.CryptoKey): Promise<string> {
  const keyData = await webcrypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(keyData);
}


// Import a base64 string format to its crypto native format
export async function importSymKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  const keyData = base64ToArrayBuffer(strKey);
  return await webcrypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "AES-CBC",
    },
    true,
    ["encrypt", "decrypt"]
  );
}


// Encrypt a message using a symmetric key
export async function symEncrypt(
    key: webcrypto.CryptoKey,
    data: string
): Promise<string> {
  const dataUint8Array = new TextEncoder().encode(data);
  const iv = webcrypto.getRandomValues(new Uint8Array(16)); // generate a random initialization vector
  const encryptedData = await webcrypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      key,
      dataUint8Array
  );
  const encryptedDataBase64 = arrayBufferToBase64(encryptedData);
  const ivBase64 = arrayBufferToBase64(iv);
  return `${ivBase64}.${encryptedDataBase64}`;
}


// Decrypt a message using a symmetric key
export async function symDecrypt(
    strKey: string,
    encryptedData: string
): Promise<string> {
  const [ivBase64, encryptedDataBase64] = encryptedData.split(".");
  const iv = base64ToArrayBuffer(ivBase64);
  const encryptedDataUint8Array = base64ToArrayBuffer(encryptedDataBase64);
  const key = await importSymKey(strKey);
  const decryptedData = await webcrypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      key,
      encryptedDataUint8Array
  );
  return new TextDecoder().decode(decryptedData);
}
