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
    }
}

// Interactive features
function initializeInteractiveFeatures() {
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
        if (e.target.closest('.achievement-item')) {
            const achievementItem = e.target.closest('.achievement-item');
            const title = achievementItem.querySelector('h4').textContent;
            showToast(`Achievement: ${title}`);
        }
        
        // Saved items click handlers
        if (e.target.closest('.saved-item')) {
            const savedItem = e.target.closest('.saved-item');
            const title = savedItem.querySelector('h4').textContent;
            showToast(`Opening saved place: ${title}`);
        }
        
        // Seen items click handlers
        if (e.target.closest('.seen-item')) {
            const seenItem = e.target.closest('.seen-item');
            const title = seenItem.querySelector('h4').textContent;
            showToast(`Opening visited place: ${title}`);
        }
    });
}

// Navigation functions
function goBack() {
    window.history.back();
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

// Modal functions
function openAddModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeAddModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

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

// Handle escape key to close modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay && modalOverlay.classList.contains('active')) {
            closeAddModal();
        }
    }
});

// Prevent zoom on double tap for iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
