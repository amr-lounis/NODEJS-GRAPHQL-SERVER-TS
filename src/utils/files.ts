import axios from "axios";

export const getImageAsBase64 = async (url) => {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer', // Set the response type to arraybuffer to handle binary data
        });
        return Buffer.from(response.data, 'binary').toString('base64');
    } catch (error) { return ""; }
}
