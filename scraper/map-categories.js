import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsPath = path.join(__dirname, '..', 'data', 'events.json');
const categoriesPath = path.join(__dirname, '..', 'data', 'categories.json');

const DELAY_MS = 1000;
const SUBCAT_DELAY_MS = 500;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function mapCategories() {
    console.log('Loading data...');
    let events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

    // Map for lookup
    const eventsMap = new Map();
    events.forEach(e => {
        // Initialize distinct 'categories' array if not present
        if (!e.categories) e.categories = [];

        // Migrate legacy single fields if they exist
        if (e.category || e.subCategory) {
            const catExists = e.categories.some(c => c.id === e.category?.id && c.subCategory?.id === e.subCategory?.id);
            if (!catExists && e.category) {
                e.categories.push({
                    id: e.category.id,
                    name: e.category.name,
                    subCategory: e.subCategory ? { id: e.subCategory.id, name: e.subCategory.name } : null
                });
            }
            // Clear legacy fields
            delete e.category;
            delete e.subCategory;
        }

        eventsMap.set(String(e.dorarId), e);
    });

    console.log(`Loaded ${events.length} events. Starting multi-category mapping...`);

    let updatedCount = 0;

    for (const category of categoriesData.categories) {
        console.log(`Processing Main Category: ${category.name} (${category.id})`);

        if (!category.subCategories) continue;

        for (const sub of category.subCategories) {
            console.log(`  > Scraping Sub-category: ${sub.name} (${sub.id})...`);

            let page = 1;
            let hasNextPage = true;
            let subCatEventsFound = 0;

            while (hasNextPage) {
                try {
                    const url = `https://dorar.net/history/search?category=${category.id}&subcat=${sub.id}&page=${page}`;
                    const response = await axios.get(url, {
                        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
                        timeout: 10000
                    });

                    const $ = cheerio.load(response.data);
                    const eventLinks = $('.card a[href*="history/event/"]');

                    if (eventLinks.length === 0) {
                        hasNextPage = false;
                        break;
                    }

                    eventLinks.each((i, el) => {
                        const href = $(el).attr('href');
                        const match = href.match(/event\/(\d+)/);
                        if (match) {
                            const dorarId = match[1];
                            const event = eventsMap.get(dorarId);

                            if (event) {
                                // Add new category if it doesn't exist
                                const exists = event.categories.some(c =>
                                    c.id == category.id &&
                                    c.subCategory && c.subCategory.id == sub.id
                                );

                                if (!exists) {
                                    event.categories.push({
                                        id: category.id,
                                        name: category.name,
                                        subCategory: { id: sub.id, name: sub.name }
                                    });
                                    subCatEventsFound++;
                                    updatedCount++;
                                }
                            }
                        }
                    });

                    const nextLink = $('a[rel="next"]');
                    if (nextLink.length > 0) {
                        page++;
                        await delay(DELAY_MS);
                    } else {
                        hasNextPage = false;
                    }

                } catch (err) {
                    console.error(`    Error scraping ${category.name}/${sub.name} page ${page}: ${err.message}`);
                    hasNextPage = false;
                }
            }

            if (subCatEventsFound > 0) {
                console.log(`    Mapped ${subCatEventsFound} events to ${sub.name}.`);
            }

            await delay(SUBCAT_DELAY_MS);
        }

        console.log(`Saving progress... (Total updates: ${updatedCount})`);
        fs.writeFileSync(eventsPath, JSON.stringify(Array.from(eventsMap.values()), null, 2), 'utf8');
    }

    console.log('Final save...');
    fs.writeFileSync(eventsPath, JSON.stringify(Array.from(eventsMap.values()), null, 2), 'utf8');
    console.log(`Done! Mapped ${updatedCount} category assignments.`);
}

mapCategories();
