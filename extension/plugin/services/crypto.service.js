export class CryptoService {
  async secureSerializePayload(payload) {
    const plain = JSON.stringify(payload);
    const { ciphertext, keyA, ivA, keyB, ivB } = await this.doubleEncryptString(
      plain
    );
    const decrypted = await this.doubleDecryptString(
      ciphertext,
      keyA,
      ivA,
      keyB,
      ivB
    );
    const parsed = JSON.parse(decrypted);
    return JSON.stringify(parsed, null, 2);
  }

  async doubleEncryptString(plainText) {
    const keyA = await this.generateKey();
    const keyB = await this.generateKey();

    const first = await this.encryptString(plainText, keyA);
    const second = await this.encryptString(JSON.stringify(first), keyB);

    return {
      ciphertext: second,
      keyA,
      ivA: first.iv,
      keyB,
      ivB: second.iv,
    };
  }

  async doubleDecryptString(cipherObj, keyA, ivA, keyB, ivB) {
    const innerJson = await this.decryptToString(
      { iv: ivB, data: cipherObj.data },
      keyB
    );
    const inner = JSON.parse(innerJson);
    const plain = await this.decryptToString(
      { iv: ivA, data: inner.data },
      keyA
    );
    return plain;
  }

  async generateKey() {
    return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
      "encrypt",
      "decrypt",
    ]);
  }

  async encryptString(str, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(str);
    const buf = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );
    return { iv: this.bufferToBase64(iv), data: this.bufferToBase64(buf) };
  }

  async decryptToString({ iv, data }, key) {
    const ivBuf = this.base64ToBuffer(iv);
    const dataBuf = this.base64ToBuffer(data);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuf },
      key,
      dataBuf
    );
    return new TextDecoder().decode(decrypted);
  }

  bufferToBase64(buffer) {
    const bytes =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  base64ToBuffer(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
