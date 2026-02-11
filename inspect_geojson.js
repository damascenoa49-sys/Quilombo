const fs = require('fs');

try {
    const rawData = fs.readFileSync('Municipios-MA.json');
    const data = JSON.parse(rawData);

    if (data.features && data.features.length > 0) {
        console.log("First Feature Properties:", JSON.stringify(data.features[0].properties, null, 2));
    } else {
        console.log("No features found.");
    }
} catch (error) {
    console.error("Error reading or parsing file:", error);
}
