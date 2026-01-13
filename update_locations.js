const fs = require('fs');

const eventsFilePath = 'd:/history/data/events.json';
const events = JSON.parse(fs.readFileSync(eventsFilePath, 'utf8'));

const updates = {
    12: { location: "مكة المكرمة", lat: 21.4225, lng: 39.8262 },
    46: { location: "مسجد قباء", lat: 24.4393, lng: 39.6173 },
    47: { location: "المسجد النبوي", lat: 24.4672, lng: 39.6112 },
    59: { location: "المدينة المنورة", lat: 24.4842, lng: 39.5786 },
    128: { location: "شمال وادي القرى", lat: 27.0000, lng: 38.0000 }
};

let updatedCount = 0;
events.forEach(event => {
    if (updates[event.id]) {
        Object.assign(event, updates[event.id]);
        updatedCount++;
    }
});

fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2));
console.log(`Updated ${updatedCount} events.`);
