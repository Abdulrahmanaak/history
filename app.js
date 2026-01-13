// Load and display events
document.addEventListener('DOMContentLoaded', async () => {
    const timeline = document.getElementById('timeline');
    const eventCountEl = document.getElementById('eventCount');
    const eraCountEl = document.getElementById('eraCount');
    const locationCountEl = document.getElementById('locationCount');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let allEvents = [];
    let map = null;
    let markers = [];

    // Initialize map
    function initMap() {
        map = L.map('map').setView([15.5, 45.0], 6);

        // Dark themed map tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            maxZoom: 19
        }).addTo(map);
    }

    // Create custom marker icon
    function createMarkerIcon(count) {
        return L.divIcon({
            className: 'custom-div-marker',
            html: `<div style="
                background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
                width: 35px;
                height: 35px;
                border-radius: 50%;
                border: 3px solid #0d1b2a;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #0d1b2a;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            ">${count}</div>`,
            iconSize: [35, 35],
            iconAnchor: [17, 17]
        });
    }

    // Group events by location
    function groupEventsByLocation(events) {
        const groups = {};
        events.forEach(event => {
            if (event.lat && event.lng) {
                const key = `${event.lat},${event.lng}`;
                if (!groups[key]) {
                    groups[key] = {
                        lat: event.lat,
                        lng: event.lng,
                        location: event.location,
                        events: []
                    };
                }
                groups[key].events.push(event);
            }
        });
        return Object.values(groups);
    }

    // Add markers to map
    function updateMapMarkers(events) {
        // Clear existing markers
        markers.forEach(m => map.removeLayer(m));
        markers = [];

        const groups = groupEventsByLocation(events);

        groups.forEach(group => {
            const marker = L.marker([group.lat, group.lng], {
                icon: createMarkerIcon(group.events.length)
            });

            // Create popup content
            const eventsList = group.events
                .sort((a, b) => a.gregorianYear - b.gregorianYear)
                .slice(0, 5)
                .map(e => `<div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                    <span style="color: #d4af37;">${e.gregorianYear}م</span> - ${e.title.substring(0, 40)}...
                </div>`)
                .join('');

            const moreText = group.events.length > 5
                ? `<div style="color: #d4af37; margin-top: 10px;">+ ${group.events.length - 5} أحداث أخرى</div>`
                : '';

            marker.bindPopup(`
                <div class="popup-content" style="min-width: 250px;">
                    <div class="popup-title">${group.location}</div>
                    <div class="popup-events">${group.events.length} حدث تاريخي</div>
                    <div style="margin-top: 10px; max-height: 200px; overflow-y: auto;">
                        ${eventsList}
                        ${moreText}
                    </div>
                </div>
            `, { maxWidth: 300 });

            marker.addTo(map);
            markers.push(marker);
        });

        // Fit bounds if we have markers
        if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    // Load events from JSON
    try {
        const response = await fetch('data/events.json');
        allEvents = await response.json();

        // Sort by gregorian year
        allEvents.sort((a, b) => a.gregorianYear - b.gregorianYear);

        // Update stats
        eventCountEl.textContent = allEvents.length;
        const eras = new Set(allEvents.map(e => e.era));
        eraCountEl.textContent = eras.size;
        const locations = new Set(allEvents.map(e => e.location));
        locationCountEl.textContent = locations.size;

        // Initialize map and add markers
        initMap();
        updateMapMarkers(allEvents);

        // Display events
        renderEvents(allEvents);
    } catch (error) {
        console.error('Error loading events:', error);
        timeline.innerHTML = '<p style="text-align:center;color:var(--accent)">جاري تحميل البيانات...</p>';
    }

    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const era = btn.dataset.era;
            const filtered = era === 'all'
                ? allEvents
                : allEvents.filter(e => e.era === era);

            renderEvents(filtered);
            updateMapMarkers(filtered);
        });
    });

    function renderEvents(events) {
        timeline.innerHTML = '';

        events.forEach((event, index) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.style.animationDelay = `${index * 0.1}s`;

            const eraClass = event.era === 'العصر العثماني' ? 'era-ottoman' : 'era-contemporary';

            item.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <span class="era-tag ${eraClass}">${event.era}</span>
                    <div class="year-badge">
                        <span class="year hijri-year">${event.hijriYear} هـ</span>
                        <span class="year gregorian-year">${event.gregorianYear} م</span>
                        ${event.location ? `<span class="year location-badge">📍 ${event.location}</span>` : ''}
                    </div>
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-description">${event.description}</p>
                </div>
            `;

            timeline.appendChild(item);
        });
    }
});
