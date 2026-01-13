const fs = require('fs');
const events = JSON.parse(fs.readFileSync('d:/history/data/events.json', 'utf8'));
const eventsWithImages = events.filter(e => e.image);
fs.writeFileSync('images_list.json', JSON.stringify(eventsWithImages.map(e => ({ id: e.id, title: e.title, image: e.image })), null, 2));
