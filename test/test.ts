import { faker } from "@faker-js/faker";
const axios = require('axios');

const getImageAsBase64 = async (url) => {
    try {
        // Fetch the image using axios
        const response = await axios.get(url, {
            responseType: 'arraybuffer', // Set the response type to arraybuffer to handle binary data
        });

        // Convert the image data to base64
        const imageData = Buffer.from(response.data, 'binary').toString('base64');

        return imageData;
    } catch (error) {
        console.error('Error fetching image:', error);
        throw error;
    }
}

getImageAsBase64(faker.image.avatar())
    .then((base64Data) => {
        console.log('Base64 image data:', base64Data);
    })
    .catch((error) => { });

console.log()