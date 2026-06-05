const fs = require('fs');

function updateJson(filePath, newKeys) {
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.soilTest = newKeys;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

updateJson('./src/localization/resources/en.json', {
  "title": "Soil Health Check",
  "subtitle": "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ತಪಾಸಣೆ",
  "analyzing": "Analyzing soil data...",
  "error": "Failed to fetch soil data. Please try again.",
  "retry": "Retry",
  "getLocation": "Get My Location",
  "idealFor": "Ideal for most crops",
  "soilPh": "Soil pH / ಮಣ್ಣಿನ pH",
  "nitrogen": "Nitrogen / ಸಾರಜನಕ",
  "organic": "Organic / ಸಾವಯವ",
  "viewGuide": "View Fertilizer Guide",
  "acidic": "Acidic / ಆಮ್ಲಿಯ",
  "neutral": "Neutral / ತಟಸ್ಥ",
  "alkaline": "Alkaline / ಕ್ಷಾರೀಯ",
  "high": "High / ಹೆಚ್ಚಿನ",
  "medium": "Medium / ಮಧ್ಯಮ",
  "low": "Low / ಕಡಿಮೆ",
  "soilTypeMap": {
    "Clay Loam": "Clay Loam / ಲೋಮಿ ಮಣ್ಣು",
    "Loamy": "Loamy Soil / ಲೋಮಿ ಮಣ್ಣು"
  }
});

updateJson('./src/localization/resources/kn.json', {
  "title": "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ತಪಾಸಣೆ",
  "subtitle": "Soil Health Check",
  "analyzing": "ಮಣ್ಣಿನ ಡೇಟಾವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
  "error": "ಮಣ್ಣಿನ ಡೇಟಾ ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  "retry": "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
  "getLocation": "ನನ್ನ ಸ್ಥಳವನ್ನು ಪಡೆಯಿರಿ",
  "idealFor": "ಹೆಚ್ಚಿನ ಬೆಳೆಗಳಿಗೆ ಸೂಕ್ತವಾಗಿದೆ",
  "soilPh": "ಮಣ್ಣಿನ pH",
  "nitrogen": "ಸಾರಜನಕ",
  "organic": "ಸಾವಯವ",
  "viewGuide": "ಗೊಬ್ಬರ ಮಾರ್ಗದರ್ಶಿ ನೋಡಿ",
  "acidic": "ಆಮ್ಲಿಯ",
  "neutral": "ತಟಸ್ಥ",
  "alkaline": "ಕ್ಷಾರೀಯ",
  "high": "ಹೆಚ್ಚಿನ",
  "medium": "ಮಧ್ಯಮ",
  "low": "ಕಡಿಮೆ",
  "soilTypeMap": {
    "Clay Loam": "ಲೋಮಿ ಮಣ್ಣು",
    "Loamy": "ಲೋಮಿ ಮಣ್ಣು"
  }
});

console.log("Updated translation files");
