import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsPath = path.join(__dirname, '..', 'data', 'events.json');

// Eras Definition from Dorar.net
const ERAS_MAP = [
    { id: 1, name: 'عصر النبوة', start: -100, end: 11 },
    { id: 2, name: 'عصر الخلافة الراشدة', start: 11, end: 41 },
    { id: 3, name: 'العصر الأموي', start: 41, end: 132 },
    { id: 4, name: 'العصر العباسي', start: 132, end: 656 },
    { id: 5, name: 'عصر المماليك', start: 656, end: 923 },
    { id: 6, name: 'العصر العثماني', start: 923, end: 1336 },
    { id: 7, name: 'التاريخ المعاصر', start: 1336, end: 1500 }
];

function fixEvents() {
    console.log('Loading events...');
    const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

    let fixedCount = 0;

    events.forEach(event => {
        let year = event.hijriYear;
        const greg = event.gregorianYear;

        // Logic to correct wrong eras or missing eras
        // If Gregorian is < 622, it is definitely Era 1 (Pre-Hijra/Prophet)
        if (greg && greg < 622) {
            if (!event.era || event.era.id !== 1) {
                event.era = { id: 1, name: 'عصر النبوة' };
                // Optional: Fix hijriYear to be negative if it's currently positive?
                // Let's assume the user just wants the Era fixed for sorting/filtering.
                fixedCount++;
            }
            return; // Done
        }

        // For dates >= 622, trust the Hijri year comparison
        // But what if the Era was assigned wrongly by my previous bad script?
        // I should re-evaluate ALL eras to be safe, or at least Eras 1, 2, 3 where confusion happened.

        // Let's re-run assignment for everything to ensure correctness
        const correctEra = ERAS_MAP.find(e => year >= e.start && year < e.end);

        // Fallback for late dates
        let assignedEra = correctEra;
        if (!assignedEra && year >= 1336) {
            assignedEra = { id: 7, name: 'التاريخ المعاصر' };
        }

        if (assignedEra) {
            // Only update if different (to avoid noise, though overwriting is fine)
            if (!event.era || event.era.id !== assignedEra.id) {
                event.era = {
                    id: assignedEra.id,
                    name: assignedEra.name
                };
                fixedCount++;
            }
        }
    });

    console.log(`Refined Eras for ${fixedCount} events.`);

    fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf8');
    console.log('Saved updated events.json');
}

fixEvents();
