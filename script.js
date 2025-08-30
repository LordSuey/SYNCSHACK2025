// App state
let currentPage = 'home';
let currentCategory = 'foryou';
let posts = [];
let map;
let placesService;
let infoWindow;
let isAddingPin = false;
let userPins = [];

// DOM elements
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
const tabButtons = document.querySelectorAll('.nav-tab');
const composeNavBtn = document.getElementById('compose-nav');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const postBtn = document.getElementById('post-btn');
const postTitle = document.getElementById('post-title');
const postImage = document.getElementById('post-image');
const imageUploadBtn = document.getElementById('image-upload-btn');
const imagePreview = document.getElementById('image-preview');
const postsFeed = document.getElementById('posts-feed');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeTabs();
    initializeCompose();
    loadSamplePosts();
    addInteractiveFeatures();
});

// Navigation functionality
function initializeNavigation() {
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            if (targetPage) {
                switchPage(targetPage);
            }
        });
    });
}

function switchPage(pageId) {
    // Only handle home page since profile is now separate
    if (pageId === 'home') {
        // Update active nav button
        navButtons.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-page="${pageId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Update active page
        pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Show top navigation for home page
        const topNav = document.querySelector('.top-nav');
        const mainContent = document.querySelector('.main-content');
        topNav.style.display = 'flex';
        mainContent.classList.remove('full-height');
        
        currentPage = pageId;
        
        // Update compose button appearance
        updateComposeButtonState();
    }
}

// Tab functionality
function initializeTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            switchCategory(category);
        });
    });
}

function switchCategory(category) {
    // Update active tab
    tabButtons.forEach(btn => btn.classList.remove('active'));
    const activeTab = document.querySelector(`[data-category="${category}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    currentCategory = category;
    
    // Simulate loading different content
    loadPostsByCategory(category);
}

function loadPostsByCategory(category) {
    // Add loading animation
    postsFeed.classList.add('loading');
    
    setTimeout(() => {
        postsFeed.classList.remove('loading');
        // In a real app, you would fetch posts based on category
        console.log(`Loading posts for category: ${category}`);
    }, 500);
}

// Compose functionality
function initializeCompose() {
    // Open compose modal or toggle pin mode based on current page
    composeNavBtn.addEventListener('click', handleComposeClick);
    
    // Close modal events
    closeModalBtn.addEventListener('click', closeComposeModal);
    cancelBtn.addEventListener('click', closeComposeModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeComposeModal();
        }
    });
    
    // Image upload
    imageUploadBtn.addEventListener('click', function() {
        postImage.click();
    });
    
    postImage.addEventListener('change', handleImageUpload);
    
    // Post title validation
    postTitle.addEventListener('input', validatePostForm);
    
    // Submit post
    postBtn.addEventListener('click', submitPost);
    
    // Enter key to submit
    postTitle.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !postBtn.disabled) {
            submitPost();
        }
    });
}

function handleComposeClick() {
    if (currentPage === 'home') {
        togglePinMode();
    } else {
        openComposeModal();
    }
}

function togglePinMode() {
    isAddingPin = !isAddingPin;
    updateComposeButtonState();
    
    if (isAddingPin) {
        showToast('Click on the map to add a pin');
        // Change cursor style when adding pins
        document.getElementById('google-map').style.cursor = 'crosshair';
    } else {
        showToast('Pin mode disabled');
        document.getElementById('google-map').style.cursor = 'default';
    }
}

function updateComposeButtonState() {
    const composeIcon = composeNavBtn.querySelector('.compose-icon');
    const navIcon = composeNavBtn.querySelector('.nav-icon');
    
    if (currentPage === 'home') {
        if (isAddingPin) {
            composeIcon.textContent = '✓';
            navIcon.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
        } else {
            composeIcon.textContent = '📍';
            navIcon.style.background = 'linear-gradient(135deg, #ff6b6b, #ff8e8e)';
        }
    } else {
        composeIcon.textContent = '+';
        navIcon.style.background = 'linear-gradient(135deg, #ff6b6b, #ff8e8e)';
    }
}

function openComposeModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    postTitle.focus();
}

function closeComposeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    resetComposeForm();
}

function resetComposeForm() {
    postTitle.value = '';
    postImage.value = '';
    imagePreview.innerHTML = '';
    postBtn.disabled = true;
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            validatePostForm();
        };
        reader.readAsDataURL(file);
    }
}

function validatePostForm() {
    const hasTitle = postTitle.value.trim().length > 0;
    const hasImage = postImage.files.length > 0 || imagePreview.innerHTML.includes('img');
    
    postBtn.disabled = !(hasTitle && hasImage);
}

function submitPost() {
    const title = postTitle.value.trim();
    const imageFile = postImage.files[0];
    
    if (!title || (!imageFile && !imagePreview.innerHTML.includes('img'))) {
        return;
    }
    
    // Create new post
    const newPost = {
        id: Date.now(),
        title: title,
        image: imagePreview.querySelector('img')?.src || '',
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        user: {
            name: 'You',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'
        }
    };
    
    // Add to posts array
    posts.unshift(newPost);
    
    // Add to DOM
    addPostToFeed(newPost);
    
    // Close modal and reset
    closeComposeModal();
    
    // Switch to home page if not already there
    if (currentPage !== 'home') {
        switchPage('home');
    }
    
    // Show success feedback
    showToast('Posted successfully!');
}

function addPostToFeed(post) {
    const postItem = document.createElement('div');
    postItem.className = 'post-item';
    postItem.innerHTML = `
        <div class="post-media">
            <img src="${post.image}" alt="Post content" class="post-image">
        </div>
        <div class="post-overlay">
            <div class="post-info">
                <div class="user-info">
                    <img src="${post.user.avatar}" alt="User" class="user-avatar">
                    <span class="username">${post.user.name}</span>
                </div>
                <p class="post-description">${post.title}</p>
            </div>
            <div class="post-actions">
                <button class="action-btn like-btn" onclick="toggleLike(this, ${post.id})">
                    <span class="action-icon">❤️</span>
                    <span class="action-count">${post.likes}</span>
                </button>
                <button class="action-btn comment-btn">
                    <span class="action-icon">💬</span>
                    <span class="action-count">${post.comments}</span>
                </button>
                <button class="action-btn share-btn">
                    <span class="action-icon">📤</span>
                    <span class="action-count">Share</span>
                </button>
            </div>
        </div>
    `;
    
    // Add animation
    postItem.style.opacity = '0';
    postItem.style.transform = 'scale(0.8)';
    
    // Insert at the beginning
    postsFeed.insertBefore(postItem, postsFeed.firstChild);
    
    // Animate in
    setTimeout(() => {
        postItem.style.transition = 'all 0.3s ease';
        postItem.style.opacity = '1';
        postItem.style.transform = 'scale(1)';
    }, 10);
}

function loadSamplePosts() {
    // This function ensures sample posts are available on page load
    const samplePosts = [
        { 
            id: 1, 
            title: 'The most adventurous thing I\'ve ever done', 
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=500&fit=crop&crop=center',
            likes: 38700,
            comments: 1200,
            user: { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' }
        },
        { 
            id: 2, 
            title: 'Sydney Marathon + City Tour Complete Guide', 
            image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=500&fit=crop&crop=center',
            likes: 19,
            comments: 5,
            user: { name: 'Alex Kim', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' }
        },
        { 
            id: 3, 
            title: 'Exposing this person who bought all the collectibles...', 
            image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c2a4?w=300&h=500&fit=crop&crop=center',
            likes: 29,
            comments: 8,
            user: { name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' }
        },
        { 
            id: 4, 
            title: 'Someone suddenly asked me: "Which country are you studying in?"', 
            image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=500&fit=crop&crop=center',
            likes: 156,
            comments: 43,
            user: { name: 'Travel Explorer', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' }
        }
    ];
    
    posts = [...samplePosts];
}

// Interactive features
function addInteractiveFeatures() {
    // Add like functionality to existing posts
    document.addEventListener('click', function(e) {
        if (e.target.closest('.like-btn')) {
            const likeBtn = e.target.closest('.like-btn');
            const postId = parseInt(likeBtn.onclick?.toString().match(/\d+/)?.[0] || '0');
            toggleLike(likeBtn, postId);
        }
    });
    
    // Add post click handlers for full screen view
    document.addEventListener('click', function(e) {
        const postItem = e.target.closest('.post-item');
        if (postItem && !e.target.closest('.post-actions')) {
            // In a real app, this would open full screen post view
            console.log('Opening full screen post view');
        }
    });
}

function toggleLike(button, postId) {
    const countSpan = button.querySelector('.action-count');
    const iconSpan = button.querySelector('.action-icon');
    let currentCount = parseInt(countSpan.textContent.replace('K', '').replace('.', '')) || 0;
    
    if (button.classList.contains('liked')) {
        // Unlike
        button.classList.remove('liked');
        currentCount--;
        iconSpan.textContent = '❤️';
    } else {
        // Like
        button.classList.add('liked');
        currentCount++;
        iconSpan.textContent = '❤️';
        
        // Add heart animation
        createHeartAnimation(button);
    }
    
    // Update count display
    if (currentCount >= 1000) {
        countSpan.textContent = (currentCount / 1000).toFixed(1) + 'K';
    } else {
        countSpan.textContent = currentCount.toString();
    }
    
    // Update posts array
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.likes = currentCount;
    }
}

function createHeartAnimation(button) {
    const heart = document.createElement('span');
    heart.textContent = '❤️';
    heart.style.cssText = `
        position: absolute;
        font-size: 20px;
        color: #ff6b6b;
        pointer-events: none;
        z-index: 1000;
        animation: heartFloat 1s ease-out forwards;
    `;
    
    const rect = button.getBoundingClientRect();
    heart.style.left = rect.left + rect.width/2 + 'px';
    heart.style.top = rect.top + 'px';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, 1000);
}

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
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeComposeModal();
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

// Add heart floating animation
const style = document.createElement('style');
style.textContent = `
    @keyframes heartFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-50px) scale(1.5);
        }
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Add pull-to-refresh functionality (simplified)
let startY = 0;
let currentY = 0;
let pulling = false;

document.addEventListener('touchstart', function(e) {
    if (window.scrollY === 0 && currentPage === 'home') {
        startY = e.touches[0].pageY;
        pulling = true;
    }
});

document.addEventListener('touchmove', function(e) {
    if (pulling) {
        currentY = e.touches[0].pageY;
        const diff = currentY - startY;
        
        if (diff > 50) {
            // Show refresh indicator
            console.log('Pull to refresh triggered');
        }
    }
});

document.addEventListener('touchend', function() {
    if (pulling) {
        const diff = currentY - startY;
        if (diff > 100) {
            // Trigger refresh
            refreshFeed();
        }
        pulling = false;
    }
});

function refreshFeed() {
    // Simulate refresh
    postsFeed.classList.add('loading');
    showToast('Refreshing...');
    
    setTimeout(() => {
        postsFeed.classList.remove('loading');
        showToast('Refresh complete');
    }, 1000);
}

// Google Maps functionality
function initMap() {
    // Check if there's a location redirect from profile page
    const redirectLocation = localStorage.getItem('redirectToLocation');
    let defaultLocation, defaultZoom;
    
    if (redirectLocation) {
        try {
            const locationData = JSON.parse(redirectLocation);
            defaultLocation = { lat: locationData.lat, lng: locationData.lng };
            defaultZoom = locationData.zoom || 15;
            
            // Clear the redirect data after using it
            localStorage.removeItem('redirectToLocation');
            
            // Show a toast notification
            setTimeout(() => {
                showToast(`Showing ${locationData.name}`);
            }, 500);
            
            // Add a special marker for the user's location
            new google.maps.Marker({
                position: defaultLocation,
                map: map,
                title: locationData.name,
                icon: {
                    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjZmY2YjZiIi8+Cjwvc3ZnPg==',
                    scaledSize: new google.maps.Size(40, 40)
                }
            });
        } catch (e) {
            console.error('Error parsing location data:', e);
            defaultLocation = window.CONFIG?.DEFAULT_MAP_CENTER || { lat: 40.7128, lng: -74.0060 };
            defaultZoom = window.CONFIG?.DEFAULT_MAP_ZOOM || 15;
        }
    } else {
        // Use config for default location or fallback
        defaultLocation = window.CONFIG?.DEFAULT_MAP_CENTER || { lat: 40.7128, lng: -74.0060 };
        defaultZoom = window.CONFIG?.DEFAULT_MAP_ZOOM || 15;
    }
    
    map = new google.maps.Map(document.getElementById('google-map'), {
        zoom: defaultZoom,
        center: defaultLocation,
        styles: [
            {
                "elementType": "geometry",
                "stylers": [{"color": "#212121"}]
            },
            {
                "elementType": "labels.icon",
                "stylers": [{"visibility": "off"}]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#757575"}]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#212121"}]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [{"color": "#757575"}]
            },
            {
                "featureType": "administrative.country",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#9e9e9e"}]
            },
            {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#2c2c2c"}]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#8a8a8a"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#000000"}]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#3d3d3d"}]
            }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });

    placesService = new google.maps.places.PlacesService(map);
    infoWindow = new google.maps.InfoWindow();

    // Try to get user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(pos);
                
                // Add marker for current location
                new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: 'Your Location',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#ff6b6b',
                        fillOpacity: 1,
                        strokeColor: '#fff',
                        strokeWeight: 2
                    }
                });
                
                // Search for nearby places
                searchNearbyPlaces(pos);
            },
            () => {
                console.log('Location access denied');
                searchNearbyPlaces(defaultLocation);
            }
        );
    } else {
        console.log('Geolocation not supported');
        searchNearbyPlaces(defaultLocation);
    }

    // Setup search functionality
    setupMapSearch();
    
    // Setup map click for adding pins
    setupMapClickHandler();
}

function searchNearbyPlaces(location) {
    const request = {
        location: location,
        radius: 1000,
        type: ['restaurant', 'tourist_attraction', 'store']
    };

    placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.slice(0, 10).forEach(place => {
                createMarker(place);
            });
        }
    });
}

function createMarker(place) {
    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        icon: {
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjZmY2YjZiIi8+Cjwvc3ZnPg==',
            scaledSize: new google.maps.Size(30, 30)
        }
    });

    marker.addListener('click', () => {
        const content = `
            <div style="color: #333; max-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #000;">${place.name}</h3>
                <p style="margin: 0 0 8px 0; font-size: 14px;">${place.vicinity}</p>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="color: #ff6b6b;">⭐</span>
                    <span style="font-size: 14px;">${place.rating || 'No rating'}</span>
                </div>
            </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
    });
}

function setupMapSearch() {
    const searchInput = document.getElementById('map-search');
    const searchBtn = document.getElementById('search-btn');
    
    if (!searchInput || !searchBtn) return;

    const autocomplete = new google.maps.places.Autocomplete(searchInput);
    autocomplete.bindTo('bounds', map);

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(15);
        }

        createMarker(place);
    });

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value;
        if (!query) return;

        const request = {
            query: query,
            fields: ['name', 'geometry', 'rating', 'formatted_address']
        };

        placesService.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                const place = results[0];
                map.setCenter(place.geometry.location);
                map.setZoom(15);
                createMarker(place);
            }
        });
    });
}

function setupMapClickHandler() {
    map.addListener('click', (event) => {
        if (isAddingPin) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            promptForPinDetails(lat, lng);
        }
    });
}

function promptForPinDetails(lat, lng) {
    const title = prompt('Enter a title for this location:');
    if (title && title.trim()) {
        const description = prompt('Enter a description (optional):') || '';
        createUserPin(lat, lng, title.trim(), description.trim());
        
        // Turn off pin mode after adding a pin
        isAddingPin = false;
        updateComposeButtonState();
        document.getElementById('google-map').style.cursor = 'default';
        
        showToast('Pin added successfully!');
    } else {
        showToast('Pin creation cancelled');
    }
}

function createUserPin(lat, lng, title, description) {
    const pinData = {
        id: Date.now(),
        lat: lat,
        lng: lng,
        title: title,
        description: description,
        timestamp: new Date()
    };
    
    userPins.push(pinData);
    
    // Create marker on map
    const marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        title: title,
        icon: {
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjNGZhZjUwIi8+Cjwvc3ZnPg==',
            scaledSize: new google.maps.Size(30, 30)
        }
    });

    marker.addListener('click', () => {
        const content = `
            <div style="color: #333; max-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #000;">${title}</h3>
                ${description ? `<p style="margin: 0 0 8px 0; font-size: 14px;">${description}</p>` : ''}
                <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #666;">
                    <span>📍</span>
                    <span>Your Pin</span>
                </div>
                <button onclick="deleteUserPin(${pinData.id})" style="margin-top: 8px; background: #ff6b6b; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Delete Pin</button>
            </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
    });
    
    // Store marker reference for deletion
    pinData.marker = marker;
}

function deleteUserPin(pinId) {
    const pinIndex = userPins.findIndex(pin => pin.id === pinId);
    if (pinIndex !== -1) {
        const pin = userPins[pinIndex];
        
        // Remove marker from map
        if (pin.marker) {
            pin.marker.setMap(null);
        }
        
        // Remove from array
        userPins.splice(pinIndex, 1);
        
        // Close info window
        infoWindow.close();
        
        showToast('Pin deleted');
    }
}

// Make functions globally available
window.deleteUserPin = deleteUserPin;

// Make initMap globally available for Google Maps callback
window.initMap = initMap;