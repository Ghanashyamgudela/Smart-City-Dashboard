/**
 * events.js - Handles interactive functionalities for the Events page
 * Part of the Smart City Dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let selectedCity = localStorage.getItem('selectedCity') || 'New York';
    let selectedEventType = 'All';
    
    // Initialize components
    initializeComponents();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    updatePageData();
});

/**
 * Initialize all components on the page
 */
function initializeComponents() {
    // Initialize city dropdown
    const cityDropdown = document.getElementById('cityDropdown');
    if (cityDropdown) {
        cityDropdown.value = localStorage.getItem('selectedCity') || 'New York';
    }
    
    // Initialize event type dropdown
    const eventTypeDropdown = document.getElementById('eventTypeDropdown');
    if (eventTypeDropdown) {
        eventTypeDropdown.value = 'All';
    }
    
    // Initialize calendar
    initializeCalendar();
    
    // Initialize map
    initializeMap();
    
    // Initialize chart
    initializeEventCategoryChart();
}

/**
 * Set up event listeners for interactive elements
 */
function setupEventListeners() {
    // City selection change
    const cityDropdown = document.getElementById('cityDropdown');
    if (cityDropdown) {
        cityDropdown.addEventListener('change', function() {
            selectedCity = this.value;
            localStorage.setItem('selectedCity', selectedCity);
            updatePageData();
        });
    }
    
    // Event type selection change
    const eventTypeDropdown = document.getElementById('eventTypeDropdown');
    if (eventTypeDropdown) {
        eventTypeDropdown.addEventListener('change', function() {
            selectedEventType = this.value;
            updatePageData();
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('eventSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterEvents(this.value);
        });
    }
    
    // Pagination
    setupPagination();
}

/**
 * Initialize the events calendar using FullCalendar
 */
function initializeCalendar() {
    const calendarEl = document.getElementById('eventsCalendar');
    if (!calendarEl) return;
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        events: getEventsData(),
        eventClick: function(info) {
            showEventDetails(info.event);
        },
        eventDidMount: function(info) {
            // Add animation class to newly rendered events
            info.el.classList.add('event-item');
        }
    });
    
    calendar.render();
}

/**
 * Initialize the events map using Leaflet
 */
function initializeMap() {
    const mapElement = document.getElementById('eventsMap');
    if (!mapElement) return;
    
    // City coordinates
    const cityCoordinates = {
        'New York': [40.7128, -74.0060],
        'Los Angeles': [34.0522, -118.2437],
        'Chicago': [41.8781, -87.6298],
        'Houston': [29.7604, -95.3698],
        'Phoenix': [33.4484, -112.0740]
    };
    
    // Create map centered on selected city
    const map = L.map('eventsMap').setView(cityCoordinates[selectedCity] || [40.7128, -74.0060], 12);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add event markers
    addEventMarkers(map);
}

/**
 * Add event markers to the map
 * @param {Object} map - Leaflet map object
 */
function addEventMarkers(map) {
    const events = getEventsData().filter(event => 
        (selectedEventType === 'All' || event.type === selectedEventType));
    
    events.forEach(event => {
        if (event.location && event.location.coordinates) {
            const marker = L.marker(event.location.coordinates, {
                icon: L.divIcon({
                    className: 'event-marker',
                    html: `<i class="bi ${getEventIcon(event.type)}"></i>`,
                    iconSize: [30, 30]
                })
            }).addTo(map);
            
            // Add animation class to marker
            marker._icon.classList.add('marker-drop');
            
            marker.bindPopup(`
                <div class="event-popup">
                    <h5>${event.title}</h5>
                    <p><i class="bi bi-calendar"></i> ${event.date}</p>
                    <p><i class="bi bi-geo-alt"></i> ${event.location.name}</p>
                    <button class="btn btn-sm btn-primary btn-ripple view-event-btn" data-event-id="${event.id}">View Details</button>
                </div>
            `);
            
            marker.on('click', function() {
                // Add animation to popup content
                setTimeout(() => {
                    const viewBtn = document.querySelector('.view-event-btn');
                    if (viewBtn) {
                        viewBtn.addEventListener('click', function() {
                            const eventId = this.getAttribute('data-event-id');
                            const eventData = events.find(e => e.id === eventId);
                            if (eventData) {
                                showEventDetails(eventData);
                            }
                        });
                    }
                }, 100);
            });
        }
    });
}

/**
 * Initialize the events by category chart
 */
function initializeEventCategoryChart() {
    const chartCanvas = document.getElementById('eventsByCategoryChart');
    if (!chartCanvas) return;
    
    // Get event data grouped by category
    const eventData = getEventCategoryCounts();
    
    const chart = new Chart(chartCanvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(eventData),
            datasets: [{
                data: Object.values(eventData),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        }
    });
}

/**
 * Update all data on the page based on selected city and event type
 */
function updatePageData() {
    // Update key metrics
    updateKeyMetrics();
    
    // Update featured events
    updateFeaturedEvents();
    
    // Update upcoming events list
    updateUpcomingEvents();
    
    // Reinitialize map with new data
    initializeMap();
    
    // Update chart with new data
    updateEventCategoryChart();
    
    // Reinitialize calendar with new data
    initializeCalendar();
}

/**
 * Update key metrics based on selected city and event type
 */
function updateKeyMetrics() {
    const events = getEventsData().filter(event => 
        (selectedEventType === 'All' || event.type === selectedEventType));
    
    // Calculate metrics
    const today = new Date();
    const todayEvents = events.filter(event => new Date(event.date).toDateString() === today.toDateString()).length;
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= weekStart && eventDate <= weekEnd;
    }).length;
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= monthStart && eventDate <= monthEnd;
    }).length;
    
    const majorEvents = events.filter(event => event.isMajor).length;
    
    // Update DOM elements with animation
    updateMetricWithAnimation('todayEvents', todayEvents);
    updateMetricWithAnimation('weekEvents', weekEvents);
    updateMetricWithAnimation('monthEvents', monthEvents);
    updateMetricWithAnimation('majorEvents', majorEvents);
}

/**
 * Update a metric with animation
 * @param {string} elementId - ID of the element to update
 * @param {number} value - New value for the metric
 */
function updateMetricWithAnimation(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Get current value
    const currentValue = parseInt(element.textContent) || 0;
    
    // Animate the change
    let startTime;
    const duration = 1000; // 1 second animation
    
    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentNumber = Math.floor(currentValue + progress * (value - currentValue));
        element.textContent = currentNumber;
        
        if (progress < 1) {
            window.requestAnimationFrame(animate);
        } else {
            element.textContent = value;
        }
    }
    
    window.requestAnimationFrame(animate);
}

/**
 * Update featured events section
 */
function updateFeaturedEvents() {
    const featuredEventsContainer = document.getElementById('featuredEvents');
    if (!featuredEventsContainer) return;
    
    // Get featured events for selected city and type
    const events = getEventsData()
        .filter(event => event.isFeatured && 
                (selectedEventType === 'All' || event.type === selectedEventType))
        .slice(0, 3);
    
    // Clear container
    featuredEventsContainer.innerHTML = '';
    
    // Add events with animation
    events.forEach((event, index) => {
        const eventCard = document.createElement('div');
        eventCard.className = 'col-md-4 mb-4';
        eventCard.setAttribute('data-aos', 'fade-up');
        eventCard.setAttribute('data-aos-delay', (index * 100).toString());
        
        eventCard.innerHTML = `
            <div class="card h-100 event-item">
                <div class="card-img-overlay-top">
                    <span class="badge bg-${getEventTypeColor(event.type)}">${event.type}</span>
                </div>
                <img src="${event.image}" class="card-img-top" alt="${event.title}">
                <div class="card-body">
                    <h5 class="card-title">${event.title}</h5>
                    <p class="card-text">
                        <i class="bi bi-calendar"></i> ${event.date}<br>
                        <i class="bi bi-geo-alt"></i> ${event.location.name}
                    </p>
                    <button class="btn btn-primary btn-sm btn-ripple" onclick="showEventDetails(${JSON.stringify(event).replace(/"/g, "'")})">View Details</button>
                </div>
            </div>
        `;
        
        featuredEventsContainer.appendChild(eventCard);
    });
}

/**
 * Update upcoming events list
 */
function updateUpcomingEvents() {
    const upcomingEventsContainer = document.getElementById('upcomingEventsList');
    if (!upcomingEventsContainer) return;
    
    // Get upcoming events for selected city and type
    const events = getEventsData()
        .filter(event => new Date(event.date) >= new Date() && 
                (selectedEventType === 'All' || event.type === selectedEventType))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 10);
    
    // Clear container
    upcomingEventsContainer.innerHTML = '';
    
    // Add events with animation
    events.forEach((event, index) => {
        const eventItem = document.createElement('div');
        eventItem.className = 'list-group-item list-group-item-action event-item';
        eventItem.setAttribute('data-event-id', event.id);
        eventItem.setAttribute('data-aos', 'fade-up');
        eventItem.setAttribute('data-aos-delay', (index * 50).toString());
        
        eventItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${event.title}</h5>
                <span class="badge bg-${getEventTypeColor(event.type)}">${event.type}</span>
            </div>
            <p class="mb-1">
                <i class="bi bi-calendar"></i> ${event.date} | 
                <i class="bi bi-geo-alt"></i> ${event.location.name}
            </p>
            <small>
                <i class="bi bi-info-circle"></i> ${event.description.substring(0, 80)}...
            </small>
        `;
        
        eventItem.addEventListener('click', function() {
            showEventDetails(event);
        });
        
        upcomingEventsContainer.appendChild(eventItem);
    });
    
    // Update pagination
    updatePagination(events.length);
}

/**
 * Set up pagination for upcoming events
 */
function setupPagination() {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;
    
    // Add click event to pagination items
    paginationContainer.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.getAttribute('data-page')) {
            e.preventDefault();
            const page = parseInt(e.target.getAttribute('data-page'));
            changePage(page);
        }
    });
}

/**
 * Update pagination based on total events
 * @param {number} totalEvents - Total number of events
 */
function updatePagination(totalEvents) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;
    
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalEvents / itemsPerPage);
    
    // Clear pagination
    paginationContainer.innerHTML = '';
    
    // Previous button
    const prevItem = document.createElement('li');
    prevItem.className = 'page-item';
    prevItem.innerHTML = `<a class="page-link" href="#" data-page="prev"><i class="bi bi-chevron-left"></i></a>`;
    paginationContainer.appendChild(prevItem);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = i === 1 ? 'page-item active' : 'page-item';
        pageItem.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
        paginationContainer.appendChild(pageItem);
    }
    
    // Next button
    const nextItem = document.createElement('li');
    nextItem.className = 'page-item';
    nextItem.innerHTML = `<a class="page-link" href="#" data-page="next"><i class="bi bi-chevron-right"></i></a>`;
    paginationContainer.appendChild(nextItem);
}

/**
 * Change page in pagination
 * @param {number|string} page - Page number or 'prev'/'next'
 */
function changePage(page) {
    const paginationItems = document.querySelectorAll('.pagination .page-item');
    if (!paginationItems.length) return;
    
    // Find current active page
    let currentPage = 1;
    paginationItems.forEach((item, index) => {
        if (item.classList.contains('active') && index > 0 && index < paginationItems.length - 1) {
            currentPage = parseInt(item.querySelector('a').getAttribute('data-page'));
        }
    });
    
    // Calculate new page
    let newPage = currentPage;
    if (page === 'prev') {
        newPage = Math.max(currentPage - 1, 1);
    } else if (page === 'next') {
        newPage = Math.min(currentPage + 1, paginationItems.length - 2);
    } else {
        newPage = page;
    }
    
    // Update active class
    paginationItems.forEach((item, index) => {
        if (index > 0 && index < paginationItems.length - 1) {
            const pageNum = parseInt(item.querySelector('a').getAttribute('data-page'));
            if (pageNum === newPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });
    
    // Update events list for new page
    loadEventsForPage(newPage);
}

/**
 * Load events for a specific page
 * @param {number} page - Page number
 */
function loadEventsForPage(page) {
    const upcomingEventsContainer = document.getElementById('upcomingEventsList');
    if (!upcomingEventsContainer) return;
    
    const itemsPerPage = 10;
    const startIndex = (page - 1) * itemsPerPage;
    
    // Get upcoming events for selected city and type
    const events = getEventsData()
        .filter(event => new Date(event.date) >= new Date() && 
                (selectedEventType === 'All' || event.type === selectedEventType))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(startIndex, startIndex + itemsPerPage);
    
    // Clear container
    upcomingEventsContainer.innerHTML = '';
    
    // Add events with animation
    events.forEach((event, index) => {
        const eventItem = document.createElement('div');
        eventItem.className = 'list-group-item list-group-item-action event-item';
        eventItem.setAttribute('data-event-id', event.id);
        eventItem.setAttribute('data-aos', 'fade-up');
        eventItem.setAttribute('data-aos-delay', (index * 50).toString());
        
        eventItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${event.title}</h5>
                <span class="badge bg-${getEventTypeColor(event.type)}">${event.type}</span>
            </div>
            <p class="mb-1">
                <i class="bi bi-calendar"></i> ${event.date} | 
                <i class="bi bi-geo-alt"></i> ${event.location.name}
            </p>
            <small>
                <i class="bi bi-info-circle"></i> ${event.description.substring(0, 80)}...
            </small>
        `;
        
        eventItem.addEventListener('click', function() {
            showEventDetails(event);
        });
        
        upcomingEventsContainer.appendChild(eventItem);
    });
}

/**
 * Filter events based on search input
 * @param {string} searchTerm - Search term
 */
function filterEvents(searchTerm) {
    const eventItems = document.querySelectorAll('#upcomingEventsList .list-group-item');
    if (!eventItems.length) return;
    
    searchTerm = searchTerm.toLowerCase();
    
    eventItems.forEach(item => {
        const title = item.querySelector('h5').textContent.toLowerCase();
        const description = item.querySelector('small').textContent.toLowerCase();
        const location = item.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm) || location.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Show event details in a modal
 * @param {Object} event - Event data
 */
function showEventDetails(event) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('eventDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'eventDetailsModal';
        modal.tabIndex = '-1';
        modal.setAttribute('aria-labelledby', 'eventDetailsModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="eventDetailsModalLabel"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <img id="eventImage" src="" class="img-fluid rounded mb-3" alt="Event Image">
                                <div id="eventDetails"></div>
                            </div>
                            <div class="col-md-6">
                                <div id="eventDescription"></div>
                                <div id="eventLocation" class="mt-3"></div>
                                <div id="eventMap" class="mt-3" style="height: 200px;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary btn-ripple" id="registerButton">Register</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Update modal content
    const modalTitle = modal.querySelector('.modal-title');
    const eventImage = modal.querySelector('#eventImage');
    const eventDetails = modal.querySelector('#eventDetails');
    const eventDescription = modal.querySelector('#eventDescription');
    const eventLocation = modal.querySelector('#eventLocation');
    const registerButton = modal.querySelector('#registerButton');
    
    modalTitle.textContent = event.title;
    eventImage.src = event.image || 'img/event-placeholder.jpg';
    eventImage.alt = event.title;
    
    eventDetails.innerHTML = `
        <div class="mb-3">
            <p><strong><i class="bi bi-calendar"></i> Date:</strong> ${event.date}</p>
            <p><strong><i class="bi bi-clock"></i> Time:</strong> ${event.time || '7:00 PM'}</p>
            <p><strong><i class="bi bi-tag"></i> Category:</strong> <span class="badge bg-${getEventTypeColor(event.type)}">${event.type}</span></p>
            ${event.isMajor ? '<p><span class="badge bg-danger">Major Event</span></p>' : ''}
        </div>
    `;
    
    eventDescription.innerHTML = `
        <h5>About This Event</h5>
        <p>${event.description || 'No description available.'}</p>
    `;
    
    eventLocation.innerHTML = `
        <h5>Location</h5>
        <p><i class="bi bi-geo-alt"></i> ${event.location.name}</p>
        <p><small>${event.location.address || ''}</small></p>
    `;
    
    // Initialize small map in modal
    setTimeout(() => {
        if (event.location && event.location.coordinates) {
            const eventMapElement = modal.querySelector('#eventMap');
            if (eventMapElement) {
                const eventMap = L.map(eventMapElement).setView(event.location.coordinates, 15);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(eventMap);
                
                const marker = L.marker(event.location.coordinates, {
                    icon: L.divIcon({
                        className: 'event-marker',
                        html: `<i class="bi ${getEventIcon(event.type)}"></i>`,
                        iconSize: [30, 30]
                    })
                }).addTo(eventMap);
                
                // Add animation class to marker
                marker._icon.classList.add('marker-drop');
            }
        }
    }, 500);
    
    // Register button click event
    registerButton.addEventListener('click', function() {
        alert(`Registration for "${event.title}" will be available soon!`);
    });
    
    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Add animation to modal content
    modal.addEventListener('shown.bs.modal', function() {
        modal.querySelectorAll('.modal-body > *').forEach((element, index) => {
            element.classList.add('animate__animated', 'animate__fadeIn');
            element.style.animationDelay = `${index * 0.1}s`;
        });
    });
}

/**
 * Update the event category chart
 */
function updateEventCategoryChart() {
    const chartCanvas = document.getElementById('eventsByCategoryChart');
    if (!chartCanvas) return;
    
    // Get event data grouped by category
    const eventData = getEventCategoryCounts();
    
    // Get chart instance
    const chartInstance = Chart.getChart(chartCanvas);
    if (chartInstance) {
        // Update chart data
        chartInstance.data.labels = Object.keys(eventData);
        chartInstance.data.datasets[0].data = Object.values(eventData);
        chartInstance.update();
    }
}

/**
 * Get events data for the selected city
 * @returns {Array} Array of event objects
 */
function getEventsData() {
    // In a real application, this would come from an API
    // For demo purposes, we'll use mock data
    return [
        {
            id: '1',
            title: 'Summer Music Festival',
            type: 'Cultural',
            date: '2023-07-15',
            time: '6:00 PM',
            description: 'Annual summer music festival featuring local and international artists across multiple stages.',
            location: {
                name: 'Central Park',
                address: '59th St to 110th St, New York, NY 10022',
                coordinates: [40.7812, -73.9665]
            },
            image: 'img/event-music.jpg',
            isFeatured: true,
            isMajor: true
        },
        {
            id: '2',
            title: 'Tech Innovation Summit',
            type: 'Business',
            date: '2023-07-20',
            time: '9:00 AM',
            description: 'Conference bringing together tech leaders to discuss the latest innovations and future trends.',
            location: {
                name: 'Convention Center',
                address: '655 W 34th St, New York, NY 10001',
                coordinates: [40.7566, -74.0027]
            },
            image: 'img/event-tech.jpg',
            isFeatured: true,
            isMajor: false
        },
        {
            id: '3',
            title: 'Farmers Market',
            type: 'Community',
            date: '2023-07-16',
            time: '8:00 AM',
            description: 'Weekly farmers market featuring local produce, artisanal foods, and handcrafted goods.',
            location: {
                name: 'Union Square',
                address: 'E 17th St & Union Square W, New York, NY 10003',
                coordinates: [40.7359, -73.9911]
            },
            image: 'img/event-market.jpg',
            isFeatured: false,
            isMajor: false
        },
        {
            id: '4',
            title: 'Marathon',
            type: 'Sports',
            date: '2023-08-05',
            time: '7:00 AM',
            description: 'Annual city marathon attracting runners from around the world.',
            location: {
                name: 'City Streets',
                address: 'Starting at Staten Island, New York, NY',
                coordinates: [40.6631, -74.0764]
            },
            image: 'img/event-marathon.jpg',
            isFeatured: true,
            isMajor: true
        },
        {
            id: '5',
            title: 'Art Exhibition Opening',
            type: 'Cultural',
            date: '2023-07-22',
            time: '7:00 PM',
            description: 'Opening night for a new exhibition featuring contemporary artists.',
            location: {
                name: 'Modern Art Museum',
                address: '11 W 53rd St, New York, NY 10019',
                coordinates: [40.7614, -73.9776]
            },
            image: 'img/event-art.jpg',
            isFeatured: false,
            isMajor: false
        },
        {
            id: '6',
            title: 'Startup Networking Event',
            type: 'Business',
            date: '2023-07-18',
            time: '6:30 PM',
            description: 'Networking event for entrepreneurs, investors, and startup enthusiasts.',
            location: {
                name: 'WeWork',
                address: '175 Varick St, New York, NY 10014',
                coordinates: [40.7273, -74.0054]
            },
            image: 'img/event-networking.jpg',
            isFeatured: false,
            isMajor: false
        },
        {
            id: '7',
            title: 'Community Cleanup',
            type: 'Community',
            date: '2023-07-23',
            time: '10:00 AM',
            description: 'Volunteer event to clean up local parks and streets.',
            location: {
                name: 'Riverside Park',
                address: 'Riverside Dr, New York, NY 10025',
                coordinates: [40.8013, -73.9723]
            },
            image: 'img/event-cleanup.jpg',
            isFeatured: false,
            isMajor: false
        },
        {
            id: '8',
            title: 'Basketball Tournament',
            type: 'Sports',
            date: '2023-07-29',
            time: '1:00 PM',
            description: 'Local basketball tournament with teams from across the city.',
            location: {
                name: 'West 4th Street Courts',
                address: 'W 4th St & 6th Ave, New York, NY 10012',
                coordinates: [40.7309, -74.0004]
            },
            image: 'img/event-basketball.jpg',
            isFeatured: false,
            isMajor: false
        },
        {
            id: '9',
            title: 'Food Festival',
            type: 'Cultural',
            date: '2023-08-12',
            time: '11:00 AM',
            description: 'Celebration of diverse cuisines with food vendors, cooking demonstrations, and tastings.',
            location: {
                name: 'Hudson Yards',
                address: '20 Hudson Yards, New York, NY 10001',
                coordinates: [40.7539, -74.0027]
            },
            image: 'img/event-food.jpg',
            isFeatured: false,
            isMajor: true
        },
        {
            id: '10',
            title: 'Job Fair',
            type: 'Business',
            date: '2023-07-25',
            time: '10:00 AM',
            description: 'Career fair with employers from various industries looking to hire.',
            location: {
                name: 'Javits Center',
                address: '429 11th Ave, New York, NY 10001',
                coordinates: [40.7578, -74.0026]
            },
            image: 'img/event-jobfair.jpg',
            isFeatured: false,
            isMajor: false
        }
    ];
}

/**
 * Get event category counts for the selected city
 * @returns {Object} Object with category names as keys and counts as values
 */
function getEventCategoryCounts() {
    const events = getEventsData();
    const categoryCounts = {};
    
    events.forEach(event => {
        if (!categoryCounts[event.type]) {
            categoryCounts[event.type] = 0;
        }
        categoryCounts[event.type]++;
    });
    
    return categoryCounts;
}

/**
 * Get color for event type
 * @param {string} type - Event type
 * @returns {string} Bootstrap color class suffix
 */
function getEventTypeColor(type) {
    const colorMap = {
        'Cultural': 'primary',
        'Business': 'info',
        'Community': 'success',
        'Sports': 'warning',
        'Education': 'secondary',
        'Other': 'dark'
    };
    
    return colorMap[type] || 'primary';
}

/**
 * Get icon for event type
 * @param {string} type - Event type
 * @returns {string} Bootstrap icon class
 */
function getEventIcon(type) {
    const iconMap = {
        'Cultural': 'bi-music-note-beamed',
        'Business': 'bi-briefcase',
        'Community': 'bi-people',
        'Sports': 'bi-trophy',
        'Education': 'bi-book',
        'Other': 'bi-calendar-event'
    };
    
    return iconMap[type] || 'bi-calendar-event';
}