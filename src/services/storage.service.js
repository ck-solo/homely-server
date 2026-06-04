import ImageKit from "@imagekit/nodejs";
import envConfig from "../config/env.config.js";

const imagekit = new ImageKit({
    publicKey: envConfig.IMAGEKIT_PUBLIC_KEY,
    privateKey: envConfig.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: envConfig.IMAGEKIT_URL_ENDPOINT,
});

const uploadFile = async (buffer, fileName = "file", folder = "/homely") => {
  try {
    const result = await imagekit.files.upload({
      file: buffer.toString("base64"),
      fileName: fileName + "-" + Date.now(),
      folder: folder
    })
    return result;
  } catch (error) {
    console.error("ImageKit Upload Error:", error);
    return null;
  }
}

export default uploadFile;