// Smart City Dashboard - Traffic JavaScript File

// Global variables
let trafficMap;
let hourlyCongestionChart;
let congestionByAreaChart;
let selectedCity;

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Traffic page initialized');
    
    // Get selected city from localStorage or default to 'new-york'
    selectedCity = localStorage.getItem('selectedCity') || 'new-york';
    
    // Set the city dropdown to the selected city
    const citySelect = document.getElementById('citySelect');
    if (citySelect) {
        citySelect.value = selectedCity;
    }
    
    // Initialize traffic components
    initializeCharts();
    initializeMap();
    updateTrafficData();
    
    // Add event listeners
    if (citySelect) {
        citySelect.addEventListener('change', function() {
            selectedCity = this.value;
            localStorage.setItem('selectedCity', selectedCity);
            updateTrafficData();
        });
    }
    
    const timeRange = document.getElementById('timeRange');
    if (timeRange) {
        timeRange.addEventListener('change', function() {
            updateTrafficData();
        });
    }
});

// Initialize charts
function initializeCharts() {
    // Hourly Congestion Chart
    const hourlyCongestionCtx = document.getElementById('hourlyCongestionChart');
    if (hourlyCongestionCtx) {
        hourlyCongestionChart = new Chart(hourlyCongestionCtx, {
            type: 'line',
            data: {
                labels: ['12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'],
                datasets: [{
                    label: 'Congestion Level (%)',
                    data: [10, 5, 5, 20, 75, 65, 55, 60, 70, 85, 60, 30],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
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
    
    // Congestion by Area Chart
    const congestionByAreaCtx = document.getElementById('congestionByAreaChart');
    if (congestionByAreaCtx) {
        congestionByAreaChart = new Chart(congestionByAreaCtx, {
            type: 'bar',
            data: {
                labels: ['Downtown', 'Uptown', 'Midtown', 'West Side', 'East Side', 'Industrial'],
                datasets: [{
                    label: 'Congestion Level (%)',
                    data: [85, 65, 75, 50, 60, 40],
                    backgroundColor: [
                        'rgba(220, 53, 69, 0.8)',
                        'rgba(220, 53, 69, 0.7)',
                        'rgba(220, 53, 69, 0.6)',
                        'rgba(220, 53, 69, 0.5)',
                        'rgba(220, 53, 69, 0.4)',
                        'rgba(220, 53, 69, 0.3)'
                    ],
                    borderColor: [
                        'rgba(220, 53, 69, 1)',
                        'rgba(220, 53, 69, 1)',
                        'rgba(220, 53, 69, 1)',
                        'rgba(220, 53, 69, 1)',
                        'rgba(220, 53, 69, 1)',
                        'rgba(220, 53, 69, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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
}

// Initialize map
function initializeMap() {
    const mapElement = document.getElementById('trafficMap');
    if (mapElement && typeof L !== 'undefined') {
        // Create map centered on the selected city
        trafficMap = L.map('trafficMap');
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(trafficMap);
        
        // Set view based on selected city
        updateMapView();
        
        // Add traffic overlay and markers
        addTrafficOverlay();
    }
}

// Update map view based on selected city
function updateMapView() {
    if (!trafficMap) return;
    
    // City coordinates (latitude, longitude, zoom level)
    const cityCoordinates = {
        'new-york': [40.7128, -74.0060, 12],
        'london': [51.5074, -0.1278, 12],
        'tokyo': [35.6762, 139.6503, 12],
        'singapore': [1.3521, 103.8198, 12],
        'paris': [48.8566, 2.3522, 12],
        'dubai': [25.2048, 55.2708, 12]
    };
    
    const coords = cityCoordinates[selectedCity] || cityCoordinates['new-york'];
    trafficMap.setView([coords[0], coords[1]], coords[2]);
}

// Add traffic overlay to the map
function addTrafficOverlay() {
    if (!trafficMap) return;
    
    // Clear existing overlays
    trafficMap.eachLayer(function(layer) {
        if (!(layer instanceof L.TileLayer)) {
            trafficMap.removeLayer(layer);
        }
    });
    
    // Get traffic data for the selected city
    const trafficData = getTrafficData();
    
    // Add traffic incidents
    trafficData.incidents.forEach(incident => {
        const icon = L.divIcon({
            className: `traffic-icon traffic-${incident.severity}`,
            html: `<i class="bi ${getIncidentIcon(incident.type)}"></i>`,
            iconSize: [30, 30]
        });
        
        L.marker([incident.lat, incident.lng], { icon: icon })
            .addTo(trafficMap)
            .bindPopup(`
                <div class="incident-popup">
                    <h6>${incident.title}</h6>
                    <p class="text-${getSeverityClass(incident.severity)}">${incident.severity.toUpperCase()}</p>
                    <p>${incident.description}</p>
                    <small class="text-muted">Reported at ${incident.time}</small>
                </div>
            `);
    });
    
    // Add traffic congestion overlay
    trafficData.congestionAreas.forEach(area => {
        const color = getCongestionColor(area.level);
        
        L.circle([area.lat, area.lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.3,
            radius: area.radius
        }).addTo(trafficMap);
    });
    
    // Add major roads with congestion levels
    trafficData.roads.forEach(road => {
        const color = getCongestionColor(road.congestion);
        
        L.polyline(road.path, {
            color: color,
            weight: 5,
            opacity: 0.7
        }).addTo(trafficMap)
        .bindPopup(`<b>${road.name}</b><br>Congestion: ${road.congestion}%`);
    });
}

// Get traffic data based on selected city
function getTrafficData() {
    // Sample data - in a real application, this would come from an API
    const trafficDataByCity = {
        'new-york': {
            incidents: [
                { lat: 40.7580, lng: -73.9855, type: 'accident', severity: 'high', title: 'Multi-vehicle Accident', description: 'Three vehicles involved, emergency services on scene', time: '08:45 AM' },
                { lat: 40.7527, lng: -73.9772, type: 'construction', severity: 'medium', title: 'Road Construction', description: 'Lane closure, expect delays', time: '07:30 AM' },
                { lat: 40.7484, lng: -73.9857, type: 'event', severity: 'low', title: 'Public Event', description: 'Increased pedestrian traffic', time: '09:15 AM' }
            ],
            congestionAreas: [
                { lat: 40.7580, lng: -73.9855, level: 85, radius: 500 },
                { lat: 40.7527, lng: -73.9772, level: 65, radius: 400 },
                { lat: 40.7484, lng: -73.9857, level: 75, radius: 300 }
            ],
            roads: [
                { name: 'Broadway', congestion: 80, path: [[40.7580, -73.9855], [40.7527, -73.9772]] },
                { name: '5th Avenue', congestion: 65, path: [[40.7580, -73.9855], [40.7484, -73.9857]] },
                { name: '42nd Street', congestion: 75, path: [[40.7527, -73.9772], [40.7484, -73.9857]] }
            ]
        },
        'london': {
            incidents: [
                { lat: 51.5074, lng: -0.1278, type: 'accident', severity: 'medium', title: 'Vehicle Collision', description: 'Two vehicles involved, traffic moving slowly', time: '09:30 AM' },
                { lat: 51.5100, lng: -0.1350, type: 'roadwork', severity: 'medium', title: 'Road Maintenance', description: 'Temporary traffic lights in operation', time: '08:00 AM' },
                { lat: 51.5030, lng: -0.1200, type: 'hazard', severity: 'low', title: 'Road Hazard', description: 'Debris on road, approach with caution', time: '10:15 AM' }
            ],
            congestionAreas: [
                { lat: 51.5074, lng: -0.1278, level: 70, radius: 500 },
                { lat: 51.5100, lng: -0.1350, level: 60, radius: 400 },
                { lat: 51.5030, lng: -0.1200, level: 50, radius: 300 }
            ],
            roads: [
                { name: 'Oxford Street', congestion: 70, path: [[51.5074, -0.1278], [51.5100, -0.1350]] },
                { name: 'Piccadilly', congestion: 60, path: [[51.5074, -0.1278], [51.5030, -0.1200]] },
                { name: 'Regent Street', congestion: 50, path: [[51.5100, -0.1350], [51.5030, -0.1200]] }
            ]
        },
        'tokyo': {
            incidents: [
                { lat: 35.6895, lng: 139.6917, type: 'congestion', severity: 'medium', title: 'Heavy Traffic', description: 'Rush hour congestion, delays expected', time: '08:00 AM' },
                { lat: 35.6800, lng: 139.7700, type: 'construction', severity: 'low', title: 'Station Construction', description: 'Construction near station entrance', time: '09:45 AM' },
                { lat: 35.6700, lng: 139.7600, type: 'event', severity: 'medium', title: 'Public Festival', description: 'Street closures for local festival', time: '10:30 AM' }
            ],
            congestionAreas: [
                { lat: 35.6895, lng: 139.6917, level: 60, radius: 500 },
                { lat: 35.6800, lng: 139.7700, level: 40, radius: 400 },
                { lat: 35.6700, lng: 139.7600, level: 50, radius: 300 }
            ],
            roads: [
                { name: 'Shinjuku Avenue', congestion: 60, path: [[35.6895, 139.6917], [35.6800, 139.7700]] },
                { name: 'Shibuya Street', congestion: 40, path: [[35.6895, 139.6917], [35.6700, 139.7600]] },
                { name: 'Ginza Boulevard', congestion: 50, path: [[35.6800, 139.7700], [35.6700, 139.7600]] }
            ]
        },
        'singapore': {
            incidents: [
                { lat: 1.3521, lng: 103.8198, type: 'accident', severity: 'low', title: 'Minor Accident', description: 'Vehicles moved to side, minimal disruption', time: '09:15 AM' },
                { lat: 1.3600, lng: 103.8300, type: 'construction', severity: 'medium', title: 'Road Widening', description: 'Construction work, lane reduction', time: '08:30 AM' },
                { lat: 1.3400, lng: 103.8100, type: 'congestion', severity: 'medium', title: 'Heavy Traffic', description: 'Slow-moving traffic due to volume', time: '10:00 AM' }
            ],
            congestionAreas: [
                { lat: 1.3521, lng: 103.8198, level: 55, radius: 500 },
                { lat: 1.3600, lng: 103.8300, level: 65, radius: 400 },
                { lat: 1.3400, lng: 103.8100, level: 45, radius: 300 }
            ],
            roads: [
                { name: 'Orchard Road', congestion: 55, path: [[1.3521, 103.8198], [1.3600, 103.8300]] },
                { name: 'Marina Bay Drive', congestion: 65, path: [[1.3521, 103.8198], [1.3400, 103.8100]] },
                { name: 'Sentosa Gateway', congestion: 45, path: [[1.3600, 103.8300], [1.3400, 103.8100]] }
            ]
        },
        'paris': {
            incidents: [
                { lat: 48.8566, lng: 2.3522, type: 'accident', severity: 'high', title: 'Major Accident', description: 'Multiple vehicles, emergency response in progress', time: '08:45 AM' },
                { lat: 48.8600, lng: 2.3400, type: 'roadwork', severity: 'medium', title: 'Road Repairs', description: 'Ongoing maintenance, expect delays', time: '07:30 AM' },
                { lat: 48.8580, lng: 2.3700, type: 'event', severity: 'medium', title: 'Public Demonstration', description: 'Planned protest affecting traffic flow', time: '10:00 AM' }
            ],
            congestionAreas: [
                { lat: 48.8566, lng: 2.3522, level: 80, radius: 500 },
                { lat: 48.8600, lng: 2.3400, level: 70, radius: 400 },
                { lat: 48.8580, lng: 2.3700, level: 75, radius: 300 }
            ],
            roads: [
                { name: 'Champs-Élysées', congestion: 80, path: [[48.8566, 2.3522], [48.8600, 2.3400]] },
                { name: 'Rue de Rivoli', congestion: 70, path: [[48.8566, 2.3522], [48.8580, 2.3700]] },
                { name: 'Boulevard Saint-Germain', congestion: 75, path: [[48.8600, 2.3400], [48.8580, 2.3700]] }
            ]
        },
        'dubai': {
            incidents: [
                { lat: 25.2048, lng: 55.2708, type: 'congestion', severity: 'medium', title: 'Heavy Traffic', description: 'Slow-moving traffic due to volume', time: '09:00 AM' },
                { lat: 25.2100, lng: 55.2600, type: 'construction', severity: 'medium', title: 'Road Construction', description: 'New interchange construction', time: '08:15 AM' },
                { lat: 25.1980, lng: 55.2800, type: 'event', severity: 'low', title: 'Special Event', description: 'Increased traffic due to local event', time: '10:30 AM' }
            ],
            congestionAreas: [
                { lat: 25.2048, lng: 55.2708, level: 65, radius: 500 },
                { lat: 25.2100, lng: 55.2600, level: 70, radius: 400 },
                { lat: 25.1980, lng: 55.2800, level: 55, radius: 300 }
            ],
            roads: [
                { name: 'Sheikh Zayed Road', congestion: 65, path: [[25.2048, 55.2708], [25.2100, 55.2600]] },
                { name: 'Al Khail Road', congestion: 70, path: [[25.2048, 55.2708], [25.1980, 55.2800]] },
                { name: 'Emirates Road', congestion: 55, path: [[25.2100, 55.2600], [25.1980, 55.2800]] }
            ]
        }
        ,'india': {
    incidents: [
        { lat: 19.0760, lng: 72.8777, type: 'congestion', severity: 'high', title: 'Traffic Jam', description: 'Severe congestion due to peak hour', time: '08:30 AM' },
        { lat: 19.0800, lng: 72.8700, type: 'construction', severity: 'medium', title: 'Flyover Construction', description: 'Ongoing flyover work causing delays', time: '09:00 AM' },
        { lat: 19.0700, lng: 72.8800, type: 'event', severity: 'low', title: 'Festival Event', description: 'Road closures due to Ganesh festival procession', time: '07:00 AM' }
    ],
    congestionAreas: [
        { lat: 19.0760, lng: 72.8777, level: 80, radius: 600 },
        { lat: 19.0800, lng: 72.8700, level: 70, radius: 400 },
        { lat: 19.0700, lng: 72.8800, level: 50, radius: 300 }
    ],
    roads: [
        { name: 'Western Express Highway', congestion: 80, path: [[19.0760, 72.8777], [19.0800, 72.8700]] },
        { name: 'Link Road', congestion: 70, path: [[19.0760, 72.8777], [19.0700, 72.8800]] },
        { name: 'Eastern Express Highway', congestion: 50, path: [[19.0800, 72.8700], [19.0700, 72.8800]] }
    ]
}

    };
    
    return trafficDataByCity[selectedCity] || trafficDataByCity['new-york'];
}

// Get icon for incident type
function getIncidentIcon(type) {
    const icons = {
        'accident': 'bi-exclamation-triangle-fill',
        'construction': 'bi-cone-striped',
        'roadwork': 'bi-tools',
        'congestion': 'bi-car-front-fill',
        'event': 'bi-calendar-event-fill',
        'hazard': 'bi-exclamation-diamond-fill'
    };
    
    return icons[type] || 'bi-exclamation-circle-fill';
}

// Get color based on congestion level
function getCongestionColor(level) {
    if (level >= 80) return '#dc3545'; // High - Red
    if (level >= 60) return '#fd7e14'; // Medium-High - Orange
    if (level >= 40) return '#ffc107'; // Medium - Yellow
    if (level >= 20) return '#28a745'; // Low-Medium - Green
    return '#17a2b8'; // Low - Blue
}

// Get Bootstrap severity class
function getSeverityClass(severity) {
    const classes = {
        'high': 'danger',
        'medium': 'warning',
        'low': 'success'
    };
    
    return classes[severity] || 'secondary';
}

// Update traffic data based on selected city and time range
function updateTrafficData() {
    console.log('Updating traffic data for city:', selectedCity);
    
    // Update key metrics
    updateKeyMetrics();
    
    // Update charts
    updateCharts();
    
    // Update map
    updateMapView();
    addTrafficOverlay();
    
    // Update incidents table
    updateIncidentsTable();
}

// Update key metrics based on selected city
function updateKeyMetrics() {
    // Sample data - in a real application, this would come from an API
    const metricsData = {
        'new-york': { congestion: '65%', speed: '18 mph', incidents: '12', transit: '85%' },
        'london': { congestion: '60%', speed: '15 mph', incidents: '8', transit: '90%' },
        'tokyo': { congestion: '40%', speed: '22 mph', incidents: '5', transit: '95%' },
        'singapore': { congestion: '55%', speed: '20 mph', incidents: '7', transit: '92%' },
        'paris': { congestion: '75%', speed: '14 mph', incidents: '15', transit: '80%' },
        'dubai': { congestion: '65%', speed: '25 mph', incidents: '9', transit: '75%' }
    };
    
    const data = metricsData[selectedCity] || metricsData['new-york'];
    
    // Update DOM elements
    const congestionElement = document.getElementById('overallCongestionValue');
    if (congestionElement) congestionElement.textContent = data.congestion;
    
    const speedElement = document.getElementById('averageSpeedValue');
    if (speedElement) speedElement.textContent = data.speed;
    
    const incidentsElement = document.getElementById('activeIncidentsValue');
    if (incidentsElement) incidentsElement.textContent = data.incidents;
    
    const transitElement = document.getElementById('publicTransitValue');
    if (transitElement) transitElement.textContent = data.transit;
}

// Update charts based on selected city
function updateCharts() {
    // Sample data - in a real application, this would come from an API
    const chartData = {
        'new-york': {
            hourly: [10, 5, 5, 20, 75, 65, 55, 60, 70, 85, 60, 30],
            areas: [85, 65, 75, 50, 60, 40]
        },
        'london': {
            hourly: [8, 4, 4, 15, 70, 60, 50, 55, 65, 70, 50, 25],
            areas: [70, 60, 65, 45, 55, 35]
        },
        'tokyo': {
            hourly: [5, 3, 3, 10, 50, 45, 40, 45, 50, 60, 40, 20],
            areas: [60, 40, 50, 30, 35, 25]
        },
        'singapore': {
            hourly: [7, 4, 4, 15, 60, 55, 45, 50, 60, 65, 45, 25],
            areas: [65, 55, 60, 40, 50, 30]
        },
        'paris': {
            hourly: [12, 6, 6, 25, 80, 70, 60, 65, 75, 90, 65, 35],
            areas: [90, 70, 80, 55, 65, 45]
        },
        'dubai': {
            hourly: [10, 5, 5, 20, 70, 60, 50, 55, 65, 75, 55, 30],
            areas: [75, 65, 70, 45, 55, 40]
        }
    };
    
    const data = chartData[selectedCity] || chartData['new-york'];
    
    // Update Hourly Congestion Chart
    if (hourlyCongestionChart) {
        hourlyCongestionChart.data.datasets[0].data = data.hourly;
        hourlyCongestionChart.update();
    }
    
    // Update Congestion by Area Chart
    if (congestionByAreaChart) {
        congestionByAreaChart.data.datasets[0].data = data.areas;
        congestionByAreaChart.update();
        
        // Update area labels based on selected city
        const areaLabels = getAreaLabels();
        congestionByAreaChart.data.labels = areaLabels;
        congestionByAreaChart.update();
    }
}

// Get area labels based on selected city
function getAreaLabels() {
    const areaLabelsByCity = {
        'new-york': ['Downtown', 'Uptown', 'Midtown', 'West Side', 'East Side', 'Industrial'],
        'london': ['City of London', 'Westminster', 'Camden', 'Southwark', 'Kensington', 'Islington'],
        'tokyo': ['Shinjuku', 'Shibuya', 'Ginza', 'Roppongi', 'Akihabara', 'Ueno'],
        'singapore': ['Downtown Core', 'Orchard', 'Marina Bay', 'Sentosa', 'Jurong', 'Changi'],
        'paris': ['Le Marais', 'Montmartre', 'Champs-Élysées', 'Latin Quarter', 'La Défense', 'Bastille'],
        'dubai': ['Downtown Dubai', 'Dubai Marina', 'Deira', 'Business Bay', 'Palm Jumeirah', 'Al Barsha']
    };
    
    return areaLabelsByCity[selectedCity] || areaLabelsByCity['new-york'];
}

// Update incidents table based on selected city
function updateIncidentsTable() {
    // Sample data - in a real application, this would come from an API
    const incidentsData = {
        'new-york': [
            { type: 'Accident', location: 'Broadway & 42nd St', time: '08:45 AM', severity: 'High', status: 'Active' },
            { type: 'Construction', location: '5th Ave & 34th St', time: '07:30 AM', severity: 'Medium', status: 'Active' },
            { type: 'Event', location: 'Times Square', time: '09:15 AM', severity: 'Low', status: 'Active' },
            { type: 'Congestion', location: 'Lincoln Tunnel', time: '08:00 AM', severity: 'High', status: 'Active' },
            { type: 'Roadwork', location: 'FDR Drive', time: '06:45 AM', severity: 'Medium', status: 'Active' }
        ],
        'london': [
            { type: 'Accident', location: 'Oxford St & Regent St', time: '09:30 AM', severity: 'Medium', status: 'Active' },
            { type: 'Roadwork', location: 'Piccadilly Circus', time: '08:00 AM', severity: 'Medium', status: 'Active' },
            { type: 'Hazard', location: 'London Bridge', time: '10:15 AM', severity: 'Low', status: 'Active' },
            { type: 'Congestion', location: 'M25 Junction 10', time: '07:45 AM', severity: 'High', status: 'Active' },
            { type: 'Event', location: 'Trafalgar Square', time: '09:00 AM', severity: 'Medium', status: 'Scheduled' }
        ],
        'tokyo': [
            { type: 'Congestion', location: 'Shinjuku Station', time: '08:00 AM', severity: 'Medium', status: 'Active' },
            { type: 'Construction', location: 'Shibuya Crossing', time: '09:45 AM', severity: 'Low', status: 'Active' },
            { type: 'Event', location: 'Ueno Park', time: '10:30 AM', severity: 'Medium', status: 'Scheduled' },
            { type: 'Accident', location: 'Ginza District', time: '07:15 AM', severity: 'Low', status: 'Cleared' },
            { type: 'Roadwork', location: 'Rainbow Bridge', time: '06:30 AM', severity: 'Medium', status: 'Active' }
        ],
        'singapore': [
            { type: 'Accident', location: 'Orchard Road', time: '09:15 AM', severity: 'Low', status: 'Cleared' },
            { type: 'Construction', location: 'Marina Bay Sands', time: '08:30 AM', severity: 'Medium', status: 'Active' },
            { type: 'Congestion', location: 'CTE Expressway', time: '10:00 AM', severity: 'Medium', status: 'Active' },
            { type: 'Event', location: 'Sentosa Island', time: '11:30 AM', severity: 'Low', status: 'Scheduled' },
            { type: 'Roadwork', location: 'Changi Airport', time: '07:00 AM', severity: 'Low', status: 'Active' }
        ],
        'paris': [
            { type: 'Accident', location: 'Champs-Élysées', time: '08:45 AM', severity: 'High', status: 'Active' },
            { type: 'Roadwork', location: 'Eiffel Tower', time: '07:30 AM', severity: 'Medium', status: 'Active' },
            { type: 'Event', location: 'Arc de Triomphe', time: '10:00 AM', severity: 'Medium', status: 'Scheduled' },
            { type: 'Congestion', location: 'Périphérique', time: '08:15 AM', severity: 'High', status: 'Active' },
            { type: 'Hazard', location: 'Louvre Museum', time: '09:30 AM', severity: 'Low', status: 'Active' }
        ],
        'dubai': [
            { type: 'Congestion', location: 'Sheikh Zayed Road', time: '09:00 AM', severity: 'Medium', status: 'Active' },
            { type: 'Construction', location: 'Dubai Mall', time: '08:15 AM', severity: 'Medium', status: 'Active' },
            { type: 'Event', location: 'Burj Khalifa', time: '10:30 AM', severity: 'Low', status: 'Scheduled' },
            { type: 'Accident', location: 'Palm Jumeirah', time: '07:45 AM', severity: 'Medium', status: 'Cleared' },
            { type: 'Roadwork', location: 'Dubai Marina', time: '06:30 AM', severity: 'Low', status: 'Active' }
        ]
    };
    
    const incidents = incidentsData[selectedCity] || incidentsData['new-york'];
    const incidentsTableBody = document.getElementById('incidentsTableBody');
    
    if (incidentsTableBody) {
        // Clear existing rows
        incidentsTableBody.innerHTML = '';
        
        // Add new rows
        incidents.forEach(incident => {
            const severityClass = getSeverityClass(incident.severity.toLowerCase());
            const statusClass = incident.status === 'Active' ? 'danger' : 
                              incident.status === 'Scheduled' ? 'warning' : 'success';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${incident.type}</td>
                <td>${incident.location}</td>
                <td>${incident.time}</td>
                <td><span class="badge bg-${severityClass}">${incident.severity}</span></td>
                <td><span class="badge bg-${statusClass}">${incident.status}</span></td>
            `;
            
            incidentsTableBody.appendChild(row);
        });
    }
}