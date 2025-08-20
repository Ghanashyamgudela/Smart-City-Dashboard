// Smart City Dashboard - Dashboard JavaScript File

// Global variables
let cityMap;
let trafficTrendsChart;
let environmentalMetricsChart;
let selectedCity;

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard page initialized');
    
    // Get selected city from localStorage or default to 'new-york'
    selectedCity = localStorage.getItem('selectedCity') || 'new-york';
    
    // Set the city dropdown to the selected city
    const citySelect = document.getElementById('citySelect');
    if (citySelect) {
        citySelect.value = selectedCity;
    }
    
    // Initialize dashboard components
    initializeCharts();
    initializeMap();
    updateDashboard();
    
    // Add event listeners
    if (citySelect) {
        citySelect.addEventListener('change', function() {
            selectedCity = this.value;
            localStorage.setItem('selectedCity', selectedCity);
            updateDashboard();
        });
    }
    
    const timeRange = document.getElementById('timeRange');
    if (timeRange) {
        timeRange.addEventListener('change', function() {
            updateDashboard();
        });
    }
});

// Initialize charts
function initializeCharts() {
    // Traffic Trends Chart
    const trafficTrendsCtx = document.getElementById('trafficTrendsChart');
    if (trafficTrendsCtx) {
        trafficTrendsChart = new Chart(trafficTrendsCtx, {
            type: 'line',
            data: {
                labels: ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'],
                datasets: [{
                    label: 'Congestion Level (%)',
                    data: [20, 45, 75, 60, 65, 70, 85, 60, 40],
                    borderColor: '#4a6bff',
                    backgroundColor: 'rgba(74, 107, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Environmental Metrics Chart
    const environmentalMetricsCtx = document.getElementById('environmentalMetricsChart');
    if (environmentalMetricsCtx) {
        environmentalMetricsChart = new Chart(environmentalMetricsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Good', 'Moderate', 'Poor', 'Very Poor'],
                datasets: [{
                    data: [65, 20, 10, 5],
                    backgroundColor: [
                        '#28a745',
                        '#ffc107',
                        '#fd7e14',
                        '#dc3545'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Air Quality Distribution'
                    }
                },
                cutout: '70%'
            }
        });
    }
}

// Initialize map
function initializeMap() {
    const mapElement = document.getElementById('cityMap');
    if (mapElement && typeof L !== 'undefined') {
        // Create map centered on the selected city
        cityMap = L.map('cityMap');
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(cityMap);
        
        // Set view based on selected city
        updateMapView();
        
        // Add some sample markers for demonstration
        addSampleMarkers();
    }
}

// Update map view based on selected city
function updateMapView() {
    if (!cityMap) return;
    
    // City coordinates (latitude, longitude, zoom level)
    const cityCoordinates = {
        'new-york': [40.7128, -74.0060, 12],
        'london': [51.5074, -0.1278, 12],
        'tokyo': [35.6762, 139.6503, 12],
        'singapore': [1.3521, 103.8198, 12],
        'paris': [48.8566, 2.3522, 12],
        'dubai': [25.2048, 55.2708, 12],
        'india': [19.0760, 72.8777, 12]

    };
    
    const coords = cityCoordinates[selectedCity] || cityCoordinates['new-york'];
    cityMap.setView([coords[0], coords[1]], coords[2]);
}

// Add sample markers to the map
function addSampleMarkers() {
    if (!cityMap) return;
    
    // Clear existing markers
    cityMap.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            cityMap.removeLayer(layer);
        }
    });
    
    // City-specific marker data
    const markerData = getMarkerData();
    
    // Add markers
    markerData.forEach(marker => {
        const icon = L.divIcon({
            className: `marker-icon marker-${marker.type}`,
            html: `<i class="bi ${marker.icon}"></i>`,
            iconSize: [30, 30]
        });
        
        L.marker([marker.lat, marker.lng], { icon: icon })
            .addTo(cityMap)
            .bindPopup(`<b>${marker.title}</b><br>${marker.description}`);
    });
}

// Get marker data based on selected city
function getMarkerData() {
    // Sample data - in a real application, this would come from an API
    const markersByCity = {
        'new-york': [
            { lat: 40.7580, lng: -73.9855, type: 'traffic', icon: 'bi-car-front', title: 'High Traffic', description: 'Congestion level: 85%' },
            { lat: 40.7527, lng: -73.9772, type: 'environment', icon: 'bi-wind', title: 'Air Quality Station', description: 'AQI: 42 (Good)' },
            { lat: 40.7484, lng: -73.9857, type: 'event', icon: 'bi-calendar-event', title: 'Times Square Event', description: 'Street performance at 5 PM' }
        ],
        'london': [
            { lat: 51.5074, lng: -0.1278, type: 'traffic', icon: 'bi-car-front', title: 'Moderate Traffic', description: 'Congestion level: 60%' },
            { lat: 51.5100, lng: -0.1350, type: 'environment', icon: 'bi-wind', title: 'Air Quality Station', description: 'AQI: 55 (Moderate)' },
            { lat: 51.5030, lng: -0.1200, type: 'event', icon: 'bi-calendar-event', title: 'Hyde Park Concert', description: 'Live music at 7 PM' }
        ],
        'tokyo': [
            { lat: 35.6895, lng: 139.6917, type: 'traffic', icon: 'bi-car-front', title: 'Low Traffic', description: 'Congestion level: 40%' },
            { lat: 35.6800, lng: 139.7700, type: 'environment', icon: 'bi-wind', title: 'Air Quality Station', description: 'AQI: 38 (Good)' },
            { lat: 35.6700, lng: 139.7600, type: 'event', icon: 'bi-calendar-event', title: 'Sakura Festival', description: 'Cherry blossom viewing' }
        ],
        'singapore': [
            { lat: 1.3521, lng: 103.8198, type: 'traffic', icon: 'bi-car-front', title: 'Moderate Traffic', description: 'Congestion level: 55%' },
            { lat: 1.3600, lng: 103.8300, type: 'environment', icon: 'bi-wind', title: 'Air Quality Station', description: 'AQI: 45 (Good)' },
            { lat: 1.3400, lng: 103.8100, type: 'event', icon: 'bi-calendar-event', title: 'Marina Bay Event', description: 'Light show at 8 PM' }
        ],
        'paris': [
            { lat: 48.8566, lng: 2.3522, type: 'traffic', icon: 'bi-car-front', title: 'High Traffic', description: 'Congestion level: 75%' },
            { lat: 48.8600, lng: 2.3400, type: 'environment', icon: 'bi-wind', title: 'Air Quality Station', description: 'AQI: 60 (Moderate)' },
            { lat: 48.8580, lng: 2.3700, type: 'event', icon: 'bi-calendar-event', title: 'Eiffel Tower Event', description: 'Cultural exhibition' }
        ],
        'dubai': [
            { lat: 25.2048, lng: 55.2708, type: 'traffic', icon: 'bi-car-front', title: 'Moderate Traffic', description: 'Congestion level: 65%' },
            { lat: 25.2100, lng: 55.2600, type: 'environment', icon: 'bi-wind', title: 'Air Quality Station', description: 'AQI: 70 (Moderate)' },
            { lat: 25.1980, lng: 55.2800, type: 'event', icon: 'bi-calendar-event', title: 'Dubai Mall Event', description: 'Shopping festival' }
        ]
    };
    
    return markersByCity[selectedCity] || markersByCity['new-york'];
}

// Update dashboard data based on selected city and time range
function updateDashboard() {
    console.log('Updating dashboard for city:', selectedCity);
    
    // Update key metrics
    updateKeyMetrics();
    
    // Update charts
    updateCharts();
    
    // Update map
    updateMapView();
    addSampleMarkers();
    
    // Update upcoming events list
    updateUpcomingEvents();
}

// Update key metrics based on selected city
function updateKeyMetrics() {
    // Sample data - in a real application, this would come from an API
    const metricsData = {
        'new-york': { traffic: '65%', aqi: '42', energy: '1.2M', events: '24' },
        'london': { traffic: '60%', aqi: '55', energy: '0.9M', events: '18' },
        'tokyo': { traffic: '40%', aqi: '38', energy: '1.5M', events: '30' },
        'singapore': { traffic: '55%', aqi: '45', energy: '0.8M', events: '15' },
        'paris': { traffic: '75%', aqi: '60', energy: '1.0M', events: '22' },
        'dubai': { traffic: '65%', aqi: '70', energy: '1.8M', events: '20' }
    };
    
    const data = metricsData[selectedCity] || metricsData['new-york'];
    
    // Update DOM elements
    const trafficElement = document.getElementById('trafficCongestionValue');
    if (trafficElement) trafficElement.textContent = data.traffic;
    
    const aqiElement = document.getElementById('airQualityValue');
    if (aqiElement) aqiElement.textContent = data.aqi;
    
    const energyElement = document.getElementById('energyConsumptionValue');
    if (energyElement) energyElement.textContent = data.energy;
    
    const eventsElement = document.getElementById('activeEventsValue');
    if (eventsElement) eventsElement.textContent = data.events;
}

// Update charts based on selected city
function updateCharts() {
    // Sample data - in a real application, this would come from an API
    const chartData = {
        'new-york': {
            traffic: [20, 45, 75, 60, 65, 70, 85, 60, 40],
            environment: [65, 20, 10, 5]
        },
        'london': {
            traffic: [15, 40, 65, 55, 60, 65, 70, 50, 30],
            environment: [60, 25, 10, 5]
        },
        'tokyo': {
            traffic: [10, 30, 50, 45, 40, 55, 60, 40, 20],
            environment: [70, 20, 8, 2]
        },
        'singapore': {
            traffic: [15, 35, 55, 50, 45, 60, 65, 45, 25],
            environment: [75, 15, 8, 2]
        },
        'paris': {
            traffic: [25, 50, 80, 65, 70, 75, 90, 65, 45],
            environment: [55, 30, 10, 5]
        },
        'dubai': {
            traffic: [20, 45, 70, 60, 65, 70, 80, 55, 35],
            environment: [50, 30, 15, 5]
        }
    };
    
    const data = chartData[selectedCity] || chartData['new-york'];
    
    // Update Traffic Trends Chart
    if (trafficTrendsChart) {
        trafficTrendsChart.data.datasets[0].data = data.traffic;
        trafficTrendsChart.update();
    }
    
    // Update Environmental Metrics Chart
    if (environmentalMetricsChart) {
        environmentalMetricsChart.data.datasets[0].data = data.environment;
        environmentalMetricsChart.update();
    }
}

// Update upcoming events list based on selected city
function updateUpcomingEvents() {
    // Sample data - in a real application, this would come from an API
    const eventsData = {
        'new-york': [
            { title: 'City Marathon', location: 'Central Park', time: '8:00 AM', badge: 'Today' },
            { title: 'Tech Conference', location: 'Convention Center', time: '9:00 AM', badge: 'Tomorrow' },
            { title: 'Food Festival', location: 'Downtown Plaza', time: '11:00 AM', badge: 'In 2 days' },
            { title: 'Art Exhibition', location: 'City Gallery', time: '10:00 AM', badge: 'In 3 days' }
        ],
        'london': [
            { title: 'Music Festival', location: 'Hyde Park', time: '7:00 PM', badge: 'Today' },
            { title: 'Business Summit', location: 'ExCeL London', time: '10:00 AM', badge: 'Tomorrow' },
            { title: 'Theatre Show', location: 'West End', time: '8:00 PM', badge: 'In 2 days' },
            { title: 'Food Market', location: 'Borough Market', time: '9:00 AM', badge: 'In 4 days' }
        ],
        'tokyo': [
            { title: 'Anime Convention', location: 'Tokyo Big Sight', time: '10:00 AM', badge: 'Today' },
            { title: 'Cherry Blossom Festival', location: 'Ueno Park', time: 'All Day', badge: 'Tomorrow' },
            { title: 'Tech Expo', location: 'Makuhari Messe', time: '9:00 AM', badge: 'In 3 days' },
            { title: 'Sumo Tournament', location: 'Ryogoku Kokugikan', time: '1:00 PM', badge: 'In 5 days' }
        ],
        'singapore': [
            { title: 'Light Festival', location: 'Marina Bay', time: '8:00 PM', badge: 'Today' },
            { title: 'Food Fair', location: 'Sentosa', time: '11:00 AM', badge: 'Tomorrow' },
            { title: 'Tech Summit', location: 'Suntec Convention', time: '9:00 AM', badge: 'In 2 days' },
            { title: 'Cultural Show', location: 'Esplanade', time: '7:00 PM', badge: 'In 4 days' }
        ],
        'paris': [
            { title: 'Art Exhibition', location: 'Louvre Museum', time: '10:00 AM', badge: 'Today' },
            { title: 'Wine Tasting', location: 'Montmartre', time: '6:00 PM', badge: 'Tomorrow' },
            { title: 'Fashion Show', location: 'Champs-Élysées', time: '8:00 PM', badge: 'In 3 days' },
            { title: 'Music Concert', location: 'Philharmonie', time: '7:30 PM', badge: 'In 5 days' }
        ],
        'dubai': [
            { title: 'Shopping Festival', location: 'Dubai Mall', time: 'All Day', badge: 'Today' },
            { title: 'Desert Safari', location: 'Dubai Desert', time: '4:00 PM', badge: 'Tomorrow' },
            { title: 'Boat Show', location: 'Dubai Marina', time: '11:00 AM', badge: 'In 2 days' },
            { title: 'Business Conference', location: 'World Trade Centre', time: '9:00 AM', badge: 'In 4 days' }
        ]
    };
    
    const events = eventsData[selectedCity] || eventsData['new-york'];
    const eventsList = document.getElementById('upcomingEventsList');
    
    if (eventsList) {
        // Clear existing events
        eventsList.innerHTML = '';
        
        // Add new events
        events.forEach(event => {
            const badgeClass = event.badge === 'Today' ? 'bg-primary' : 'bg-secondary';
            
            const eventItem = document.createElement('li');
            eventItem.className = 'list-group-item';
            eventItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-0">${event.title}</h6>
                        <small class="text-muted">${event.location}, ${event.time}</small>
                    </div>
                    <span class="badge ${badgeClass}">${event.badge}</span>
                </div>
            `;
            
            eventsList.appendChild(eventItem);
        });
    }
}