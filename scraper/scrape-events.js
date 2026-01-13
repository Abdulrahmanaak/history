/**
 * Dorar.net Events Scraper
 * Collects all 6,153 historical events from the encyclopedia
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://dorar.net';
const SEARCH_URL = `${BASE_URL}/history/search`;
const DELAY_MS = 2000; // Delay between requests
const RESULTS_PER_PAGE = 15;
const SAVE_INTERVAL = 50; // Save progress every N pages

/**
 * Sleep function for delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Load existing progress if any
 */
function loadProgress() {
    const progressPath = path.join(__dirname, '..', 'data', 'scrape_progress.json');
    try {
        if (fs.existsSync(progressPath)) {
            return JSON.parse(fs.readFileSync(progressPath, 'utf8'));
        }
    } catch (error) {
        console.log('No existing progress found, starting fresh');
    }
    return { lastPage: 0, events: [], totalPages: 0 };
}

/**
 * Save progress
 */
function saveProgress(progress) {
    const progressPath = path.join(__dirname, '..', 'data', 'scrape_progress.json');
    fs.mkdirSync(path.dirname(progressPath), { recursive: true });
    fs.writeFileSync(progressPath, JSON.stringify({
        lastPage: progress.lastPage,
        totalPages: progress.totalPages,
        eventsCollected: progress.events.length,
        lastUpdated: new Date().toISOString()
    }, null, 2), 'utf8');
}

/**
 * Save events to file
 */
function saveEvents(events) {
    const eventsPath = path.join(__dirname, '..', 'data', 'events.json');
    fs.mkdirSync(path.dirname(eventsPath), { recursive: true });
    fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf8');
}

/**
 * Get total number of pages
 */
async function getTotalPages() {
    const response = await axios.get(`${SEARCH_URL}?q=&era=0`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });

    const $ = cheerio.load(response.data);
    const totalMatch = $('body').text().match(/عدد النتائج\s*\(\s*([\d,]+)\s*\)/);

    if (totalMatch) {
        const total = parseInt(totalMatch[1].replace(/,/g, ''));
        return Math.ceil(total / RESULTS_PER_PAGE);
    }
    return 411; // Default based on our research
}

/**
 * Parse era from text
 */
function parseEra(text) {
    const eraMap = {
        'النبوة': { id: 1, name: 'عصر النبوة' },
        'الخلافة الراشدة': { id: 2, name: 'عصر الخلافة الراشدة' },
        'الأموي': { id: 3, name: 'العصر الأموي' },
        'العباسي': { id: 4, name: 'العصر العباسي' },
        'المماليك': { id: 5, name: 'عصر المماليك' },
        'العثماني': { id: 6, name: 'العصر العثماني' },
        'المعاصر': { id: 7, name: 'التاريخ المعاصر' }
    };

    for (const [key, value] of Object.entries(eraMap)) {
        if (text.includes(key)) return value;
    }
    return { id: 0, name: 'غير محدد' };
}

/**
 * Scrape a single page
 */
async function scrapePage(pageNum) {
    const url = `${SEARCH_URL}?q=&era=0&page=${pageNum}`;

    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ar,en;q=0.9'
        }
    });

    const $ = cheerio.load(response.data);
    const events = [];

    $('.card').each((index, card) => {
        const $card = $(card);
        const header = $card.find('.card-header');
        const body = $card.find('.collapse, .card-body');

        if (!header.length) return;

        const title = header.find('h6, h5, .h6, .h5').first().text().trim() ||
            header.text().trim().split('\n')[0].trim();

        if (!title || title.includes('موسوعة')) return;

        const bodyText = body.text();

        // Extract years
        const hijriMatch = bodyText.match(/العام الهجري\s*:\s*(\d+)/);
        const gregMatch = bodyText.match(/العام الميلادي\s*:\s*(\d+)/);

        // Extract description
        let description = '';
        const descMatch = bodyText.match(/تفاصيل الحدث:\s*([\s\S]+?)(?=\s*العام الهجري|المراجع|$)/);
        if (descMatch) {
            description = descMatch[1].trim();
        }

        // Extract references
        const references = [];
        const refMatch = bodyText.match(/المراجع:\s*([\s\S]+?)$/);
        if (refMatch) {
            const refText = refMatch[1].trim();
            refText.split(/[،,\n]/).forEach(ref => {
                const r = ref.trim();
                if (r && r.length > 2) references.push(r);
            });
        }

        // Extract event ID from card
        const eventLink = $card.find('a[href*="/history/"]').attr('href');
        const dorarId = eventLink ? eventLink.match(/\/(\d+)/)?.[1] : null;

        // Extract era badge
        const eraBadge = $card.find('.badge, .era-badge').text().trim();
        const era = parseEra(eraBadge || bodyText);

        if (hijriMatch) {
            events.push({
                title: title.substring(0, 200),
                hijriYear: parseInt(hijriMatch[1]),
                gregorianYear: gregMatch ? parseInt(gregMatch[1]) : null,
                description: description.substring(0, 2000),
                era: era,
                category: null, // Will be extracted if available
                subCategory: null,
                references: references.slice(0, 10),
                dorarId: dorarId
            });
        }
    });

    return events;
}

/**
 * Main scraping function
 */
async function scrapeAllEvents() {
    console.log('='.repeat(60));
    console.log('بدء جمع الأحداث من موسوعة الدرر السنية التاريخية');
    console.log('='.repeat(60));

    // Load existing progress
    let progress = loadProgress();
    const startPage = progress.lastPage + 1;

    // Get total pages
    console.log('\nجاري حساب عدد الصفحات...');
    const totalPages = await getTotalPages();
    progress.totalPages = totalPages;

    console.log(`إجمالي الصفحات: ${totalPages}`);
    console.log(`البدء من الصفحة: ${startPage}`);

    if (startPage > 1) {
        console.log(`استكمال من التقدم السابق (${progress.events?.length || 0} حدث)`);
    }

    let allEvents = progress.events || [];
    let eventId = allEvents.length + 1;

    for (let page = startPage; page <= totalPages; page++) {
        process.stdout.write(`\r[${page}/${totalPages}] جمع الأحداث... (${allEvents.length} حدث)`);

        try {
            await sleep(DELAY_MS);
            const pageEvents = await scrapePage(page);

            // Add IDs to events
            pageEvents.forEach(event => {
                event.id = eventId++;
                allEvents.push(event);
            });

            progress.lastPage = page;
            progress.events = allEvents;

            // Save progress periodically
            if (page % SAVE_INTERVAL === 0) {
                saveProgress(progress);
                saveEvents(allEvents);
                console.log(`\n  ✓ تم حفظ التقدم عند الصفحة ${page}`);
            }

        } catch (error) {
            console.error(`\n  ✗ خطأ في الصفحة ${page}: ${error.message}`);
            // Save progress before continuing
            saveProgress(progress);
            saveEvents(allEvents);
            await sleep(5000); // Wait longer on error
        }
    }

    // Final save
    saveEvents(allEvents);

    // Clear progress file
    const progressPath = path.join(__dirname, '..', 'data', 'scrape_progress.json');
    fs.writeFileSync(progressPath, JSON.stringify({
        completed: true,
        totalEvents: allEvents.length,
        completedAt: new Date().toISOString()
    }, null, 2), 'utf8');

    console.log('\n\n' + '='.repeat(60));
    console.log('✅ اكتمل جمع الأحداث!');
    console.log(`📁 تم حفظ ${allEvents.length} حدث`);
    console.log('='.repeat(60));

    return allEvents;
}

// Run the scraper
scrapeAllEvents().catch(console.error);
