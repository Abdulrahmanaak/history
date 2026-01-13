const fs = require('fs');

const events = JSON.parse(fs.readFileSync('d:/history/data/events.json', 'utf8'));
const targetIds = [12, 46, 47, 59, 128];
const verified = [];

events.forEach(event => {
    if (targetIds.includes(event.id)) {
        verified.push({
            id: event.id,
            title: event.title,
            location: event.location,
            lat: event.lat,
            lng: event.lng
        });
    }
});

fs.writeFileSync('verification_result.json', JSON.stringify(verified, null, 2));
