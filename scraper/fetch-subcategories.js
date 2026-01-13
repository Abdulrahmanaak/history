import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categoriesPath = path.join(__dirname, '..', 'data', 'categories.json');

const DELAY_MS = 1000;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchSubCategories() {
    try {
        console.log('Loading categories.json...');
        const data = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

        console.log(`Found ${data.categories.length} main categories.`);

        let totalSubCats = 0;

        for (const category of data.categories) {
            console.log(`Fetching sub-categories for: ${category.name} (ID: ${category.id})...`);

            try {
                const response = await axios.get(`https://dorar.net/history/subcats/${category.id}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });

                const $ = cheerio.load(response.data);
                const subCategories = [];

                $('option').each((i, el) => {
                    const id = $(el).attr('value');
                    const name = $(el).text().trim();

                    // Filter out empty or placeholder values if necessary
                    // The API seems to just return valid options
                    if (id && name) {
                        subCategories.push({ id, name });
                    }
                });

                category.subCategories = subCategories;
                totalSubCats += subCategories.length;
                console.log(`  -> Found ${subCategories.length} sub-categories.`);

            } catch (err) {
                console.error(`  -> Error fetching sub-categories for ID ${category.id}:`, err.message);
            }

            await delay(DELAY_MS);
        }

        data.statistics.totalSubCategories = totalSubCats;
        data.lastUpdated = new Date().toISOString();

        console.log('Saving updated categories.json...');
        fs.writeFileSync(categoriesPath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Done! Total sub-categories collected: ${totalSubCats}`);

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

fetchSubCategories();
