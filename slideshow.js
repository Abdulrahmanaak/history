// Slideshow App
document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const slideBackground = document.getElementById('slideBackground');
    const slideEra = document.getElementById('slideEra');
    const slideHijri = document.getElementById('slideHijri');
    const slideGregorian = document.getElementById('slideGregorian');
    const slideTitle = document.getElementById('slideTitle');
    const slideDescription = document.getElementById('slideDescription');
    const slideLocation = document.getElementById('slideLocation');
    const currentIndexEl = document.getElementById('currentIndex');
    const totalSlidesEl = document.getElementById('totalSlides');
    const progressBar = document.getElementById('progressBar');
    const thumbnailNav = document.getElementById('thumbnailNav');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const autoplayBtn = document.getElementById('autoplayBtn');
    // Dropdown Elements References
    const eraDropdown = document.getElementById('eraDropdown');
    const eraTrigger = document.getElementById('eraTrigger');
    const eraOptions = document.getElementById('eraOptions');
    const eraValue = document.getElementById('eraValue');

    const categoryDropdown = document.getElementById('categoryDropdown');
    const categoryTrigger = document.getElementById('categoryTrigger');
    const categoryOptions = document.getElementById('categoryOptions');
    const categoryValue = document.getElementById('categoryValue');
    const mapBtn = document.getElementById('mapBtn');
    const mapModal = document.getElementById('mapModal');
    const closeMapBtn = document.getElementById('closeMapBtn');
    const navControls = document.querySelector('.nav-controls');
    // Custom Dropdown Elements
    const subCategoryDropdown = document.getElementById('subCategoryDropdown');
    const subCategoryTrigger = document.getElementById('subCategoryTrigger');
    const dropdownSearch = document.getElementById('dropdownSearch');
    const dropdownOptions = document.getElementById('dropdownOptions');
    const subCategoryValue = document.getElementById('subCategoryValue');

    let allEvents = [];
    let filteredEvents = [];
    let currentSubCategories = [];
    let currentIndex = 0;
    let isAutoplay = false;
    let autoplayInterval = null;
    let map = null;

    // Background images for different eras/locations
    const backgroundImages = {
        'صنعاء': 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=1920',
        'عدن': 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920',
        'حضرموت': 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1920',
        'زبيد': 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=1920',
        'صعدة': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1920',
        'default': 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=1920'
    };

    // Load events
    try {
        const response = await fetch('data/events.json');
        allEvents = await response.json();

        // Sort by gregorianYear ascending (oldest first)
        allEvents.sort((a, b) => a.gregorianYear - b.gregorianYear);
        filteredEvents = [...allEvents];

        totalSlidesEl.textContent = filteredEvents.length;
        renderThumbnails();
        showSlide(0);
    } catch (error) {
        console.error('Error loading events:', error);
    }

    // Show specific slide
    function showSlide(index) {
        if (filteredEvents.length === 0) return;

        currentIndex = index;
        if (currentIndex < 0) currentIndex = filteredEvents.length - 1;
        if (currentIndex >= filteredEvents.length) currentIndex = 0;

        const event = filteredEvents[currentIndex];

        // Update content with animation
        const slideContent = document.querySelector('.slide-content');
        slideContent.style.animation = 'none';
        slideContent.offsetHeight; // Trigger reflow
        slideContent.style.animation = 'fadeInUp 0.8s ease';

        // Update background
        if (event.image) {
            slideBackground.style.backgroundImage = `url(${event.image})`;
        } else {
            const bgUrl = backgroundImages[event.location] || backgroundImages['default'];
            slideBackground.style.backgroundImage = `url(${bgUrl})`;
        }

        // Update text content
        const eraName = event.era ? event.era.name : '';
        slideEra.textContent = eraName;
        slideEra.className = 'slide-era' + (eraName === 'العصر العثماني' ? ' ottoman' : '');
        slideHijri.textContent = typeof event.hijriYear === 'number' ? `${event.hijriYear} هـ` : event.hijriYear;
        slideGregorian.textContent = `${event.gregorianYear} م`;
        slideTitle.textContent = event.title;
        slideDescription.textContent = event.description;
        slideLocation.textContent = event.location ? `📍 ${event.location}` : '';

        // Update counter and progress
        currentIndexEl.textContent = currentIndex + 1;
        const progress = ((currentIndex + 1) / filteredEvents.length) * 100;
        progressBar.style.width = `${progress}%`;

        // Update thumbnails
        // Update thumbnails
        document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
            const isActive = i === currentIndex;
            thumb.classList.toggle('active', isActive);
            if (isActive) {
                thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        });
    }

    // Render thumbnails
    function renderThumbnails() {
        thumbnailNav.innerHTML = '';
        filteredEvents.forEach((event, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'thumbnail' + (index === currentIndex ? ' active' : '');
            thumb.textContent = event.hijriYear;
            thumb.addEventListener('click', () => showSlide(index));
            thumbnailNav.appendChild(thumb);
        });
    }

    // Navigation
    prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

    // Mobile Filter Toggle
    const mobileFilterToggle = document.getElementById('mobileFilterToggle');
    if (mobileFilterToggle) {
        mobileFilterToggle.addEventListener('click', () => {
            navControls.classList.toggle('active');
            const isOpen = navControls.classList.contains('active');
            mobileFilterToggle.innerHTML = isOpen ? 'تصفية ▲' : 'تصفية ▼';
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') showSlide(currentIndex - 1);
        if (e.key === 'ArrowLeft') showSlide(currentIndex + 1);
        if (e.key === ' ') toggleAutoplay();
    });

    // Autoplay
    function toggleAutoplay() {
        isAutoplay = !isAutoplay;
        autoplayBtn.textContent = isAutoplay ? '⏸ إيقاف' : '▶ تشغيل تلقائي';
        autoplayBtn.classList.toggle('active', isAutoplay);

        if (isAutoplay) {
            autoplayInterval = setInterval(() => showSlide(currentIndex + 1), 5000);
        } else {
            clearInterval(autoplayInterval);
        }
    }
    autoplayBtn.addEventListener('click', toggleAutoplay);

    // Load all data
    Promise.all([
        fetch('data/events.json').then(res => res.json()),
        fetch('data/categories.json').then(res => res.json())
    ])
        .then(([eventsData, categoriesData]) => {
            allEvents = eventsData.sort((a, b) => a.gregorianYear - b.gregorianYear);
            setupFilters(categoriesData);
            filterEvents();
            // Initial call to updateThumbnailNav and showSlide after data is loaded and filtered
            updateThumbnailNav();
            showSlide(0);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            slideTitle.textContent = 'خطأ في تحميل البيانات';
            slideDescription.textContent = 'يرجى التأكد من تشغيل خادم محلي (Local Server).';
        });

    // Setup Filters (removed reference to categorySelect)

    // Drag to scroll for thumbnail nav
    let isDown = false;
    let startX;
    let scrollLeft;

    thumbnailNav.addEventListener('mousedown', (e) => {
        isDown = true;
        thumbnailNav.classList.add('active'); // Optional: add a class for styling cursor
        startX = e.pageX - thumbnailNav.offsetLeft;
        scrollLeft = thumbnailNav.scrollLeft;
        thumbnailNav.style.cursor = 'grabbing';
    });

    thumbnailNav.addEventListener('mouseleave', () => {
        isDown = false;
        thumbnailNav.style.cursor = 'grab';
    });

    thumbnailNav.addEventListener('mouseup', () => {
        isDown = false;
        thumbnailNav.style.cursor = 'grab';
    });

    thumbnailNav.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - thumbnailNav.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        thumbnailNav.scrollLeft = scrollLeft - walk;
    });

    // Initialize cursor style
    thumbnailNav.style.cursor = 'grab';

    function setupFilters(categoriesData) {
        // Dropdown Utility
        function setupCustomDropdownNodes(trigger, dropdown, optionsContainer, valueInput, onSelect) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close others
                document.querySelectorAll('.custom-dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.remove('active');
                });
                dropdown.classList.toggle('active');
            });
        }

        function addOptionToDropdown(container, value, text, valueInput, trigger, onSelect, dropdown) {
            const option = document.createElement('div');
            option.className = 'dropdown-option';
            option.textContent = text;
            option.dataset.value = value;

            option.addEventListener('click', (e) => {
                e.stopPropagation();
                valueInput.value = value;
                trigger.querySelector('span').textContent = text;
                dropdown.classList.remove('active');
                if (onSelect) onSelect(value);
            });
            container.appendChild(option);
        }

        // --- Setup Era Dropdown ---
        setupCustomDropdownNodes(eraTrigger, eraDropdown, eraOptions, eraValue);
        // Populate Eras
        const eras = [
            'عصر النبوة', 'عصر الخلافة الراشدة', 'العصر الأموي',
            'العصر العباسي', 'عصر المماليك', 'العصر العثماني', 'التاريخ المعاصر'
        ];

        eraOptions.innerHTML = '';
        addOptionToDropdown(eraOptions, 'all', 'جميع العصور', eraValue, eraTrigger, filterEvents, eraDropdown);
        eras.forEach(era => {
            addOptionToDropdown(eraOptions, era, era, eraValue, eraTrigger, filterEvents, eraDropdown);
        });

        // --- Setup Category Dropdown ---
        categoryDropdown.style.display = 'inline-block';
        setupCustomDropdownNodes(categoryTrigger, categoryDropdown, categoryOptions, categoryValue);

        // Populate Categories
        categoryOptions.innerHTML = '';
        addOptionToDropdown(categoryOptions, 'all', 'جميع التصنيفات', categoryValue, categoryTrigger, () => {
            // On Category Change
            populateSubCategories('all', categoriesData);
            filterEvents();
        }, categoryDropdown);

        categoriesData.categories.forEach(cat => {
            addOptionToDropdown(categoryOptions, cat.id, cat.name, categoryValue, categoryTrigger, (val) => {
                populateSubCategories(val, categoriesData);
                filterEvents();
            }, categoryDropdown);
        });

        subCategoryDropdown.style.display = 'none';

        // --- Update Setup for Sub-category to close others ---
        subCategoryTrigger.addEventListener('click', (e) => {
            // Close others
            document.querySelectorAll('.custom-dropdown').forEach(d => {
                if (d !== subCategoryDropdown) d.classList.remove('active');
            });
        });

        // Event Listeners


        // Custom Dropdown Logic

        // Toggle Dropdown
        subCategoryTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (categoryValue.value === 'all') {
                showToast('الرجاء اختيار تصنيف أولاً');
                return;
            }
            subCategoryDropdown.classList.toggle('active');
            if (subCategoryDropdown.classList.contains('active')) {
                dropdownSearch.focus();
            }
        });

        // Search Filter
        dropdownSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const options = dropdownOptions.querySelectorAll('.dropdown-option');
            options.forEach(option => {
                const text = option.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    option.style.display = 'block';
                } else {
                    option.style.display = 'none';
                }
            });
        });

        // Close when clicking outside - Global handler already exists potentially? 
        // Let's create a single global handler for all dropdowns if not present,
        // or just rely on individual stopPropagation.
        // The previous implementation added a listener for `subCategoryDropdown`. 
        // We should replace it with a generic one.
    }

    // Global click listener to close all dropdowns
    document.addEventListener('click', (e) => {
        document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    });

    function showToast(message) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        container.appendChild(toast);

        // Trigger reflow
        toast.offsetHeight;

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 3000);
    }

    function populateSubCategories(catId, data) {
        // Reset
        dropdownSearch.value = '';
        subCategoryValue.value = 'all';
        subCategoryTrigger.querySelector('span').textContent = 'جميع التفرعات';
        dropdownOptions.innerHTML = ''; // Clear options

        if (catId === 'all') {
            subCategoryDropdown.style.display = 'none';
            currentSubCategories = [];
            return;
        }

        const category = data.categories.find(c => c.id == catId);
        if (category && category.subCategories) {
            currentSubCategories = category.subCategories;
            subCategoryDropdown.style.display = 'inline-block';
            renderSubCategoriesOptions(currentSubCategories);
        } else {
            currentSubCategories = [];
            subCategoryDropdown.style.display = 'none';
        }
    }

    function renderSubCategoriesOptions(subs) {
        dropdownOptions.innerHTML = '';

        // Add "All" option
        addDropdownOption('all', 'جميع التفرعات');

        subs.forEach(sub => {
            addDropdownOption(sub.id, sub.name);
        });
    }

    function addDropdownOption(id, name) {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.textContent = name;
        option.dataset.value = id;

        option.addEventListener('click', () => {
            // Update selected value
            subCategoryValue.value = id;
            subCategoryTrigger.querySelector('span').textContent = name;

            // Close dropdown
            subCategoryDropdown.classList.remove('active');

            // Trigger filter
            filterEvents();
        });

        dropdownOptions.appendChild(option);
    }

    function filterEvents() {
        const selectedEra = eraValue.value;
        const selectedCat = categoryValue.value;
        const selectedSubCat = subCategoryValue.value;

        filteredEvents = allEvents.filter(e => {
            const eraMatch = selectedEra === 'all' || (e.era && e.era.name === selectedEra);

            let catMatch = true;
            if (selectedCat !== 'all') {
                if (e.categories && e.categories.length > 0) {
                    catMatch = e.categories.some(c => c.id == selectedCat);
                } else if (e.category && e.category.id == selectedCat) {
                    // Fallback for legacy single object
                    catMatch = true;
                } else {
                    catMatch = false;
                }
            }

            let subCatMatch = true;
            if (selectedSubCat !== 'all') {
                if (e.categories && e.categories.length > 0) {
                    subCatMatch = e.categories.some(c => c.subCategory && c.subCategory.id == selectedSubCat);
                } else if (e.subCategory && e.subCategory.id == selectedSubCat) {
                    // Fallback
                    subCatMatch = true;
                } else {
                    subCatMatch = false;
                }
            }

            return eraMatch && catMatch && subCatMatch;
        });

        currentIndex = 0;
        if (filteredEvents.length > 0) {
            showSlide(currentIndex);
        } else {
            // Handle no results
            slideTitle.textContent = 'لا توجد أحداث';
            slideDescription.textContent = 'لا توجد أحداث تطابق الفلاتر المختارة.';
            slideEra.textContent = '';
            slideHijri.textContent = '';
            slideGregorian.textContent = '';
            slideLocation.textContent = '';
            slideBackground.style.backgroundImage = 'none';
        }
        updateThumbnailNav();
    }

    // Helper to update thumbnail navigation and total slides count
    function updateThumbnailNav() {
        totalSlidesEl.textContent = filteredEvents.length;
        renderThumbnails();
    }

    // Map modal
    mapBtn.addEventListener('click', () => {
        mapModal.classList.add('show');
        if (!map) {
            initMap();
        }
    });

    closeMapBtn.addEventListener('click', () => {
        mapModal.classList.remove('show');
    });

    function initMap() {
        map = L.map('map').setView([15.5, 45.0], 6);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            maxZoom: 19
        }).addTo(map);

        // Group events by location
        const groups = {};
        allEvents.forEach(event => {
            if (event.lat && event.lng) {
                const key = `${event.lat},${event.lng}`;
                if (!groups[key]) {
                    groups[key] = { lat: event.lat, lng: event.lng, location: event.location, events: [] };
                }
                groups[key].events.push(event);
            }
        });

        // Add markers
        Object.values(groups).forEach(group => {
            const marker = L.marker([group.lat, group.lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="
                        background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
                        width: 35px; height: 35px; border-radius: 50%;
                        border: 3px solid #0d1b2a;
                        display: flex; align-items: center; justify-content: center;
                        color: #0d1b2a; font-weight: bold; font-size: 14px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                    ">${group.events.length}</div>`,
                    iconSize: [35, 35],
                    iconAnchor: [17, 17]
                })
            });

            marker.bindPopup(`
                <div style="direction: rtl; font-family: 'Tajawal', sans-serif; color: #fff; background: #0d1b2a; padding: 15px; border-radius: 10px; min-width: 200px;">
                    <div style="color: #d4af37; font-size: 1.2rem; font-weight: bold; margin-bottom: 10px;">${group.location}</div>
                    <div style="color: rgba(255,255,255,0.7);">${group.events.length} حدث تاريخي</div>
                </div>
            `, { className: 'dark-popup' });

            marker.addTo(map);
        });
    }

    // Touch swipe support
    let touchStartX = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) {
            // Inverted for RTL intuition:
            // Swipe Left-to-Right (diff < 0) -> Next
            // Swipe Right-to-Left (diff > 0) -> Previous
            if (diff > 0) showSlide(currentIndex - 1);
            else showSlide(currentIndex + 1);
        }
    });
});
