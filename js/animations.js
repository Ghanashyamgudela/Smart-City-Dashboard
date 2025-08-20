// Smart City Dashboard - Animations JavaScript File

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Animations initialized');
    
    // Initialize all animations
    initializeAnimations();
    
    // Add scroll event listener for scroll-triggered animations
    window.addEventListener('scroll', function() {
        animateOnScroll();
    });
});

// Initialize all animations
function initializeAnimations() {
    // Initialize AOS (Animate On Scroll) if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    } else {
        // Fallback animations if AOS is not available
        setupFallbackAnimations();
    }
    
    // Add animation classes to elements
    addAnimationClasses();
    
    // Initialize number counters
    initializeCounters();
    
    // Initialize chart animations (if on pages with charts)
    initializeChartAnimations();
    
    // Add hover animations
    addHoverAnimations();
}

// Add animation classes to elements
function addAnimationClasses() {
    // Hero section fade in
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.classList.add('animate__animated', 'animate__fadeIn');
    }
    
    // Feature cards staggered animation
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.transitionDelay = (index * 0.1) + 's';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    });
    
    // City cards staggered animation
    const cityCards = document.querySelectorAll('.city-card');
    cityCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.transitionDelay = (index * 0.1) + 's';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300);
    });
    
    // Metric cards staggered animation
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.transitionDelay = (index * 0.1) + 's';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200);
    });
}

// Setup fallback animations if AOS is not available
function setupFallbackAnimations() {
    // Add fade-in animation to sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('fade-in-section');
    });
    
    // Add slide-in animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('slide-in-card');
    });
}

// Animate elements when they come into view on scroll
function animateOnScroll() {
    // Only run if AOS is not available (as AOS handles this automatically)
    if (typeof AOS !== 'undefined') return;
    
    // Get all elements with animation classes
    const fadeElements = document.querySelectorAll('.fade-in-section');
    const slideElements = document.querySelectorAll('.slide-in-card');
    
    // Check if elements are in viewport and animate them
    fadeElements.forEach(element => {
        if (isInViewport(element) && !element.classList.contains('is-visible')) {
            element.classList.add('is-visible');
        }
    });
    
    slideElements.forEach(element => {
        if (isInViewport(element) && !element.classList.contains('is-visible')) {
            element.classList.add('is-visible');
        }
    });
}

// Check if an element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
        rect.bottom >= 0
    );
}

// Initialize number counters with animation
function initializeCounters() {
    const counterElements = document.querySelectorAll('.counter-value');
    
    counterElements.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 1500; // Animation duration in milliseconds
        const step = Math.ceil(target / (duration / 16)); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current >= target) {
                counter.textContent = target;
                return;
            }
            counter.textContent = current;
            requestAnimationFrame(updateCounter);
        };
        
        // Start counter animation when element is in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

// Initialize chart animations
function initializeChartAnimations() {
    // Add animation options to Chart.js if it exists
    if (typeof Chart !== 'undefined') {
        // Override global chart animation defaults
        Chart.defaults.animation = {
            duration: 2000,
            easing: 'easeOutQuart'
        };
        
        // Add animation to existing charts if they exist
        animateExistingCharts();
    }
}

// Animate existing charts
function animateExistingCharts() {
    // Traffic Trends Chart animation
    if (typeof trafficTrendsChart !== 'undefined') {
        trafficTrendsChart.options.animation = {
            duration: 2000,
            easing: 'easeOutQuart'
        };
        trafficTrendsChart.update();
    }
    
    // Environmental Metrics Chart animation
    if (typeof environmentalMetricsChart !== 'undefined') {
        environmentalMetricsChart.options.animation = {
            duration: 2000,
            easing: 'easeOutQuart'
        };
        environmentalMetricsChart.update();
    }
    
    // Hourly Congestion Chart animation
    if (typeof hourlyCongestionChart !== 'undefined') {
        hourlyCongestionChart.options.animation = {
            duration: 2000,
            easing: 'easeOutQuart'
        };
        hourlyCongestionChart.update();
    }
    
    // Congestion By Area Chart animation
    if (typeof congestionByAreaChart !== 'undefined') {
        congestionByAreaChart.options.animation = {
            duration: 2000,
            easing: 'easeOutQuart'
        };
        congestionByAreaChart.update();
    }
    
    // Air Quality Chart animation
    if (typeof airQualityChart !== 'undefined') {
        airQualityChart.options.animation = {
            duration: 2000,
            easing: 'easeOutQuart'
        };
        airQualityChart.update();
    }
    
    // Noise Level Chart animation
    if (typeof noiseLevelChart !== 'undefined') {
        noiseLevelChart.options.animation = {
            duration: 2000,
            easing: 'easeOutQuart'
        };
        noiseLevelChart.update();
    }
}

// Add hover animations
function addHoverAnimations() {
    // Add pulse effect to metric icons on hover
    const metricIcons = document.querySelectorAll('.metric-icon');
    metricIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.classList.add('pulse-animation');
        });
        
        icon.addEventListener('mouseleave', function() {
            this.classList.remove('pulse-animation');
        });
    });
    
    // Add glow effect to buttons on hover
    const buttons = document.querySelectorAll('.btn-primary, .btn-outline-primary');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.classList.add('glow-animation');
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('glow-animation');
        });
    });
    
    // Add scale effect to event cards on hover
    const eventItems = document.querySelectorAll('.event-item');
    eventItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.classList.add('scale-animation');
        });
        
        item.addEventListener('mouseleave', function() {
            this.classList.remove('scale-animation');
        });
    });
}

// Add animation to map markers when they are added
function animateMapMarkers() {
    // Check if Leaflet is available
    if (typeof L !== 'undefined') {
        // Override the Leaflet marker add method to include animation
        const originalOnAdd = L.Marker.prototype.onAdd;
        L.Marker.prototype.onAdd = function(map) {
            // Call the original onAdd method
            originalOnAdd.call(this, map);
            
            // Add animation class to the marker icon
            if (this._icon) {
                this._icon.classList.add('marker-animation');
            }
        };
    }
}

// Add animation when data updates
function animateDataUpdate(element) {
    // Add flash animation to element when data updates
    element.classList.add('flash-animation');
    
    // Remove animation class after animation completes
    setTimeout(() => {
        element.classList.remove('flash-animation');
    }, 1000);
}

// Export functions for use in other scripts
window.cityDashboardAnimations = {
    animateDataUpdate: animateDataUpdate,
    animateMapMarkers: animateMapMarkers,
    initializeCounters: initializeCounters
};