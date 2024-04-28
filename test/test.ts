import { faker } from "@faker-js/faker";
const axios = require('axios');

const getImageAsBase64 = async (url) => {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer', // Set the response type to arraybuffer to handle binary data
        });
        return Buffer.from(response.data, 'binary').toString('base64');
    } catch (error) { return ""; }
}

getImageAsBase64(faker.image.avatar())
    .then((base64Data) => {
        console.log('Base64 image data:', base64Data);
    })
    .catch((error) => { });

console.log()