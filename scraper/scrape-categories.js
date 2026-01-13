/**
 * Dorar.net Categories Scraper
 * Collects all eras, main categories, and sub-categories
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://dorar.net';
const DELAY_MS = 1500; // Delay between requests to avoid blocking

// Eras (hardcoded as they don't change)
const ERAS = [
    { id: 1, name: 'عصر النبوة' },
    { id: 2, name: 'عصر الخلافة الراشدة' },
    { id: 3, name: 'العصر الأموي' },
    { id: 4, name: 'العصر العباسي' },
    { id: 5, name: 'عصر المماليك' },
    { id: 6, name: 'العصر العثماني' },
    { id: 7, name: 'التاريخ المعاصر' }
];

// Main categories (we need to scrape sub-categories for each)
const MAIN_CATEGORIES = [
    { id: 1, name: 'الأمم والأجناس والشعوب والأعراق القديمة والحديثة' },
    { id: 2, name: 'الحروب والجيوش' },
    { id: 3, name: 'الاحتلال والاستعمار والاستيطان' },
    { id: 4, name: 'أنظمة الحكم' },
    { id: 5, name: 'العهود والمواثيق' },
    { id: 6, name: 'العلوم' },
    { id: 7, name: 'تراجم وأعلام' },
    { id: 8, name: 'التنظيمات الحضارية' },
    { id: 9, name: 'المعالم الإسلامية' },
    { id: 10, name: 'المذاهب الدينية والتيارات الفكرية' },
    { id: 11, name: 'الفتن والسنن الكونية والكوارث الطبيعية والخوارق' },
    { id: 12, name: 'الدول والدويلات' },
    { id: 13, name: 'المسلمون في بلاد غير المسلمين' },
    { id: 14, name: 'وفيات' }
];

/**
 * Sleep function for delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch sub-categories for a main category
 */
async function fetchSubCategories(mainCategoryId) {
    try {
        // The site loads sub-categories via AJAX when main category changes
        // We'll try to find an API endpoint or scrape from the page directly
        const url = `${BASE_URL}/history/get-subcats/${mainCategoryId}`;
        
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json, text/html, */*',
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (response.data) {
            // Parse the response - it might be JSON or HTML
            if (typeof response.data === 'object') {
                return response.data;
            } else {
                // Parse HTML options
                const $ = cheerio.load(response.data);
                const subCats = [];
                $('option').each((i, el) => {
                    const value = $(el).attr('value');
                    const text = $(el).text().trim();
                    if (value && value !== '' && value !== '0') {
                        subCats.push({ id: parseInt(value), name: text });
                    }
                });
                return subCats;
            }
        }
    } catch (error) {
        console.log(`  Note: Could not fetch sub-categories for category ${mainCategoryId} via AJAX`);
        // If AJAX fails, try alternative method
        return await fetchSubCategoriesFromSearch(mainCategoryId);
    }
    return [];
}

/**
 * Alternative: Fetch sub-categories from search page
 */
async function fetchSubCategoriesFromSearch(mainCategoryId) {
    try {
        const url = `${BASE_URL}/history/search?q=&cat=${mainCategoryId}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const subCats = [];
        
        // Look for sub-category select
        $('select[name="subcat"] option, #subcat option').each((i, el) => {
            const value = $(el).attr('value');
            const text = $(el).text().trim();
            if (value && value !== '' && value !== '0' && text !== 'اختر التصنيف') {
                subCats.push({ id: parseInt(value), name: text });
            }
        });
        
        return subCats;
    } catch (error) {
        console.error(`  Error fetching from search: ${error.message}`);
        return [];
    }
}

/**
 * Main function to scrape all categories
 */
async function scrapeCategories() {
    console.log('='.repeat(60));
    console.log('بدء جمع التصنيفات من موسوعة الدرر السنية التاريخية');
    console.log('='.repeat(60));
    
    const categories = [];
    
    for (const mainCat of MAIN_CATEGORIES) {
        console.log(`\n[${mainCat.id}/14] جمع التصنيفات الفرعية لـ: ${mainCat.name}`);
        
        await sleep(DELAY_MS);
        const subCategories = await fetchSubCategories(mainCat.id);
        
        categories.push({
            id: mainCat.id,
            name: mainCat.name,
            subCategories: subCategories
        });
        
        console.log(`  ✓ تم العثور على ${subCategories.length} تصنيف فرعي`);
    }
    
    // Create the final output
    const output = {
        lastUpdated: new Date().toISOString(),
        eras: ERAS,
        categories: categories,
        statistics: {
            totalEras: ERAS.length,
            totalMainCategories: categories.length,
            totalSubCategories: categories.reduce((sum, cat) => sum + cat.subCategories.length, 0)
        }
    };
    
    // Save to file
    const outputPath = path.join(__dirname, '..', 'data', 'categories.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ اكتمل جمع التصنيفات!');
    console.log(`📁 تم الحفظ في: ${outputPath}`);
    console.log(`📊 الإحصائيات:`);
    console.log(`   - العصور: ${output.statistics.totalEras}`);
    console.log(`   - التصنيفات الرئيسية: ${output.statistics.totalMainCategories}`);
    console.log(`   - التصنيفات الفرعية: ${output.statistics.totalSubCategories}`);
    console.log('='.repeat(60));
    
    return output;
}

// Run the scraper
scrapeCategories().catch(console.error);
