
const fs = require('fs');
const events = require('./data/events.json');

const matchingEvents = events.filter(e => {
    const isEra = e.era && e.era.name === "عصر النبوة";
    const isCat = e.categories && e.categories.some(c => c.name === "المعالم الإسلامية");
    return isEra && isCat;
});

console.log(`Found ${matchingEvents.length} matching events.`);
matchingEvents.forEach(e => {
    console.log(`- ${e.title} (ID: ${e.id})`);
});
