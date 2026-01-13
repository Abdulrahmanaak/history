
const fs = require('fs');

const eventsPath = './data/events.json';
const events = require(eventsPath);

const imageMap = {
    12: 'images/event_12.png',
    46: 'images/event_46.png',
    47: 'images/event_47.png',
    59: 'images/event_59.png',
    128: 'images/event_128.png'
};

let updatedCount = 0;

events.forEach(event => {
    if (imageMap[event.id]) {
        event.image = imageMap[event.id];
        updatedCount++;
    }
});

fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf8');
console.log(`Updated ${updatedCount} events with images.`);
