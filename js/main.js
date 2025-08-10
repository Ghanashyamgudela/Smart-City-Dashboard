// Smart City Dashboard - Main JavaScript File

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Smart City Dashboard initialized');
    
    // Get URL parameters (for city selection from homepage)
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get('city');
    
    // If a city was selected from the homepage, store it in localStorage
    if (cityParam) {
        localStorage.setItem('selectedCity', cityParam);
        console.log('City selected from URL parameter:', cityParam);
    }
    
    // Get current user from auth.js if available
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    
    // If user has preferences, use their default city
    if (currentUser && currentUser.preferences && currentUser.preferences.defaultCity) {
        if (!localStorage.getItem('selectedCity')) {
            localStorage.setItem('selectedCity', currentUser.preferences.defaultCity);
            console.log('Using user\'s default city:', currentUser.preferences.defaultCity);
        }
    }
    
    // Initialize any components that need to be set up
    initializeComponents();
});

// Initialize UI components
function initializeComponents() {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for navbar height
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Add animation to feature cards when they come into view
    const featureCards = document.querySelectorAll('.feature-card');
    if (featureCards.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        featureCards.forEach(card => {
            observer.observe(card);
        });
    }
    
    // Add event listeners for city cards
    const cityCards = document.querySelectorAll('.city-card a');
    cityCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const cityUrl = this.getAttribute('href');
            const cityName = cityUrl.split('=')[1];
            localStorage.setItem('selectedCity', cityName);
            console.log('City selected from card:', cityName);
        });
    });
}