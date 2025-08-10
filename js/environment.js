// Smart City Dashboard - Environment JavaScript File

// Global variables
let environmentMap;
let airQualityChart;
let noiseLevelChart;
let selectedCity;

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Environment page initialized');
    
    // Get selected city from localStorage or default to 'new-york'
    selectedCity = localStorage.getItem('selectedCity') || 'new-york';
    
    // Set the city dropdown to the selected city
    const citySelect = document.getElementById('citySelect');
    if (citySelect) {
        citySelect.value = selectedCity;
    }
    
    // Initialize environment components
    initializeCharts();
    initializeMap();
    updateEnvironmentData();
    
    // Add event listeners
    if (citySelect) {
        citySelect.addEventListener('change', function() {
            selectedCity = this.value;
            localStorage.setItem('selectedCity', selectedCity);
            updateEnvironmentData();
        });
    }
    
    const timeRange = document.getElementById('timeRange');
    if (timeRange) {
        timeRange.addEventListener('change', function() {
            updateEnvironmentData();
        });
    }
});

// Initialize charts
function initializeCharts() {
    // Air Quality Chart
    const airQualityCtx = document.getElementById('airQualityChart');
    if (airQualityCtx) {
        airQualityChart = new Chart(airQualityCtx, {
            type: 'line',
            data: {
                labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                datasets: [{
                    label: 'AQI',
                    data: [35, 32, 30, 45, 55, 60, 50, 40],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
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
                        max: 150,
                        ticks: {
                            callback: function(value) {
                                return value;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Noise Level Chart
    const noiseLevelCtx = document.getElementById('noiseLevelChart');
    if (noiseLevelCtx) {
        noiseLevelChart = new Chart(noiseLevelCtx, {
            type: 'bar',
            data: {
                labels: ['Downtown', 'Residential', 'Industrial', 'Parks', 'Commercial', 'Transport Hubs'],
                datasets: [{
                    label: 'Noise Level (dB)',
                    data: [75, 55, 80, 45, 70, 85],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.7)',
                        'rgba(40, 167, 69, 0.5)',
                        'rgba(255, 193, 7, 0.7)',
                        'rgba(40, 167, 69, 0.6)',
                        'rgba(255, 193, 7, 0.5)',
                        'rgba(220, 53, 69, 0.7)'
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(255, 193, 7, 1)',
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
                                return value + ' dB';
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
    const mapElement = document.getElementById('environmentMap');
    if (mapElement && typeof L !== 'undefined') {
        // Create map centered on the selected city
        environmentMap = L.map('environmentMap');
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(environmentMap);
        
        // Set view based on selected city
        updateMapView();
        
        // Add environmental heatmap and markers
        addEnvironmentalOverlay();
    }
}

// Update map view based on selected city
function updateMapView() {
    if (!environmentMap) return;
    
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
    environmentMap.setView([coords[0], coords[1]], coords[2]);
}

// Add environmental overlay to the map
function addEnvironmentalOverlay() {
    if (!environmentMap) return;
    
    // Clear existing overlays
    environmentMap.eachLayer(function(layer) {
        if (!(layer instanceof L.TileLayer)) {
            environmentMap.removeLayer(layer);
        }
    });
    
    // Get environmental data for the selected city
    const environmentalData = getEnvironmentalData();
    
    // Add air quality monitoring stations
    environmentalData.stations.forEach(station => {
        const icon = L.divIcon({
            className: `env-icon env-${getAQIClass(station.aqi)}`,
            html: `<i class="bi bi-wind"></i>`,
            iconSize: [30, 30]
        });
        
        L.marker([station.lat, station.lng], { icon: icon })
            .addTo(environmentMap)
            .bindPopup(`
                <div class="station-popup">
                    <h6>${station.name}</h6>
                    <p>AQI: <span class="text-${getAQIClass(station.aqi)}">${station.aqi}</span> (${getAQICategory(station.aqi)})</p>
                    <p>Main Pollutant: ${station.mainPollutant}</p>
                    <small class="text-muted">Updated at ${station.updatedAt}</small>
                </div>
            `);
    });
    
    // Add noise monitoring stations
    environmentalData.noiseStations.forEach(station => {
        const icon = L.divIcon({
            className: `env-icon env-${getNoiseClass(station.level)}`,
            html: `<i class="bi bi-volume-up-fill"></i>`,
            iconSize: [30, 30]
        });
        
        L.marker([station.lat, station.lng], { icon: icon })
            .addTo(environmentMap)
            .bindPopup(`
                <div class="station-popup">
                    <h6>${station.name}</h6>
                    <p>Noise Level: <span class="text-${getNoiseClass(station.level)}">${station.level} dB</span></p>
                    <p>Type: ${station.type}</p>
                    <small class="text-muted">Updated at ${station.updatedAt}</small>
                </div>
            `);
    });
    
    // Add water quality monitoring stations
    environmentalData.waterStations.forEach(station => {
        const icon = L.divIcon({
            className: `env-icon env-${getWaterClass(station.quality)}`,
            html: `<i class="bi bi-droplet-fill"></i>`,
            iconSize: [30, 30]
        });
        
        L.marker([station.lat, station.lng], { icon: icon })
            .addTo(environmentMap)
            .bindPopup(`
                <div class="station-popup">
                    <h6>${station.name}</h6>
                    <p>Water Quality: <span class="text-${getWaterClass(station.quality)}">${station.quality}</span></p>
                    <p>pH: ${station.ph}, Turbidity: ${station.turbidity}</p>
                    <small class="text-muted">Updated at ${station.updatedAt}</small>
                </div>
            `);
    });
    
    // Add air quality heatmap
    if (typeof L.heatLayer !== 'undefined') {
        const heatData = environmentalData.heatmapData.map(point => [
            point.lat,
            point.lng,
            point.intensity
        ]);
        
        L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: {
                0.0: '#28a745',
                0.3: '#28a745',
                0.5: '#ffc107',
                0.7: '#fd7e14',
                0.9: '#dc3545'
            }
        }).addTo(environmentMap);
    }
}

// Get environmental data based on selected city
function getEnvironmentalData() {
    // Sample data - in a real application, this would come from an API
    const environmentalDataByCity = {
        'new-york': {
            stations: [
                { lat: 40.7580, lng: -73.9855, name: 'Midtown Station', aqi: 42, mainPollutant: 'PM2.5', updatedAt: '10:15 AM' },
                { lat: 40.7527, lng: -73.9772, name: 'Central Park', aqi: 35, mainPollutant: 'O3', updatedAt: '10:00 AM' },
                { lat: 40.7484, lng: -73.9857, name: 'Times Square', aqi: 55, mainPollutant: 'NO2', updatedAt: '10:30 AM' }
            ],
            noiseStations: [
                { lat: 40.7590, lng: -73.9845, name: 'Broadway & 50th', level: 75, type: 'Traffic', updatedAt: '10:15 AM' },
                { lat: 40.7537, lng: -73.9762, name: 'Central Park East', level: 45, type: 'Park', updatedAt: '10:00 AM' },
                { lat: 40.7494, lng: -73.9867, name: 'Theater District', level: 70, type: 'Entertainment', updatedAt: '10:30 AM' }
            ],
            waterStations: [
                { lat: 40.7600, lng: -73.9835, name: 'Hudson River North', quality: 'Good', ph: 7.2, turbidity: 'Low', updatedAt: '09:45 AM' },
                { lat: 40.7547, lng: -73.9752, name: 'Central Park Pond', quality: 'Excellent', ph: 7.5, turbidity: 'Very Low', updatedAt: '09:30 AM' },
                { lat: 40.7504, lng: -73.9877, name: 'Hudson River South', quality: 'Fair', ph: 6.8, turbidity: 'Medium', updatedAt: '10:00 AM' }
            ],
            heatmapData: [
                { lat: 40.7580, lng: -73.9855, intensity: 0.4 },
                { lat: 40.7527, lng: -73.9772, intensity: 0.3 },
                { lat: 40.7484, lng: -73.9857, intensity: 0.5 },
                { lat: 40.7590, lng: -73.9845, intensity: 0.6 },
                { lat: 40.7537, lng: -73.9762, intensity: 0.2 },
                { lat: 40.7494, lng: -73.9867, intensity: 0.7 }
            ]
        },
        'london': {
            stations: [
                { lat: 51.5074, lng: -0.1278, name: 'Central London', aqi: 55, mainPollutant: 'NO2', updatedAt: '10:15 AM' },
                { lat: 51.5100, lng: -0.1350, name: 'Hyde Park', aqi: 40, mainPollutant: 'PM10', updatedAt: '10:00 AM' },
                { lat: 51.5030, lng: -0.1200, name: 'South Bank', aqi: 60, mainPollutant: 'NO2', updatedAt: '10:30 AM' }
            ],
            noiseStations: [
                { lat: 51.5084, lng: -0.1268, name: 'Oxford Street', level: 80, type: 'Shopping', updatedAt: '10:15 AM' },
                { lat: 51.5110, lng: -0.1340, name: 'Hyde Park Center', level: 50, type: 'Park', updatedAt: '10:00 AM' },
                { lat: 51.5040, lng: -0.1190, name: 'Waterloo Area', level: 75, type: 'Transport', updatedAt: '10:30 AM' }
            ],
            waterStations: [
                { lat: 51.5094, lng: -0.1258, name: 'Thames Central', quality: 'Fair', ph: 7.0, turbidity: 'Medium', updatedAt: '09:45 AM' },
                { lat: 51.5120, lng: -0.1330, name: 'Serpentine Lake', quality: 'Good', ph: 7.3, turbidity: 'Low', updatedAt: '09:30 AM' },
                { lat: 51.5050, lng: -0.1180, name: 'Thames East', quality: 'Fair', ph: 6.9, turbidity: 'Medium', updatedAt: '10:00 AM' }
            ],
            heatmapData: [
                { lat: 51.5074, lng: -0.1278, intensity: 0.5 },
                { lat: 51.5100, lng: -0.1350, intensity: 0.4 },
                { lat: 51.5030, lng: -0.1200, intensity: 0.6 },
                { lat: 51.5084, lng: -0.1268, intensity: 0.7 },
                { lat: 51.5110, lng: -0.1340, intensity: 0.3 },
                { lat: 51.5040, lng: -0.1190, intensity: 0.6 }
            ]
        },
        'tokyo': {
            stations: [
                { lat: 35.6895, lng: 139.6917, name: 'Shinjuku Station', aqi: 38, mainPollutant: 'PM2.5', updatedAt: '10:15 AM' },
                { lat: 35.6800, lng: 139.7700, name: 'Tokyo Bay', aqi: 45, mainPollutant: 'O3', updatedAt: '10:00 AM' },
                { lat: 35.6700, lng: 139.7600, name: 'Ginza District', aqi: 42, mainPollutant: 'NO2', updatedAt: '10:30 AM' }
            ],
            noiseStations: [
                { lat: 35.6905, lng: 139.6907, name: 'Shinjuku Crossing', level: 85, type: 'Traffic', updatedAt: '10:15 AM' },
                { lat: 35.6810, lng: 139.7690, name: 'Tokyo Bay Park', level: 55, type: 'Park', updatedAt: '10:00 AM' },
                { lat: 35.6710, lng: 139.7590, name: 'Ginza Shopping', level: 70, type: 'Commercial', updatedAt: '10:30 AM' }
            ],
            waterStations: [
                { lat: 35.6915, lng: 139.6897, name: 'Sumida River North', quality: 'Good', ph: 7.1, turbidity: 'Low', updatedAt: '09:45 AM' },
                { lat: 35.6820, lng: 139.7680, name: 'Tokyo Bay Shore', quality: 'Fair', ph: 7.0, turbidity: 'Medium', updatedAt: '09:30 AM' },
                { lat: 35.6720, lng: 139.7580, name: 'Sumida River South', quality: 'Good', ph: 7.2, turbidity: 'Low', updatedAt: '10:00 AM' }
            ],
            heatmapData: [
                { lat: 35.6895, lng: 139.6917, intensity: 0.4 },
                { lat: 35.6800, lng: 139.7700, intensity: 0.45 },
                { lat: 35.6700, lng: 139.7600, intensity: 0.42 },
                { lat: 35.6905, lng: 139.6907, intensity: 0.6 },
                { lat: 35.6810, lng: 139.7690, intensity: 0.3 },
                { lat: 35.6710, lng: 139.7590, intensity: 0.5 }
            ]
        },
        'singapore': {
            stations: [
                { lat: 1.3521, lng: 103.8198, name: 'Downtown Core', aqi: 45, mainPollutant: 'PM10', updatedAt: '10:15 AM' },
                { lat: 1.3600, lng: 103.8300, name: 'Marina Bay', aqi: 40, mainPollutant: 'O3', updatedAt: '10:00 AM' },
                { lat: 1.3400, lng: 103.8100, name: 'Chinatown', aqi: 50, mainPollutant: 'PM2.5', updatedAt: '10:30 AM' }
            ],
            noiseStations: [
                { lat: 1.3531, lng: 103.8188, name: 'Orchard Road', level: 75, type: 'Shopping', updatedAt: '10:15 AM' },
                { lat: 1.3610, lng: 103.8290, name: 'Gardens by the Bay', level: 50, type: 'Park', updatedAt: '10:00 AM' },
                { lat: 1.3410, lng: 103.8090, name: 'Chinatown Market', level: 70, type: 'Commercial', updatedAt: '10:30 AM' }
            ],
            waterStations: [
                { lat: 1.3541, lng: 103.8178, name: 'Singapore River', quality: 'Good', ph: 7.3, turbidity: 'Low', updatedAt: '09:45 AM' },
                { lat: 1.3620, lng: 103.8280, name: 'Marina Reservoir', quality: 'Excellent', ph: 7.5, turbidity: 'Very Low', updatedAt: '09:30 AM' },
                { lat: 1.3420, lng: 103.8080, name: 'Kallang Basin', quality: 'Good', ph: 7.2, turbidity: 'Low', updatedAt: '10:00 AM' }
            ],
            heatmapData: [
                { lat: 1.3521, lng: 103.8198, intensity: 0.45 },
                { lat: 1.3600, lng: 103.8300, intensity: 0.4 },
                { lat: 1.3400, lng: 103.8100, intensity: 0.5 },
                { lat: 1.3531, lng: 103.8188, intensity: 0.55 },
                { lat: 1.3610, lng: 103.8290, intensity: 0.3 },
                { lat: 1.3410, lng: 103.8090, intensity: 0.6 }
            ]
        },
        'paris': {
            stations: [
                { lat: 48.8566, lng: 2.3522, name: 'City Center', aqi: 60, mainPollutant: 'NO2', updatedAt: '10:15 AM' },
                { lat: 48.8600, lng: 2.3400, name: 'Champs-Élysées', aqi: 65, mainPollutant: 'PM10', updatedAt: '10:00 AM' },
                { lat: 48.8580, lng: 2.3700, name: 'Le Marais', aqi: 55, mainPollutant: 'NO2', updatedAt: '10:30 AM' }
            ],
            noiseStations: [
                { lat: 48.8576, lng: 2.3512, name: 'Louvre Area', level: 70, type: 'Tourist', updatedAt: '10:15 AM' },
                { lat: 48.8610, lng: 2.3390, name: 'Arc de Triomphe', level: 80, type: 'Traffic', updatedAt: '10:00 AM' },
                { lat: 48.8590, lng: 2.3690, name: 'Le Marais District', level: 65, type: 'Residential', updatedAt: '10:30 AM' }
            ],
            waterStations: [
                { lat: 48.8586, lng: 2.3502, name: 'Seine Central', quality: 'Fair', ph: 7.0, turbidity: 'Medium', updatedAt: '09:45 AM' },
                { lat: 48.8620, lng: 2.3380, name: 'Seine West', quality: 'Fair', ph: 6.9, turbidity: 'Medium', updatedAt: '09:30 AM' },
                { lat: 48.8600, lng: 2.3680, name: 'Canal Saint-Martin', quality: 'Good', ph: 7.2, turbidity: 'Low', updatedAt: '10:00 AM' }
            ],
            heatmapData: [
                { lat: 48.8566, lng: 2.3522, intensity: 0.6 },
                { lat: 48.8600, lng: 2.3400, intensity: 0.65 },
                { lat: 48.8580, lng: 2.3700, intensity: 0.55 },
                { lat: 48.8576, lng: 2.3512, intensity: 0.7 },
                { lat: 48.8610, lng: 2.3390, intensity: 0.75 },
                { lat: 48.8590, lng: 2.3690, intensity: 0.5 }
            ]
        },
        'dubai': {
            stations: [
                { lat: 25.2048, lng: 55.2708, name: 'Downtown Dubai', aqi: 70, mainPollutant: 'PM10', updatedAt: '10:15 AM' },
                { lat: 25.2100, lng: 55.2600, name: 'Dubai Marina', aqi: 65, mainPollutant: 'PM2.5', updatedAt: '10:00 AM' },
                { lat: 25.1980, lng: 55.2800, name: 'Deira', aqi: 75, mainPollutant: 'NO2', updatedAt: '10:30 AM' }
            ],
            noiseStations: [
                { lat: 25.2058, lng: 55.2698, name: 'Burj Khalifa Area', level: 70, type: 'Tourist', updatedAt: '10:15 AM' },
                { lat: 25.2110, lng: 55.2590, name: 'Dubai Marina Walk', level: 65, type: 'Leisure', updatedAt: '10:00 AM' },
                { lat: 25.1990, lng: 55.2790, name: 'Deira Market', level: 80, type: 'Commercial', updatedAt: '10:30 AM' }
            ],
            waterStations: [
                { lat: 25.2068, lng: 55.2688, name: 'Dubai Fountain', quality: 'Excellent', ph: 7.4, turbidity: 'Very Low', updatedAt: '09:45 AM' },
                { lat: 25.2120, lng: 55.2580, name: 'Dubai Marina Canal', quality: 'Good', ph: 7.2, turbidity: 'Low', updatedAt: '09:30 AM' },
                { lat: 25.2000, lng: 55.2780, name: 'Dubai Creek', quality: 'Fair', ph: 7.0, turbidity: 'Medium', updatedAt: '10:00 AM' }
            ],
            heatmapData: [
                { lat: 25.2048, lng: 55.2708, intensity: 0.7 },
                { lat: 25.2100, lng: 55.2600, intensity: 0.65 },
                { lat: 25.1980, lng: 55.2800, intensity: 0.75 },
                { lat: 25.2058, lng: 55.2698, intensity: 0.6 },
                { lat: 25.2110, lng: 55.2590, intensity: 0.55 },
                { lat: 25.1990, lng: 55.2790, intensity: 0.8 }
            ]
        }
    };
    
    return environmentalDataByCity[selectedCity] || environmentalDataByCity['new-york'];
}

// Get AQI category based on value
function getAQICategory(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}

// Get Bootstrap class for AQI
function getAQIClass(aqi) {
    if (aqi <= 50) return 'success';
    if (aqi <= 100) return 'warning';
    if (aqi <= 150) return 'warning';
    if (aqi <= 200) return 'danger';
    if (aqi <= 300) return 'danger';
    return 'danger';
}

// Get Bootstrap class for noise level
function getNoiseClass(level) {
    if (level <= 50) return 'success';
    if (level <= 70) return 'warning';
    return 'danger';
}

// Get Bootstrap class for water quality
function getWaterClass(quality) {
    if (quality === 'Excellent') return 'success';
    if (quality === 'Good') return 'success';
    if (quality === 'Fair') return 'warning';
    if (quality === 'Poor') return 'danger';
    return 'secondary';
}

// Update environment data based on selected city and time range
function updateEnvironmentData() {
    console.log('Updating environment data for city:', selectedCity);
    
    // Update key metrics
    updateKeyMetrics();
    
    // Update charts
    updateCharts();
    
    // Update map
    updateMapView();
    addEnvironmentalOverlay();
    
    // Update pollutant breakdown
    updatePollutantBreakdown();
    
    // Update weather conditions
    updateWeatherConditions();
    
    // Update health recommendations
    updateHealthRecommendations();
}

// Update key metrics based on selected city
function updateKeyMetrics() {
    // Sample data - in a real application, this would come from an API
    const metricsData = {
        'new-york': { aqi: '42', noise: '65 dB', co2: '415 ppm', water: 'Good' },
        'london': { aqi: '55', noise: '70 dB', co2: '420 ppm', water: 'Fair' },
        'tokyo': { aqi: '38', noise: '68 dB', co2: '410 ppm', water: 'Good' },
        'singapore': { aqi: '45', noise: '62 dB', co2: '405 ppm', water: 'Excellent' },
        'paris': { aqi: '60', noise: '72 dB', co2: '425 ppm', water: 'Fair' },
        'dubai': { aqi: '70', noise: '68 dB', co2: '430 ppm', water: 'Good' }
    };
    
    const data = metricsData[selectedCity] || metricsData['new-york'];
    
    // Update DOM elements
    const aqiElement = document.getElementById('airQualityIndexValue');
    if (aqiElement) {
        aqiElement.textContent = data.aqi;
        aqiElement.className = `h3 mb-0 text-${getAQIClass(parseInt(data.aqi))}`;
    }
    
    const noiseElement = document.getElementById('noiseLevelValue');
    if (noiseElement) noiseElement.textContent = data.noise;
    
    const co2Element = document.getElementById('co2EmissionsValue');
    if (co2Element) co2Element.textContent = data.co2;
    
    const waterElement = document.getElementById('waterQualityValue');
    if (waterElement) {
        waterElement.textContent = data.water;
        waterElement.className = `h3 mb-0 text-${getWaterClass(data.water)}`;
    }
}

// Update charts based on selected city
function updateCharts() {
    // Sample data - in a real application, this would come from an API
    const chartData = {
        'new-york': {
            airQuality: [35, 32, 30, 45, 55, 60, 50, 40],
            noiseLevel: [75, 55, 80, 45, 70, 85]
        },
        'london': {
            airQuality: [40, 38, 35, 50, 60, 65, 55, 45],
            noiseLevel: [80, 60, 75, 50, 65, 85]
        },
        'tokyo': {
            airQuality: [30, 28, 25, 40, 50, 55, 45, 35],
            noiseLevel: [85, 55, 70, 45, 65, 80]
        },
        'singapore': {
            airQuality: [35, 33, 30, 45, 50, 55, 45, 40],
            noiseLevel: [75, 50, 65, 45, 60, 70]
        },
        'paris': {
            airQuality: [45, 42, 40, 55, 65, 70, 60, 50],
            noiseLevel: [70, 65, 85, 50, 75, 80]
        },
        'dubai': {
            airQuality: [50, 48, 45, 60, 70, 75, 65, 55],
            noiseLevel: [70, 65, 80, 50, 75, 85]
        }
    };
    
    const data = chartData[selectedCity] || chartData['new-york'];
    
    // Update Air Quality Chart
    if (airQualityChart) {
        airQualityChart.data.datasets[0].data = data.airQuality;
        airQualityChart.update();
    }
    
    // Update Noise Level Chart
    if (noiseLevelChart) {
        noiseLevelChart.data.datasets[0].data = data.noiseLevel;
        noiseLevelChart.update();
        
        // Update district labels based on selected city
        const districtLabels = getDistrictLabels();
        noiseLevelChart.data.labels = districtLabels;
        noiseLevelChart.update();
    }
}

// Get district labels based on selected city
function getDistrictLabels() {
    const districtLabelsByCity = {
        'new-york': ['Downtown', 'Residential', 'Industrial', 'Parks', 'Commercial', 'Transport Hubs'],
        'london': ['City of London', 'Westminster', 'Residential Areas', 'Hyde Park', 'Oxford Street', 'Tube Stations'],
        'tokyo': ['Shinjuku', 'Residential', 'Industrial', 'Parks', 'Ginza', 'Train Stations'],
        'singapore': ['Downtown Core', 'Residential', 'Industrial', 'Gardens', 'Orchard Road', 'MRT Stations'],
        'paris': ['City Center', 'Residential', 'Industrial', 'Parks', 'Champs-Élysées', 'Metro Stations'],
        'dubai': ['Downtown Dubai', 'Residential', 'Industrial', 'Parks', 'Shopping Districts', 'Transport Hubs']
    };
    
    return districtLabelsByCity[selectedCity] || districtLabelsByCity['new-york'];
}

// Update pollutant breakdown based on selected city
function updatePollutantBreakdown() {
    // Sample data - in a real application, this would come from an API
    const pollutantData = {
        'new-york': [
            { name: 'PM2.5', value: '12 µg/m³', percentage: 30, class: 'success' },
            { name: 'PM10', value: '25 µg/m³', percentage: 25, class: 'success' },
            { name: 'O3', value: '45 ppb', percentage: 45, class: 'warning' },
            { name: 'NO2', value: '35 ppb', percentage: 35, class: 'warning' },
            { name: 'SO2', value: '5 ppb', percentage: 10, class: 'success' },
            { name: 'CO', value: '0.8 ppm', percentage: 8, class: 'success' }
        ],
        'london': [
            { name: 'PM2.5', value: '15 µg/m³', percentage: 38, class: 'warning' },
            { name: 'PM10', value: '30 µg/m³', percentage: 30, class: 'warning' },
            { name: 'O3', value: '40 ppb', percentage: 40, class: 'warning' },
            { name: 'NO2', value: '45 ppb', percentage: 45, class: 'warning' },
            { name: 'SO2', value: '8 ppb', percentage: 16, class: 'success' },
            { name: 'CO', value: '1.0 ppm', percentage: 10, class: 'success' }
        ],
        'tokyo': [
            { name: 'PM2.5', value: '10 µg/m³', percentage: 25, class: 'success' },
            { name: 'PM10', value: '20 µg/m³', percentage: 20, class: 'success' },
            { name: 'O3', value: '35 ppb', percentage: 35, class: 'warning' },
            { name: 'NO2', value: '30 ppb', percentage: 30, class: 'warning' },
            { name: 'SO2', value: '4 ppb', percentage: 8, class: 'success' },
            { name: 'CO', value: '0.7 ppm', percentage: 7, class: 'success' }
        ],
        'singapore': [
            { name: 'PM2.5', value: '12 µg/m³', percentage: 30, class: 'success' },
            { name: 'PM10', value: '25 µg/m³', percentage: 25, class: 'success' },
            { name: 'O3', value: '40 ppb', percentage: 40, class: 'warning' },
            { name: 'NO2', value: '30 ppb', percentage: 30, class: 'warning' },
            { name: 'SO2', value: '5 ppb', percentage: 10, class: 'success' },
            { name: 'CO', value: '0.8 ppm', percentage: 8, class: 'success' }
        ],
        'paris': [
            { name: 'PM2.5', value: '18 µg/m³', percentage: 45, class: 'warning' },
            { name: 'PM10', value: '35 µg/m³', percentage: 35, class: 'warning' },
            { name: 'O3', value: '50 ppb', percentage: 50, class: 'warning' },
            { name: 'NO2', value: '50 ppb', percentage: 50, class: 'warning' },
            { name: 'SO2', value: '10 ppb', percentage: 20, class: 'success' },
            { name: 'CO', value: '1.2 ppm', percentage: 12, class: 'success' }
        ],
        'dubai': [
            { name: 'PM2.5', value: '20 µg/m³', percentage: 50, class: 'warning' },
            { name: 'PM10', value: '40 µg/m³', percentage: 40, class: 'warning' },
            { name: 'O3', value: '55 ppb', percentage: 55, class: 'warning' },
            { name: 'NO2', value: '45 ppb', percentage: 45, class: 'warning' },
            { name: 'SO2', value: '12 ppb', percentage: 24, class: 'success' },
            { name: 'CO', value: '1.5 ppm', percentage: 15, class: 'success' }
        ]
    };
    
    const pollutants = pollutantData[selectedCity] || pollutantData['new-york'];
    const pollutantsList = document.getElementById('pollutantsList');
    
    if (pollutantsList) {
        // Clear existing pollutants
        pollutantsList.innerHTML = '';
        
        // Add new pollutants
        pollutants.forEach(pollutant => {
            const pollutantItem = document.createElement('div');
            pollutantItem.className = 'mb-3';
            pollutantItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span>${pollutant.name} (${pollutant.value})</span>
                    <span class="text-${pollutant.class}">${pollutant.percentage}%</span>
                </div>
                <div class="progress">
                    <div class="progress-bar bg-${pollutant.class}" role="progressbar" style="width: ${pollutant.percentage}%" 
                        aria-valuenow="${pollutant.percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            `;
            
            pollutantsList.appendChild(pollutantItem);
        });
    }
}

// Update weather conditions based on selected city
function updateWeatherConditions() {
    // Sample data - in a real application, this would come from an API
    const weatherData = {
        'new-york': { temp: '72°F', humidity: '65%', wind: '8 mph', condition: 'Partly Cloudy', icon: 'bi-cloud-sun' },
        'london': { temp: '62°F', humidity: '75%', wind: '10 mph', condition: 'Light Rain', icon: 'bi-cloud-drizzle' },
        'tokyo': { temp: '75°F', humidity: '60%', wind: '5 mph', condition: 'Sunny', icon: 'bi-sun' },
        'singapore': { temp: '85°F', humidity: '80%', wind: '7 mph', condition: 'Scattered Clouds', icon: 'bi-cloud' },
        'paris': { temp: '68°F', humidity: '70%', wind: '9 mph', condition: 'Cloudy', icon: 'bi-clouds' },
        'dubai': { temp: '95°F', humidity: '50%', wind: '12 mph', condition: 'Clear', icon: 'bi-sun' }
    };
    
    const weather = weatherData[selectedCity] || weatherData['new-york'];
    
    // Update DOM elements
    const weatherIcon = document.getElementById('weatherIcon');
    if (weatherIcon) weatherIcon.className = `bi ${weather.icon} display-4`;
    
    const weatherCondition = document.getElementById('weatherCondition');
    if (weatherCondition) weatherCondition.textContent = weather.condition;
    
    const temperature = document.getElementById('temperature');
    if (temperature) temperature.textContent = weather.temp;
    
    const humidity = document.getElementById('humidity');
    if (humidity) humidity.textContent = weather.humidity;
    
    const windSpeed = document.getElementById('windSpeed');
    if (windSpeed) windSpeed.textContent = weather.wind;
}

// Update health recommendations based on selected city and AQI
function updateHealthRecommendations() {
    // Get AQI for the selected city
    const aqiData = {
        'new-york': 42,
        'london': 55,
        'tokyo': 38,
        'singapore': 45,
        'paris': 60,
        'dubai': 70
    };
    
    const aqi = aqiData[selectedCity] || aqiData['new-york'];
    const recommendationsList = document.getElementById('healthRecommendationsList');
    
    if (recommendationsList) {
        // Clear existing recommendations
        recommendationsList.innerHTML = '';
        
        // Generate recommendations based on AQI
        const recommendations = getHealthRecommendations(aqi);
        
        // Add recommendations to the list
        recommendations.forEach(recommendation => {
            const item = document.createElement('li');
            item.className = 'list-group-item';
            item.innerHTML = `<i class="bi ${recommendation.icon} me-2 text-${recommendation.class}"></i> ${recommendation.text}`;
            
            recommendationsList.appendChild(item);
        });
    }
}

// Get health recommendations based on AQI
function getHealthRecommendations(aqi) {
    if (aqi <= 50) {
        // Good
        return [
            { text: 'Air quality is good. Enjoy outdoor activities.', icon: 'bi-check-circle-fill', class: 'success' },
            { text: 'Perfect conditions for outdoor exercise.', icon: 'bi-person-walking', class: 'success' },
            { text: 'No special precautions needed.', icon: 'bi-shield-check', class: 'success' }
        ];
    } else if (aqi <= 100) {
        // Moderate
        return [
            { text: 'Air quality is acceptable for most individuals.', icon: 'bi-check-circle', class: 'warning' },
            { text: 'Unusually sensitive people should consider reducing prolonged outdoor exertion.', icon: 'bi-exclamation-circle', class: 'warning' },
            { text: 'Good for most outdoor activities.', icon: 'bi-person-walking', class: 'success' },
            { text: 'Keep windows closed during peak traffic hours.', icon: 'bi-house', class: 'warning' }
        ];
    } else if (aqi <= 150) {
        // Unhealthy for Sensitive Groups
        return [
            { text: 'Members of sensitive groups may experience health effects.', icon: 'bi-exclamation-triangle', class: 'warning' },
            { text: 'People with respiratory or heart disease, the elderly and children should limit prolonged outdoor exertion.', icon: 'bi-heart-pulse', class: 'warning' },
            { text: 'Consider moving longer or intense outdoor activities indoors or rescheduling.', icon: 'bi-arrow-left-right', class: 'warning' },
            { text: 'Keep windows closed and use air purifiers if available.', icon: 'bi-house', class: 'warning' }
        ];
    } else {
        // Unhealthy or worse
        return [
            { text: 'Health alert: Everyone may experience health effects.', icon: 'bi-exclamation-triangle-fill', class: 'danger' },
            { text: 'Avoid prolonged or heavy outdoor exertion.', icon: 'bi-x-circle-fill', class: 'danger' },
            { text: 'Move all activities indoors or reschedule for a better air quality day.', icon: 'bi-arrow-left-right', class: 'danger' },
            { text: 'Keep windows closed and run air purifiers.', icon: 'bi-house-fill', class: 'danger' },
            { text: 'Wear masks outdoors if you must go outside.', icon: 'bi-mask', class: 'danger' }
        ];
    }
}