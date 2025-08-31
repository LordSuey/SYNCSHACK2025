// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeProfileTabs();
    initializeInteractiveFeatures();
});

// Profile tabs functionality
function initializeProfileTabs() {
    const profileTabs = document.querySelectorAll('.profile-tab');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    profileTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchProfileTab(targetTab);
        });
    });
}

function switchProfileTab(tabId) {
    console.log('Switching to tab:', tabId);
    
    // Update active profile tab
    const profileTabs = document.querySelectorAll('.profile-tab');
    profileTabs.forEach(tab => tab.classList.remove('active'));
    const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Update active tab panel
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabPanels.forEach(panel => panel.classList.remove('active'));
    const targetPanel = document.getElementById(`${tabId}-content`);
    if (targetPanel) {
        targetPanel.classList.add('active');
        console.log('Tab panel activated:', targetPanel.id);
    } else {
        console.error('Target panel not found for tab:', tabId);
    }
}

// Interactive features
function initializeInteractiveFeatures() {
    // Debug: Check if saved and seen items exist
    const savedItems = document.querySelectorAll('.saved-item');
    const seenItems = document.querySelectorAll('.seen-item');
    console.log('Found saved items:', savedItems.length);
    console.log('Found seen items:', seenItems.length);
    
    // Test: Add a simple click handler to test if items are clickable
    savedItems.forEach((item, index) => {
        console.log(`Saved item ${index}:`, item);
        item.addEventListener('click', function(e) {
            console.log('Direct click on saved item!');
            e.stopPropagation();
            
            // Test navigation immediately
            const location = item.getAttribute('data-location');
            const locationName = item.getAttribute('data-location-name');
            const zoom = item.getAttribute('data-zoom');
            const title = item.querySelector('h4').textContent;
            
            if (location) {
                console.log('Testing navigation for:', title);
                goToSavedLocation(location, locationName, zoom, title);
            }
        });
    });
    
    seenItems.forEach((item, index) => {
        console.log(`Seen item ${index}:`, item);
        item.addEventListener('click', function(e) {
            console.log('Direct click on seen item!');
            e.stopPropagation();
            
            // Test navigation immediately
            const location = item.getAttribute('data-location');
            const locationName = item.getAttribute('data-location-name');
            const zoom = item.getAttribute('data-zoom');
            const title = item.querySelector('h4').textContent;
            
            if (location) {
                console.log('Testing navigation for:', title);
                goToSeenLocation(location, locationName, zoom, title);
            }
        });
    });
    
    // Back button functionality
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', goBack);
    }
    
    // Settings button functionality
    const settingsBtn = document.querySelector('.settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            showToast('Settings functionality coming soon!');
        });
    }
    
    // Edit profile button functionality
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            showToast('Edit profile functionality coming soon!');
        });
    }
    
    // Achievement items click handlers
    document.addEventListener('click', function(e) {
        console.log('Click event detected on:', e.target);
        if (e.target.closest('.achievement-item')) {
            const achievementItem = e.target.closest('.achievement-item');
            const title = achievementItem.querySelector('h4').textContent;
            const location = achievementItem.getAttribute('data-location');
            const locationName = achievementItem.getAttribute('data-location-name');
            const zoom = achievementItem.getAttribute('data-zoom');
            
            if (location) {
                // Navigate to map with achievement location
                goToAchievementLocation(location, locationName, zoom, title);
            } else {
                showToast(`Achievement: ${title}`);
            }
        }
        
        // Saved items click handlers
        if (e.target.closest('.saved-item')) {
            console.log('Saved item clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            const savedItem = e.target.closest('.saved-item');
            const title = savedItem.querySelector('h4').textContent;
            const location = savedItem.getAttribute('data-location');
            const locationName = savedItem.getAttribute('data-location-name');
            const zoom = savedItem.getAttribute('data-zoom');
            
            console.log('Saved item data:', { title, location, locationName, zoom });
            
            if (location) {
                // Navigate to map with saved location
                goToSavedLocation(location, locationName, zoom, title);
            } else {
                showToast(`Opening saved place: ${title}`);
            }
        }
        
        // Seen items click handlers
        if (e.target.closest('.seen-item')) {
            console.log('Seen item clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            const seenItem = e.target.closest('.seen-item');
            const title = seenItem.querySelector('h4').textContent;
            const location = seenItem.getAttribute('data-location');
            const locationName = seenItem.getAttribute('data-location-name');
            const zoom = seenItem.getAttribute('data-zoom');
            
            console.log('Seen item data:', { title, location, locationName, zoom });
            
            if (location) {
                // Navigate to map with seen location
                goToSeenLocation(location, locationName, zoom, title);
            } else {
                showToast(`Opening visited place: ${title}`);
            }
        }
    });
}

// Navigation functions
function goBack() {
    window.history.back();
}

function goToMapForPin() {
    // Store pin mode state for when we get to the home page
    localStorage.setItem('enablePinMode', 'true');
    // Navigate to home page
    window.location.href = 'index.html';
}

// Location functions
function goToLocation() {
    // Store the location data in localStorage so the map page can access it
    const locationData = {
        lat: 33.875, // St John's, Newfoundland coordinates
        lng: 151.2057,
        name: "Sydney, NSW, Australia",
        zoom: 12
    };
    
    localStorage.setItem('redirectToLocation', JSON.stringify(locationData));
    
    // Redirect to the main page (map)
    window.location.href = 'index.html';
}

function goToAchievementLocation(location, locationName, zoom, achievementTitle) {
    // Parse the location string (format: "lat,lng")
    const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
    
    if (isNaN(lat) || isNaN(lng)) {
        showToast('Invalid location data for this achievement');
        return;
    }
    
    // Store the achievement location data in localStorage
    const locationData = {
        lat: lat,
        lng: lng,
        name: locationName,
        zoom: parseInt(zoom) || 15,
        type: 'achievement',
        achievementTitle: achievementTitle
    };
    
    localStorage.setItem('redirectToLocation', JSON.stringify(locationData));
    
    // Show toast before redirecting
    showToast(`Showing ${achievementTitle} location on map`);
    
    // Redirect to the main page (map)
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function goToSavedLocation(location, locationName, zoom, savedTitle) {
    console.log('goToSavedLocation called with:', { location, locationName, zoom, savedTitle });
    
    // Parse the location string (format: "lat,lng")
    const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
    
    console.log('Parsed coordinates:', { lat, lng });
    
    if (isNaN(lat) || isNaN(lng)) {
        showToast('Invalid location data for this saved place');
        return;
    }
    
    // Store the saved location data in localStorage
    const locationData = {
        lat: lat,
        lng: lng,
        name: locationName,
        zoom: parseInt(zoom) || 15,
        type: 'saved',
        savedTitle: savedTitle
    };
    
    console.log('Storing location data:', locationData);
    localStorage.setItem('redirectToLocation', JSON.stringify(locationData));
    
    // Show toast before redirecting
    showToast(`Showing ${savedTitle} on map`);
    
    // Redirect to the main page (map)
    setTimeout(() => {
        console.log('Redirecting to index.html');
        window.location.href = 'index.html';
    }, 1000);
}

function goToSeenLocation(location, locationName, zoom, seenTitle) {
    console.log('goToSeenLocation called with:', { location, locationName, zoom, seenTitle });
    
    // Parse the location string (format: "lat,lng")
    const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
    
    console.log('Parsed coordinates:', { lat, lng });
    
    if (isNaN(lat) || isNaN(lng)) {
        showToast('Invalid location data for this visited place');
        return;
    }
    
    // Store the seen location data in localStorage
    const locationData = {
        lat: lat,
        lng: lng,
        name: locationName,
        zoom: parseInt(zoom) || 15,
        type: 'seen',
        seenTitle: seenTitle
    };
    
    console.log('Storing location data:', locationData);
    localStorage.setItem('redirectToLocation', JSON.stringify(locationData));
    
    // Show toast before redirecting
    showToast(`Showing ${seenTitle} on map`);
    
    // Redirect to the main page (map)
    setTimeout(() => {
        console.log('Redirecting to index.html');
        window.location.href = 'index.html';
    }, 1000);
}

// Modal functions removed - pin creation happens on map page

// Toast notification function
function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 3000;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Escape key handling removed - no modals on profile page

// Prevent zoom on double tap for iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
