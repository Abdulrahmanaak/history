import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsPath = path.join(__dirname, '..', 'data', 'events.json');

function fixPreHijraDates() {
    console.log('Loading events...');
    const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

    let modifiedCount = 0;

    events.forEach(event => {
        const greg = event.gregorianYear;
        const hijri = event.hijriYear;

        // Check if Pre-Hijra (Gregorian < 622) AND hijriYear is currently a number (not already fixed)
        if (greg && greg < 622 && typeof hijri === 'number') {
            // Append ' ق.هـ' to the year
            // The number '53' in the source for 571 AD means 53 Before Hijra.
            // Result should be "53 ق.هـ"
            event.hijriYear = `${hijri} ق.هـ`;
            modifiedCount++;
        }
    });

    console.log(`Updated ${modifiedCount} pre-Hijra events.`);

    fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf8');
    console.log('Saved events.json');
}

fixPreHijraDates();
