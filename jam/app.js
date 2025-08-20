const AppState = {
    currentSection: 'homepage',
    currentStep: 1,
    selectedService: null,
    selectedSubcategory: null,
    selectedDate: null,
    selectedTime: null,
    userDetails: {},
    bookingData: {},
    user: null,
    isLoggedIn: false,
    bookingHistory: [],
    calendar: {
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear()
    }
};

// Services Data
const ServicesData = {
    services: [
        {
            id: "salon",
            name: "Salon Services",
            description: "Professional haircuts, styling, facials, and beauty treatments at your doorstep",
            price_range: "₹299 - ₹1999",
            icon: "💇‍♀️",
            subcategories: [
                { id: "haircut", name: "Haircut & Styling", price: 599, platform_fee: 29 },
                { id: "facial", name: "Facial & Cleanup", price: 899, platform_fee: 29 },
                { id: "manicure", name: "Manicure & Pedicure", price: 799, platform_fee: 29 },
                { id: "haircolor", name: "Hair Color & Treatment", price: 1299, platform_fee: 29 }
            ]
        },
        {
            id: "cleaning",
            name: "Home Cleaning",
            description: "Deep cleaning, regular maintenance, and specialized cleaning services",
            price_range: "₹199 - ₹899",
            icon: "🧹",
            subcategories: [
                { id: "deep", name: "Deep Cleaning", price: 699, platform_fee: 29 },
                { id: "regular", name: "Regular Cleaning", price: 399, platform_fee: 29 },
                { id: "carpet", name: "Carpet Cleaning", price: 499, platform_fee: 29 },
                { id: "kitchen", name: "Kitchen Deep Clean", price: 599, platform_fee: 29 }
            ]
        },
        {
            id: "repair",
            name: "Appliance Repair",
            description: "Expert repair services for all your home appliances and electronics",
            price_range: "₹149 - ₹799",
            icon: "🔧",
            subcategories: [
                { id: "ac", name: "AC Repair", price: 399, platform_fee: 29 },
                { id: "washing", name: "Washing Machine", price: 299, platform_fee: 29 },
                { id: "fridge", name: "Refrigerator", price: 499, platform_fee: 29 },
                { id: "microwave", name: "Microwave Repair", price: 249, platform_fee: 29 }
            ]
        }
    ],
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"]
};

// Utility Functions
const Utils = {
    formatDate: (date) => {
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatPrice: (price) => {
        return `₹${price}`;
    },

    getDaysInMonth: (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    },

    getFirstDayOfMonth: (month, year) => {
        return new Date(year, month, 1).getDay();
    },

    isToday: (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    },

    isPastDate: (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    },

    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isValidPhone: (phone) => {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    },

    formatCardNumber: (value) => {
        return value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').match(/.{1,4}/g)?.join(' ') || '';
    },

    formatExpiry: (value) => {
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length >= 2) {
            return cleanValue.slice(0, 2) + '/' + cleanValue.slice(2, 4);
        }
        return cleanValue;
    },

    generateBookingId: () => {
        return 'SH' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
};

// Page Transitions Controller
const PageTransitions = {
    showHomepage: () => {
        console.log('Showing homepage');
        AppState.currentSection = 'homepage';
        PageTransitions.hideAllSections();
        const homepage = document.getElementById('homepage');
        if (homepage) {
            homepage.classList.remove('hidden');
        }
        Navigation.updateActiveLink();
    },

    showBookingHistory: () => {
        console.log('Showing booking history');
        AppState.currentSection = 'booking-history';
        PageTransitions.hideAllSections();
        const bookingHistorySection = document.getElementById('booking-history');
        if (bookingHistorySection) {
            bookingHistorySection.classList.remove('hidden');
        }
        BookingHistory.render();
        Navigation.updateActiveLink();
        window.scrollTo(0, 0);
    },

    showBooking: () => {
        console.log('Showing booking page');
        AppState.currentSection = 'booking-section';
        AppState.currentStep = 1;
        PageTransitions.hideAllSections();
        const bookingSection = document.getElementById('booking-section');
        if (bookingSection) {
            bookingSection.classList.remove('hidden');
        }
        
        // Initialize booking steps immediately
        Booking.updateStepVisibility();
        Booking.updateNavigationButtons();
        if (AppState.selectedService) {
            Booking.renderServiceSelection();
        }
        
        Navigation.updateActiveLink();
        window.scrollTo(0, 0);
    },

    showPayment: () => {
        console.log('Showing payment page');
        AppState.currentSection = 'payment-section';
        PageTransitions.hideAllSections();
        const paymentSection = document.getElementById('payment-section');
        if (paymentSection) {
            paymentSection.classList.remove('hidden');
        }
        
        Payment.init();
        Navigation.updateActiveLink();
        window.scrollTo(0, 0);
    },

    showSuccess: () => {
        console.log('Showing success page');
        AppState.currentSection = 'success-section';
        PageTransitions.hideAllSections();
        const successSection = document.getElementById('success-section');
        if (successSection) {
            successSection.classList.remove('hidden');
        }
        Navigation.updateActiveLink();
        window.scrollTo(0, 0);
    },

    hideAllSections: () => {
        const sections = [
            document.getElementById('homepage'),
            document.getElementById('booking-history'),
            document.getElementById('booking-section'),
            document.getElementById('payment-section'),
            document.getElementById('success-section')
        ];

        sections.forEach(section => {
            if (section) {
                section.classList.add('hidden');
            }
        });
    }
};

// Authentication Controller
const Auth = {
    init: () => {
        Auth.bindEvents();
        Auth.loadUserFromStorage();
    },

    bindEvents: () => {
        // Profile dropdown toggle
        const profileDropdown = document.getElementById('profile-dropdown');
        if (profileDropdown) {
            profileDropdown.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                Auth.toggleProfileDropdown();
            });
        }

        // Login and Register links
        const loginLink = document.getElementById('login-link');
        const registerLink = document.getElementById('register-link');
        
        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                Auth.showLoginModal();
            });
        }
        
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                Auth.showRegisterModal();
            });
        }

        // Form submissions
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                Auth.handleLogin();
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                Auth.handleRegister();
            });
        }

        // Close dropdowns on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav__dropdown')) {
                Auth.closeProfileDropdown();
            }
        });
    },

    toggleProfileDropdown: () => {
        const dropdown = document.querySelector('.nav__dropdown');
        if (dropdown) {
            const isActive = dropdown.classList.contains('active');
            dropdown.classList.toggle('active', !isActive);
        }
    },

    closeProfileDropdown: () => {
        const dropdown = document.querySelector('.nav__dropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    },

    showLoginModal: () => {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        Auth.closeProfileDropdown();
    },

    showRegisterModal: () => {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        Auth.closeProfileDropdown();
    },

    handleLogin: () => {
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        if (!Utils.isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        const user = {
            id: 'user_' + Date.now(),
            name: email.split('@')[0],
            email: email,
            loginAt: new Date()
        };

        AppState.user = user;
        AppState.isLoggedIn = true;

        Auth.updateUIForLoggedInUser();
        Auth.closeModal('login-modal');
        alert('Login successful!');
    },

    handleRegister: () => {
        const name = document.getElementById('register-name')?.value;
        const email = document.getElementById('register-email')?.value;
        const phone = document.getElementById('register-phone')?.value;
        const password = document.getElementById('register-password')?.value;

        if (!name || !email || !phone || !password) {
            alert('Please fill in all fields');
            return;
        }

        if (!Utils.isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        if (!Utils.isValidPhone(phone)) {
            alert('Please enter a valid phone number');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        const user = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            phone: phone,
            registeredAt: new Date()
        };

        AppState.user = user;
        AppState.isLoggedIn = true;

        Auth.updateUIForLoggedInUser();
        Auth.closeModal('register-modal');
        alert('Registration successful! Welcome to JAM Services!');
    },

    updateUIForLoggedInUser: () => {
        const loginLink = document.getElementById('login-link');
        const registerLink = document.getElementById('register-link');
        if (loginLink) loginLink.parentElement.classList.add('hidden');
        if (registerLink) registerLink.parentElement.classList.add('hidden');

        const profileDivider = document.getElementById('profile-divider');
        const myProfileLink = document.getElementById('my-profile-link');
        const logoutLink = document.getElementById('logout-link');
        
        if (profileDivider) profileDivider.classList.remove('hidden');
        if (myProfileLink) myProfileLink.classList.remove('hidden');
        if (logoutLink) {
            logoutLink.classList.remove('hidden');
            const logoutAnchor = logoutLink.querySelector('a');
            if (logoutAnchor) {
                logoutAnchor.onclick = (e) => {
                    e.preventDefault();
                    Auth.logout();
                };
            }
        }
    },

    logout: () => {
        AppState.user = null;
        AppState.isLoggedIn = false;
        
        const loginLink = document.getElementById('login-link');
        const registerLink = document.getElementById('register-link');
        if (loginLink) loginLink.parentElement.classList.remove('hidden');
        if (registerLink) registerLink.parentElement.classList.remove('hidden');

        const profileDivider = document.getElementById('profile-divider');
        const myProfileLink = document.getElementById('my-profile-link');
        const logoutLink = document.getElementById('logout-link');
        
        if (profileDivider) profileDivider.classList.add('hidden');
        if (myProfileLink) myProfileLink.classList.add('hidden');
        if (logoutLink) logoutLink.classList.add('hidden');

        Auth.closeProfileDropdown();
        alert('You have been logged out successfully');
    },

    loadUserFromStorage: () => {
        // Initialize with empty user state
        AppState.user = null;
        AppState.isLoggedIn = false;
    },

    closeModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }
};

// Navigation Controller
const Navigation = {
    init: () => {
        Navigation.bindEvents();
        Navigation.updateActiveLink();
    },

    bindEvents: () => {
        // Mobile menu toggle
        const navToggle = document.getElementById('nav-toggle');
        if (navToggle) {
            navToggle.onclick = (e) => {
                e.preventDefault();
                Navigation.toggleMenu();
            };
        }
        
        // Navigation links (excluding profile dropdown toggle)
        const homeLink = document.querySelector('a[href="#home"]');
        const servicesLink = document.querySelector('a[href="#services"]');
        const bookingHistoryLink = document.querySelector('a[href="#booking-history"]');
        
        if (homeLink) {
            homeLink.onclick = (e) => {
                e.preventDefault();
                Navigation.navigateToSection('home');
            };
        }
        
        if (servicesLink) {
            servicesLink.onclick = (e) => {
                e.preventDefault();
                Navigation.navigateToSection('services');
            };
        }
        
        if (bookingHistoryLink) {
            bookingHistoryLink.onclick = (e) => {
                e.preventDefault();
                Navigation.navigateToSection('booking-history');
            };
        }

        // Hero CTA button
        const heroCTA = document.querySelector('.hero__cta');
        if (heroCTA) {
            heroCTA.onclick = (e) => {
                e.preventDefault();
                Navigation.scrollToServices();
            };
        }

        // ServiceHub logo
        const navLogo = document.querySelector('.nav__logo');
        if (navLogo) {
            navLogo.onclick = (e) => {
                e.preventDefault();
                Navigation.navigateToSection('home');
            };
            navLogo.style.cursor = 'pointer';
        }
    },

    navigateToSection: (sectionId) => {
        console.log('Navigating to section:', sectionId);
        Navigation.closeMenu();
        
        switch (sectionId) {
            case 'home':
                PageTransitions.showHomepage();
                break;
            case 'services':
                PageTransitions.showHomepage();
                setTimeout(() => Navigation.scrollToServices(), 100);
                break;
            case 'booking-history':
                PageTransitions.showBookingHistory();
                break;
            default:
                PageTransitions.showHomepage();
                break;
        }
    },

    scrollToServices: () => {
        PageTransitions.showHomepage();
        setTimeout(() => {
            const servicesSection = document.querySelector('.services');
            if (servicesSection) {
                servicesSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 200);
    },

    toggleMenu: () => {
        const navMenu = document.getElementById('nav-menu');
        navMenu?.classList.toggle('active');
    },

    closeMenu: () => {
        const navMenu = document.getElementById('nav-menu');
        navMenu?.classList.remove('active');
    },

    updateActiveLink: () => {
        const currentSection = AppState.currentSection;
        const navLinks = document.querySelectorAll('.nav__link:not(.nav__dropdown-toggle)');
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if ((href === '#home' && currentSection === 'homepage') ||
                (href === '#booking-history' && currentSection === 'booking-history') ||
                (href === `#${currentSection}`)) {
                link.classList.add('active');
            }
        });
    }
};

// Booking History Controller
const BookingHistory = {
    render: () => {
        const container = document.getElementById('booking-history-content');
        if (!container) return;

        // Mock booking history data for demonstration
        AppState.bookingHistory = [
            {
                id: 'SH123456789ABC',
                service: 'Salon Services',
                subcategory: 'Haircut & Styling',
                date: new Date('2025-08-05'),
                time: '10:00 AM',
                customer: { name: 'Demo User' },
                amount: 628,
                status: 'confirmed',
                createdAt: new Date('2025-08-01')
            }
        ];

        if (AppState.bookingHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">📋</div>
                    <h3 class="empty-state__title">No Bookings Yet</h3>
                    <p class="empty-state__message">You haven't made any bookings yet. Start by browsing our services!</p>
                    <button class="btn btn--primary" onclick="scrollToServices()">Browse Services</button>
                </div>
            `;
        } else {
            const bookingsList = AppState.bookingHistory.map(booking => `
                <div class="booking-item">
                    <div class="booking-item__details">
                        <h4>${booking.service} - ${booking.subcategory}</h4>
                        <p>Booking ID: ${booking.id}</p>
                        <p>${Utils.formatDate(new Date(booking.date))} at ${booking.time}</p>
                        <p>Customer: ${booking.customer.name}</p>
                    </div>
                    <div class="booking-item__meta">
                        <div class="booking-item__date">${new Date(booking.createdAt).toLocaleDateString()}</div>
                        <div class="booking-item__amount">${Utils.formatPrice(booking.amount)}</div>
                        <div class="status status--success">${booking.status}</div>
                    </div>
                </div>
            `).join('');

            container.innerHTML = `
                <div class="booking-list">
                    ${bookingsList}
                </div>
            `;
        }
    }
};

// Services Controller
const Services = {
    init: () => {
        Services.renderServiceCards();
    },

    renderServiceCards: () => {
        const container = document.getElementById('services-grid');
        if (!container) return;

        container.innerHTML = ServicesData.services.map(service => `
            <div class="service-card" data-service-id="${service.id}">
                <span class="service-card__icon">${service.icon}</span>
                <h3 class="service-card__title">${service.name}</h3>
                <p class="service-card__description">${service.description}</p>
                <p class="service-card__price">${service.price_range}</p>
                <button class="btn btn--primary service-card__button" data-service-id="${service.id}">
                    Book Now
                </button>
            </div>
        `).join('');

        Services.bindServiceCardEvents();
    },

    bindServiceCardEvents: () => {
        console.log('Binding service card events');
        
        const serviceButtons = document.querySelectorAll('.service-card__button');
        console.log('Found service buttons:', serviceButtons.length);
        
        serviceButtons.forEach(button => {            
            button.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const serviceId = button.getAttribute('data-service-id');
                console.log('Service button clicked:', serviceId);
                Services.bookService(serviceId);
            };
        });

        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.onclick = (e) => {
                if (!e.target.classList.contains('service-card__button')) {
                    const serviceId = card.getAttribute('data-service-id');
                    console.log('Service card clicked:', serviceId);
                    Services.bookService(serviceId);
                }
            };
        });
    },

    bookService: (serviceId) => {
        console.log('Booking service:', serviceId);
        const service = ServicesData.services.find(s => s.id === serviceId);
        if (service) {
            AppState.selectedService = service;
            PageTransitions.showBooking();
        } else {
            console.error('Service not found:', serviceId);
        }
    }
};

// Booking Controller
const Booking = {
    init: () => {
        console.log('Booking controller initialized');
    },

    bindNavigationEvents: () => {
        const nextStep = document.getElementById('next-step');
        const prevStep = document.getElementById('prev-step');
        
        if (nextStep) {
            nextStep.onclick = (e) => {
                e.preventDefault();
                console.log('Next step clicked, current step:', AppState.currentStep);
                
                if (AppState.currentStep === 4) {
                    console.log('Proceeding to payment...');
                    if (Booking.validateCurrentStep()) {
                        Booking.saveUserDetails();
                        PageTransitions.showPayment();
                    }
                } else {
                    Booking.nextStep();
                }
            };
        }
        
        if (prevStep) {
            prevStep.onclick = (e) => {
                e.preventDefault();
                console.log('Previous step clicked');
                Booking.prevStep();
            };
        }

        // Calendar navigation
        const prevMonth = document.getElementById('prev-month');
        const nextMonth = document.getElementById('next-month');
        
        if (prevMonth) {
            prevMonth.onclick = (e) => {
                e.preventDefault();
                Calendar.changeMonth(-1);
            };
        }
        if (nextMonth) {
            nextMonth.onclick = (e) => {
                e.preventDefault();
                Calendar.changeMonth(1);
            };
        }

        // Form validation
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            const formInputs = bookingForm.querySelectorAll('input, textarea');
            formInputs.forEach(input => {
                input.onblur = () => FormValidation.validateField(input);
                input.oninput = () => FormValidation.clearError(input);
            });
        }
    },

    renderServiceSelection: () => {
        console.log('Rendering service selection for:', AppState.selectedService?.name);
        const container = document.getElementById('service-selection');
        if (!container || !AppState.selectedService) return;

        container.innerHTML = `
            <div class="service-option selected" data-service-id="${AppState.selectedService.id}">
                <div class="service-option__header">
                    <span class="service-option__icon">${AppState.selectedService.icon}</span>
                    <h4 class="service-option__title">${AppState.selectedService.name}</h4>
                </div>
                <p class="service-option__description">${AppState.selectedService.description}</p>
                <p class="service-option__price">${AppState.selectedService.price_range}</p>
                <div class="subcategory-grid">
                    ${AppState.selectedService.subcategories.map(sub => `
                        <div class="subcategory-option" data-subcategory-id="${sub.id}">
                            <div class="subcategory-option__name">${sub.name}</div>
                            <div class="subcategory-option__price">${Utils.formatPrice(sub.price)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Bind subcategory selection events
        const subcategoryOptions = container.querySelectorAll('.subcategory-option');
        subcategoryOptions.forEach(option => {
            option.onclick = (e) => {
                e.preventDefault();
                const subcategoryId = option.getAttribute('data-subcategory-id');
                console.log('Subcategory selected:', subcategoryId);
                Booking.selectSubcategory(subcategoryId);
            };
        });

        Booking.updateSummary();
    },

    selectSubcategory: (subcategoryId) => {
        console.log('Selecting subcategory:', subcategoryId);
        document.querySelectorAll('.subcategory-option').forEach(el => {
            el.classList.remove('selected');
        });

        const selectedElement = document.querySelector(`[data-subcategory-id="${subcategoryId}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
            AppState.selectedSubcategory = AppState.selectedService.subcategories.find(s => s.id === subcategoryId);
            console.log('Selected subcategory:', AppState.selectedSubcategory);
            Booking.updateSummary();
        }
    },

    nextStep: () => {
        console.log('Current step:', AppState.currentStep);
        if (Booking.validateCurrentStep()) {
            AppState.currentStep++;
            console.log('Moving to step:', AppState.currentStep);
            Booking.updateStepVisibility();
            Booking.updateNavigationButtons();
            
            if (AppState.currentStep === 2) {
                setTimeout(() => Calendar.init(), 100);
            } else if (AppState.currentStep === 3) {
                setTimeout(() => TimeSlots.render(), 100);
            }
        }
    },

    prevStep: () => {
        AppState.currentStep--;
        console.log('Moving back to step:', AppState.currentStep);
        Booking.updateStepVisibility();
        Booking.updateNavigationButtons();
    },

    validateCurrentStep: () => {
        switch (AppState.currentStep) {
            case 1:
                if (!AppState.selectedSubcategory) {
                    alert('Please select a service category');
                    return false;
                }
                return true;
            case 2:
                if (!AppState.selectedDate) {
                    alert('Please select a date');
                    return false;
                }
                return true;
            case 3:
                if (!AppState.selectedTime) {
                    alert('Please select a time slot');
                    return false;
                }
                return true;
            case 4:
                return FormValidation.validateForm();
            default:
                return true;
        }
    },

    updateStepVisibility: () => {
        const steps = [
            document.getElementById('step-service'),
            document.getElementById('step-date'),
            document.getElementById('step-time'),
            document.getElementById('step-details')
        ];
        
        steps.forEach((step, index) => {
            if (step) {
                if (index + 1 === AppState.currentStep) {
                    step.classList.remove('hidden');
                    step.classList.add('fade-in');
                } else {
                    step.classList.add('hidden');
                    step.classList.remove('fade-in');
                }
            }
        });
        
        // Bind navigation events after step visibility update
        Booking.bindNavigationEvents();
    },

    updateNavigationButtons: () => {
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');

        if (prevBtn) {
            prevBtn.classList.toggle('hidden', AppState.currentStep === 1);
        }

        if (nextBtn) {
            if (AppState.currentStep === 4) {
                nextBtn.textContent = 'Proceed to Payment';
            } else {
                nextBtn.textContent = 'Next';
            }
        }
    },

    saveUserDetails: () => {
        const form = document.getElementById('booking-form');
        if (form) {
            AppState.userDetails = {
                name: form.querySelector('#full-name')?.value || '',
                email: form.querySelector('#email')?.value || '',
                phone: form.querySelector('#phone')?.value || '',
                address: form.querySelector('#address')?.value || ''
            };
        }
    },

    updateSummary: () => {
        const container = document.getElementById('order-summary');
        if (!container) return;

        if (!AppState.selectedSubcategory) {
            container.innerHTML = '<p class="summary__placeholder">Select a service to see pricing</p>';
            return;
        }

        const serviceFee = AppState.selectedSubcategory.price;
        const platformFee = AppState.selectedSubcategory.platform_fee || 29;
        const total = serviceFee + platformFee;

        container.innerHTML = `
            <div class="summary__item">
                <span class="summary__label">${AppState.selectedSubcategory.name}</span>
                <span class="summary__value">${Utils.formatPrice(serviceFee)}</span>
            </div>
            <div class="summary__item">
                <span class="summary__label">Platform Fee</span>
                <span class="summary__value">${Utils.formatPrice(platformFee)}</span>
            </div>
            <div class="summary__item summary__total">
                <span class="summary__label">Total</span>
                <span class="summary__value">${Utils.formatPrice(total)}</span>
            </div>
            ${AppState.selectedDate ? `
                <div class="summary__item" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-border);">
                    <span class="summary__label">Date</span>
                    <span class="summary__value">${Utils.formatDate(AppState.selectedDate)}</span>
                </div>
            ` : ''}
            ${AppState.selectedTime ? `
                <div class="summary__item">
                    <span class="summary__label">Time</span>
                    <span class="summary__value">${AppState.selectedTime}</span>
                </div>
            ` : ''}
        `;
    }
};

// Calendar Controller
const Calendar = {
    init: () => {
        console.log('Initializing calendar');
        Calendar.render();
    },

    render: () => {
        const { currentMonth, currentYear } = AppState.calendar;
        
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const calendarMonth = document.getElementById('calendar-month');
        if (calendarMonth) {
            calendarMonth.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        }

        Calendar.renderGrid();
    },

    renderGrid: () => {
        const container = document.getElementById('calendar-grid');
        if (!container) return;

        const { currentMonth, currentYear } = AppState.calendar;
        const daysInMonth = Utils.getDaysInMonth(currentMonth, currentYear);
        const firstDay = Utils.getFirstDayOfMonth(currentMonth, currentYear);

        let html = '';

        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            html += `<div class="calendar__day-header">${day}</div>`;
        });

        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar__day"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isToday = Utils.isToday(date);
            const isPast = Utils.isPastDate(date);
            const isSelected = AppState.selectedDate && date.toDateString() === AppState.selectedDate.toDateString();

            let classes = 'calendar__day';
            if (isToday) classes += ' today';
            if (isPast) classes += ' disabled';
            if (isSelected) classes += ' selected';

            html += `
                <div class="${classes}" data-date="${date.toISOString()}">
                    ${day}
                </div>
            `;
        }

        container.innerHTML = html;

        // Bind click events to calendar days
        const calendarDays = container.querySelectorAll('.calendar__day:not(.disabled)');
        calendarDays.forEach(day => {
            day.onclick = (e) => {
                e.preventDefault();
                const dateString = day.getAttribute('data-date');
                if (dateString) {
                    Calendar.selectDate(dateString);
                }
            };
        });
    },

    selectDate: (dateString) => {
        const date = new Date(dateString);
        
        if (Utils.isPastDate(date)) {
            return;
        }

        AppState.selectedDate = date;
        console.log('Selected date:', AppState.selectedDate);
        Calendar.render();
        Booking.updateSummary();
    },

    changeMonth: (direction) => {
        AppState.calendar.currentMonth += direction;
        
        if (AppState.calendar.currentMonth > 11) {
            AppState.calendar.currentMonth = 0;
            AppState.calendar.currentYear++;
        } else if (AppState.calendar.currentMonth < 0) {
            AppState.calendar.currentMonth = 11;
            AppState.calendar.currentYear--;
        }

        Calendar.render();
    }
};

// Time Slots Controller
const TimeSlots = {
    render: () => {
        console.log('Rendering time slots');
        const container = document.getElementById('time-slots');
        if (!container) return;

        container.innerHTML = ServicesData.timeSlots.map(time => `
            <div class="time-slot" data-time="${time}">
                ${time}
            </div>
        `).join('');

        // Bind click events to time slots
        const timeSlotElements = container.querySelectorAll('.time-slot');
        timeSlotElements.forEach(slot => {
            slot.onclick = (e) => {
                e.preventDefault();
                const time = slot.getAttribute('data-time');
                TimeSlots.selectTime(time);
            };
        });
    },

    selectTime: (time) => {
        document.querySelectorAll('.time-slot').forEach(el => {
            el.classList.remove('selected');
        });

        const selectedElement = document.querySelector(`[data-time="${time}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
            AppState.selectedTime = time;
            console.log('Selected time:', AppState.selectedTime);
            Booking.updateSummary();
        }
    }
};

// Form Validation Controller
const FormValidation = {
    validateForm: () => {
        const form = document.getElementById('booking-form');
        if (!form) return false;

        let isValid = true;
        const fields = form.querySelectorAll('input[required], textarea[required]');

        fields.forEach(field => {
            if (!FormValidation.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    },

    validateField: (field) => {
        const value = field.value.trim();
        const fieldId = field.id;
        let isValid = true;
        let errorMessage = '';

        if (!value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else {
            switch (fieldId) {
                case 'email':
                    if (!Utils.isValidEmail(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                case 'phone':
                    if (!Utils.isValidPhone(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid 10-digit phone number';
                    }
                    break;
                case 'full-name':
                    if (value.length < 2) {
                        isValid = false;
                        errorMessage = 'Name must be at least 2 characters long';
                    }
                    break;
            }
        }

        FormValidation.showError(field, isValid ? '' : errorMessage);
        return isValid;
    },

    showError: (field, message) => {
        const errorId = field.id.replace(/-/g, '') + 'error';
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
        }
        
        field.classList.toggle('error', !!message);
    },

    clearError: (field) => {
        FormValidation.showError(field, '');
    }
};

// Payment Controller
const Payment = {
    init: () => {
        console.log('Payment controller initialized');
        Payment.bindEvents();
        Payment.updateSummary();
    },

    bindEvents: () => {
        const cardNumber = document.getElementById('card-number');
        const expiry = document.getElementById('expiry');
        const cvv = document.getElementById('cvv');

        if (cardNumber) {
            cardNumber.oninput = (e) => {
                e.target.value = Utils.formatCardNumber(e.target.value);
            };
        }

        if (expiry) {
            expiry.oninput = (e) => {
                e.target.value = Utils.formatExpiry(e.target.value);
            };
        }

        if (cvv) {
            cvv.oninput = (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
            };
        }

        const payNow = document.getElementById('pay-now');
        if (payNow) {
            payNow.onclick = (e) => {
                e.preventDefault();
                Payment.processPayment();
            };
        }
    },

    updateSummary: () => {
        const container = document.getElementById('payment-summary');
        if (!container || !AppState.selectedSubcategory) return;

        const serviceFee = AppState.selectedSubcategory.price;
        const platformFee = AppState.selectedSubcategory.platform_fee || 29;
        const total = serviceFee + platformFee;

        container.innerHTML = `
            <div class="summary__item">
                <span class="summary__label">${AppState.selectedSubcategory.name}</span>
                <span class="summary__value">${Utils.formatPrice(serviceFee)}</span>
            </div>
            <div class="summary__item">
                <span class="summary__label">Platform Fee</span>
                <span class="summary__value">${Utils.formatPrice(platformFee)}</span>
            </div>
            <div class="summary__item summary__total">
                <span class="summary__label">Total Amount</span>
                <span class="summary__value">${Utils.formatPrice(total)}</span>
            </div>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-border);">
                <div class="summary__item">
                    <span class="summary__label">Service</span>
                    <span class="summary__value">${AppState.selectedService.name}</span>
                </div>
                <div class="summary__item">
                    <span class="summary__label">Date</span>
                    <span class="summary__value">${Utils.formatDate(AppState.selectedDate)}</span>
                </div>
                <div class="summary__item">
                    <span class="summary__label">Time</span>
                    <span class="summary__value">${AppState.selectedTime}</span>
                </div>
                <div class="summary__item">
                    <span class="summary__label">Customer</span>
                    <span class="summary__value">${AppState.userDetails.name}</span>
                </div>
            </div>
        `;
    },

    processPayment: async () => {
        if (!Payment.validatePaymentForm()) {
            return;
        }

        const loadingModal = document.getElementById('loading-modal');
        const loadingText = document.getElementById('loading-text');
        
        if (loadingModal && loadingText) {
            loadingModal.classList.remove('hidden');
            loadingText.textContent = 'Processing your payment...';

            await new Promise(resolve => setTimeout(resolve, 2000));
            loadingText.textContent = 'Confirming booking...';
            await new Promise(resolve => setTimeout(resolve, 1500));
            loadingModal.classList.add('hidden');
        }

        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
            Payment.handlePaymentSuccess();
        } else {
            Payment.handlePaymentFailure();
        }
    },

    validatePaymentForm: () => {
        const cardNumber = document.getElementById('card-number')?.value;
        const expiry = document.getElementById('expiry')?.value;
        const cvv = document.getElementById('cvv')?.value;
        const cardholderName = document.getElementById('cardholder-name')?.value;

        if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
            alert('Please enter a valid 16-digit card number');
            return false;
        }

        if (!expiry || expiry.length !== 5) {
            alert('Please enter a valid expiry date (MM/YY)');
            return false;
        }

        if (!cvv || cvv.length !== 3) {
            alert('Please enter a valid 3-digit CVV');
            return false;
        }

        if (!cardholderName || cardholderName.trim().length < 2) {
            alert('Please enter the cardholder name');
            return false;
        }

        return true;
    },

    handlePaymentSuccess: () => {
        const platformFee = AppState.selectedSubcategory.platform_fee || 29;
        
        AppState.bookingData = {
            id: Utils.generateBookingId(),
            service: AppState.selectedService.name,
            subcategory: AppState.selectedSubcategory.name,
            date: AppState.selectedDate,
            time: AppState.selectedTime,
            customer: AppState.userDetails,
            amount: AppState.selectedSubcategory.price + platformFee,
            status: 'confirmed',
            createdAt: new Date()
        };

        PageTransitions.showSuccess();
        Payment.displaySuccessDetails();
    },

    handlePaymentFailure: () => {
        alert('Payment failed. Please try again with different payment details.');
    },

    displaySuccessDetails: () => {
        const container = document.getElementById('success-details');
        if (!container || !AppState.bookingData) return;

        container.innerHTML = `
            <h4 style="margin-bottom: 16px; color: var(--color-success);">Booking Details</h4>
            <div class="summary__item">
                <span class="summary__label">Booking ID</span>
                <span class="summary__value">${AppState.bookingData.id}</span>
            </div>
            <div class="summary__item">
                <span class="summary__label">Service</span>
                <span class="summary__value">${AppState.bookingData.service} - ${AppState.bookingData.subcategory}</span>
            </div>
            <div class="summary__item">
                <span class="summary__label">Date & Time</span>
                <span class="summary__value">${Utils.formatDate(AppState.bookingData.date)} at ${AppState.bookingData.time}</span>
            </div>
            <div class="summary__item">
                <span class="summary__label">Amount Paid</span>
                <span class="summary__value">${Utils.formatPrice(AppState.bookingData.amount)}</span>
            </div>
            <div class="summary__item">
                <span class="summary__label">Status</span>
                <span class="summary__value status status--success">Confirmed</span>
            </div>
        `;
    }
};

// Global Functions (exposed to HTML)
window.scrollToServices = () => {
    Navigation.scrollToServices();
};

window.showHomepage = () => {
    PageTransitions.showHomepage();
};

window.showBooking = () => {
    PageTransitions.showBooking();
};

window.closeModal = (modalId) => {
    Auth.closeModal(modalId);
};

window.switchToLogin = () => {
    Auth.closeModal('register-modal');
    setTimeout(() => Auth.showLoginModal(), 100);
};

window.switchToRegister = () => {
    Auth.closeModal('login-modal');
    setTimeout(() => Auth.showRegisterModal(), 100);
};

window.resetBooking = () => {
    AppState.currentSection = 'homepage';
    AppState.currentStep = 1;
    AppState.selectedService = null;
    AppState.selectedSubcategory = null;
    AppState.selectedDate = null;
    AppState.selectedTime = null;
    AppState.userDetails = {};
    AppState.bookingData = {};

    PageTransitions.showHomepage();

    document.querySelectorAll('form').forEach(form => form.reset());
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
};

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('ServiceHub application initializing...');
    
    // Initialize all controllers
    Auth.init();
    Navigation.init();
    Services.init();
    Booking.init();

    console.log('ServiceHub application initialized successfully!');
});

// Background color rotation
document.addEventListener("DOMContentLoaded", () => {
    const colors = [
        "var(--color-bg-1)", // Light blue
        "var(--color-bg-2)", // Light yellow
        "var(--color-bg-3)",  // Light green
        "var(--color-bg-7)",  // Light pink
        "var(--color-bg-8)",  // Light cyan
        "var(--color-bg-4)", // Light red
        "var(--color-bg-5)",  // Light purple
    ];
    
    let index = 0;
    setInterval(() => {
        document.body.style.backgroundColor = colors[index];
        index = (index + 1) % colors.length;
    }, 2000); // changes every 2 seconds
});

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        document.getElementById("splash-screen").style.display = "none";
        document.getElementById("main-content").style.display = "block";
    }, 5000); // Wait 5s so text shows clearly
});


