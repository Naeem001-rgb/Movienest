// API Configuration
const TMDB_API_KEY = 'b8a35fb6e575578bcd764b42561cbd4e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const VIDSRC_MOVIE_EMBED = 'https://vidsrc.to/embed/movie/';
const VIDSRC_TV_EMBED = 'https://vidsrc.to/embed/tv/';

// Global Variables
let currentPage = 1;
let currentType = 'movie';
let currentCategory = 'trending';
let currentSection = 'home';
let isLoading = false;
let searchQuery = '';

// Cache for movie details to avoid repeated API calls
const movieDetailsCache = new Map();

// DOM Elements
const trendingGrid = document.getElementById('trendingGrid');
const popularMoviesGrid = document.getElementById('popularMoviesGrid');
const latestTVGrid = document.getElementById('latestTVGrid');
const fullSectionGrid = document.getElementById('fullSectionGrid');
const fullSection = document.getElementById('fullSection');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const modal = document.getElementById('movieModal');
const closeModal = document.getElementById('closeModal');

// Header scroll behavior variables
let lastScrollTop = 0;
let scrollThreshold = 100; // Minimum scroll distance to trigger hide/show
const modalBody = document.getElementById('modalBody');
const backToHomeBtn = document.getElementById('backToHome');
const fullSectionTitle = document.getElementById('fullSectionTitle');

// Initialize App
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    loadHeroBackground();
    loadHomePageContent();
}

function handleHashNavigation() {
    const hash = window.location.hash.substring(1); // Remove the # symbol
    if (!hash) return;

    // Clear search
    searchQuery = '';
    if (searchInput) searchInput.value = '';

    // Map hash values to categories and actions
    const hashMap = {
        'movies': () => {
            currentCategory = 'movie';
            showFullSection('popular-movies');
        },
        'tv': () => {
            currentCategory = 'tv';
            showFullSection('latest-tv');
        },
        'trending': () => {
            currentCategory = 'trending';
            showHomePage();
        },
        'new': () => {
            currentCategory = 'movie';
            showFullSection('popular-movies');
        },
        'top': () => {
            currentCategory = 'movie';
            showFullSection('popular-movies');
        },
        'action': () => {
            currentCategory = 'genre';
            handleGenreNavigation('28');
        },
        'comedy': () => {
            currentCategory = 'genre';
            handleGenreNavigation('35');
        },
        'drama': () => {
            currentCategory = 'genre';
            handleGenreNavigation('18');
        },
        'horror': () => {
            currentCategory = 'genre';
            handleGenreNavigation('27');
        },
        'sci-fi': () => {
            currentCategory = 'genre';
            handleGenreNavigation('878');
        }
    };

    if (hashMap[hash]) {
        currentPage = 1;
        clearAllGrids();

        // Update header nav active state
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const headerLink = document.querySelector(`.nav-link[data-category="${currentCategory}"]`);
        if (headerLink) headerLink.classList.add('active');

        // Execute the mapped function
        hashMap[hash]();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Clear the hash after navigation
        setTimeout(() => {
            history.replaceState(null, null, window.location.pathname);
        }, 100);
    }
}

function handleGenreNavigation(genreId) {
    // Map genre IDs to names
    const genreNames = {
        '28': 'Action',
        '35': 'Comedy',
        '18': 'Drama',
        '27': 'Horror',
        '878': 'Sci-Fi & Fantasy'
    };

    const genreName = genreNames[genreId] || 'Movies';
    loadMoviesByGenre(genreId, genreName);
}

function setupEventListeners() {
    // Handle hash-based navigation from footer links
    handleHashNavigation();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);

    // Tab buttons for trending section
    document.querySelectorAll('.tab-btn[data-section="trending"]').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.tab-btn[data-section="trending"]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentType = this.dataset.type;
            loadTrendingContent();
        });
    });

    // View All buttons
    document.querySelectorAll('.view-all-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const section = this.dataset.section;
            showFullSection(section);
        });
    });

    // Back to home button
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', function () {
            showHomePage();
        });
    }

    // Navigation links (header and footer)
    document.querySelectorAll('.nav-link, .footer-links a[data-category]').forEach(link => {
        link.addEventListener('click', function (e) {
            // Only prevent default if this link has data-category (JavaScript handling)
            // Allow normal navigation for links with actual href values
            if (this.dataset.category) {
                e.preventDefault();

                // Update header nav active state
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                const headerLink = document.querySelector(`.nav-link[data-category="${this.dataset.category}"]`);
                if (headerLink) headerLink.classList.add('active');

                currentCategory = this.dataset.category;
                currentPage = 1;
                searchQuery = '';
                searchInput.value = '';
                clearAllGrids();

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });

                if (currentCategory === 'home' || currentCategory === 'trending') {
                    showHomePage();
                } else if (currentCategory === 'movie') {
                    showFullSection('popular-movies');
                } else if (currentCategory === 'tv') {
                    showFullSection('latest-tv');
                } else if (currentCategory === 'genre') {
                    showGenrePage();
                } else if (currentCategory === 'countries') {
                    showCountriesPage();
                }
            }
            // If no data-category, allow normal link navigation
        });
    });

    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Load more button
    loadMoreBtn.addEventListener('click', function () {
        currentPage++;
        if (searchQuery) {
            searchMovies(searchQuery, currentPage);
        } else {
            loadMoreContent();
        }
    });

    // Modal close
    closeModal.addEventListener('click', closeMovieModal);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeMovieModal();
        }
    });

    // Dropdown menu functionality
    setupDropdownMenus();

    // Header scroll behavior
    setupHeaderScrollBehavior();
}

function setupHeaderScrollBehavior() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', function () {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Only trigger behavior after scrolling past threshold
        if (Math.abs(currentScrollTop - lastScrollTop) < 5) return;

        if (currentScrollTop > scrollThreshold) {
            // Scrolling down - hide header
            if (currentScrollTop > lastScrollTop) {
                header.style.transform = 'translateY(-100%)';
                header.style.opacity = '0';
            }
            // Scrolling up - show header
            else {
                header.style.transform = 'translateY(0)';
                header.style.opacity = '1';
            }
        } else {
            // At top of page - always show header
            header.style.transform = 'translateY(0)';
            header.style.opacity = '1';
        }

        lastScrollTop = currentScrollTop;
    });
}

function updateActiveTab(type) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
}

function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
        searchQuery = query;
        currentPage = 1;
        showFullSection('search');
        searchMovies(query, 1);
    }
}

function clearGrid(gridElement) {
    if (gridElement) {
        gridElement.innerHTML = '';
    }
}

function clearAllGrids() {
    clearGrid(trendingGrid);
    clearGrid(popularMoviesGrid);
    clearGrid(latestTVGrid);
    clearGrid(fullSectionGrid);
}

function showLoading() {
    loading.style.display = 'block';
    isLoading = true;
}

function hideLoading() {
    loading.style.display = 'none';
    isLoading = false;
}

// Load home page content with all sections
// Load hero background image
async function loadHeroBackground() {
    try {
        const endpoint = `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=1`;
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            // Get a random movie from the first 5 trending movies
            const randomIndex = Math.floor(Math.random() * Math.min(5, data.results.length));
            const movie = data.results[randomIndex];

            if (movie.backdrop_path) {
                const heroBackground = document.getElementById('heroBackground');
                const backdropUrl = `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;
                heroBackground.style.backgroundImage = `url(${backdropUrl})`;
                console.log('Hero background loaded:', movie.title);
            }
        }
    } catch (error) {
        console.error('Error loading hero background:', error);
        // Fallback to solid gradient if image fails to load
    }
}

async function loadHomePageContent() {
    console.log('Loading home page content...');
    console.log('DOM Elements:', {
        trendingGrid: !!trendingGrid,
        popularMoviesGrid: !!popularMoviesGrid,
        latestTVGrid: !!latestTVGrid
    });

    showLoading();
    try {
        await Promise.all([
            loadTrendingContent(),
            loadPopularMovies(),
            loadLatestTVShows()
        ]);
        console.log('All content loaded successfully');
    } catch (error) {
        console.error('Error loading home page content:', error);
        showError('Failed to load content. Please try again.');
    } finally {
        hideLoading();
    }
}

// Load trending content (movies or TV based on active tab)
async function loadTrendingContent() {
    try {
        const endpoint = `${TMDB_BASE_URL}/trending/${currentType}/week?api_key=${TMDB_API_KEY}&page=1`;
        console.log('Loading trending content:', endpoint);
        const response = await fetch(endpoint);
        const data = await response.json();
        console.log('Trending data:', data);

        if (data.results && data.results.length > 0) {
            displayMovies(data.results.slice(0, 12), true, trendingGrid);
            console.log('Displayed trending movies:', data.results.length);
        } else {
            console.log('No trending results found');
        }
    } catch (error) {
        console.error('Error loading trending content:', error);
        showError('Failed to load trending content');
    }
}

// Load popular movies
async function loadPopularMovies() {
    try {
        const endpoint = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`;
        console.log('Loading popular movies:', endpoint);
        const response = await fetch(endpoint);
        const data = await response.json();
        console.log('Popular movies data:', data);

        if (data.results && data.results.length > 0) {
            displayMovies(data.results.slice(0, 12), true, popularMoviesGrid);
            console.log('Displayed popular movies:', data.results.length);
        } else {
            console.log('No popular movies found');
        }
    } catch (error) {
        console.error('Error loading popular movies:', error);
        showError('Failed to load popular movies');
    }
}

// Load latest TV shows
async function loadLatestTVShows() {
    try {
        const endpoint = `${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&page=1`;
        console.log('Loading latest TV shows:', endpoint);
        const response = await fetch(endpoint);
        const data = await response.json();
        console.log('Latest TV shows data:', data);

        if (data.results && data.results.length > 0) {
            displayMovies(data.results.slice(0, 12), true, latestTVGrid);
            console.log('Displayed latest TV shows:', data.results.length);
        } else {
            console.log('No latest TV shows found');
        }
    } catch (error) {
        console.error('Error loading latest TV shows:', error);
        showError('Failed to load latest TV shows');
    }
}

// Load content for full section view
async function loadFullSectionContent(section, page = 1) {
    if (isLoading) return;

    showLoading();

    try {
        let endpoint = '';

        switch (section) {
            case 'trending':
                endpoint = `${TMDB_BASE_URL}/trending/${currentType}/week?api_key=${TMDB_API_KEY}&page=${page}`;
                break;
            case 'popular-movies':
                endpoint = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`;
                break;
            case 'latest-tv':
                endpoint = `${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&page=${page}`;
                break;
            default:
                return;
        }

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.results) {
            displayMovies(data.results, page === 1, fullSectionGrid);
            updateLoadMoreButton(data.page < data.total_pages);
        }
    } catch (error) {
        console.error('Error loading full section content:', error);
        showError('Failed to load content. Please try again.');
    } finally {
        hideLoading();
    }
}

async function searchMovies(query, page = 1) {
    if (isLoading) return;

    showLoading();

    try {
        const endpoint = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.results) {
            displayMovies(data.results, page === 1, fullSectionGrid);
            updateLoadMoreButton(data.page < data.total_pages);
        }
    } catch (error) {
        console.error('Error searching movies:', error);
        showError('Failed to search movies. Please try again.');
    } finally {
        hideLoading();
    }
}

function displayMovies(movies, shouldClearGrid = false, targetGrid = fullSectionGrid) {
    console.log('displayMovies called with:', {
        moviesCount: movies.length,
        shouldClearGrid,
        targetGrid: targetGrid ? targetGrid.id : 'null'
    });

    if (shouldClearGrid && targetGrid) {
        clearGrid(targetGrid);
    }

    let addedCount = 0;
    movies.forEach(movie => {
        if (movie.poster_path && targetGrid) {
            const movieCard = createMovieCard(movie);
            targetGrid.appendChild(movieCard);
            addedCount++;
        }
    });

    console.log(`Added ${addedCount} movie cards to ${targetGrid ? targetGrid.id : 'null'}`);
}

// Function to fetch detailed movie information including runtime
async function fetchMovieDetails(movieId, mediaType) {
    const cacheKey = `${mediaType}_${movieId}`;

    // Check cache first
    if (movieDetailsCache.has(cacheKey)) {
        return movieDetailsCache.get(cacheKey);
    }

    try {
        const response = await fetch(`${TMDB_BASE_URL}/${mediaType}/${movieId}?api_key=${TMDB_API_KEY}`);
        const details = await response.json();

        // Cache the result
        movieDetailsCache.set(cacheKey, details);
        return details;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

// Function to format runtime
function formatRuntime(runtime, mediaType, seasons) {
    if (mediaType === 'movie' && runtime) {
        const hours = Math.floor(runtime / 60);
        const minutes = runtime % 60;
        return `${hours}h ${minutes}m`;
    } else if (mediaType === 'tv' && seasons) {
        return `${seasons} Season${seasons > 1 ? 's' : ''}`;
    }
    return 'N/A';
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const isMovie = movie.media_type === 'movie' || !movie.first_air_date;
    const title = movie.title || movie.name;
    const releaseDate = movie.release_date || movie.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    const mediaType = isMovie ? 'movie' : 'tv';

    // Create initial card with loading duration
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${TMDB_IMAGE_BASE_URL}${movie.poster_path}" alt="${title}" loading="lazy">
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${title}</h3>
            <div class="movie-meta">
                <span class="movie-year">${year}</span>
                <span class="movie-duration">Loading...</span>
                <span class="movie-type ${mediaType}">${mediaType}</span>
            </div>
        </div>
    `;

    // Fetch real duration asynchronously
    fetchMovieDetails(movie.id, mediaType).then(details => {
        const durationElement = card.querySelector('.movie-duration');
        if (durationElement && details) {
            const runtime = details.runtime;
            const seasons = details.number_of_seasons;
            const formattedDuration = formatRuntime(runtime, mediaType, seasons);
            durationElement.textContent = formattedDuration;
        } else if (durationElement) {
            durationElement.textContent = 'N/A';
        }
    }).catch(error => {
        console.error('Error updating duration:', error);
        const durationElement = card.querySelector('.movie-duration');
        if (durationElement) {
            durationElement.textContent = 'N/A';
        }
    });

    card.addEventListener('click', () => {
        // Navigate to dedicated movie page
        const mediaType = isMovie ? 'movie' : 'tv';
        window.location.href = `movie.html?id=${movie.id}&type=${mediaType}`;
    });

    return card;
}



function updateLoadMoreButton(hasMore) {
    loadMoreBtn.style.display = hasMore ? 'block' : 'none';
    loadMoreBtn.disabled = !hasMore;
}

async function openMovieModal(movie) {
    const isMovie = movie.media_type === 'movie' || !movie.first_air_date;
    const title = movie.title || movie.name;
    const releaseDate = movie.release_date || movie.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';

    // Get additional movie details
    try {
        const detailsEndpoint = `${TMDB_BASE_URL}/${isMovie ? 'movie' : 'tv'}/${movie.id}?api_key=${TMDB_API_KEY}`;
        const response = await fetch(detailsEndpoint);
        const details = await response.json();

        const runtime = isMovie ?
            (details.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` : 'N/A') :
            (details.number_of_seasons ? `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? 's' : ''}` : 'N/A');

        const genres = details.genres ? details.genres.map(g => g.name).join(', ') : 'N/A';
        const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';

        modalBody.innerHTML = `
            <div class="movie-details">
                <div class="movie-details-poster">
                    <img src="${TMDB_IMAGE_BASE_URL}${movie.poster_path}" alt="${title}">
                </div>
                <div class="movie-details-info">
                    <h2>${title}</h2>
                    <div class="movie-details-meta">
                        <span><strong>Year:</strong> ${year}</span>
                        <span><strong>Duration:</strong> ${runtime}</span>
                        <span><strong>Rating:</strong> ⭐ ${rating}</span>
                        <span><strong>Type:</strong> ${isMovie ? 'Movie' : 'TV Show'}</span>
                    </div>
                    <div class="movie-details-meta">
                        <span><strong>Genres:</strong> ${genres}</span>
                    </div>
                    <div class="movie-details-overview">
                        <p>${movie.overview || 'No overview available.'}</p>
                    </div>
                    <button class="play-btn" onclick="playMovie(${movie.id}, '${isMovie ? 'movie' : 'tv'}')">
                        <i class="fas fa-play"></i>
                        Watch Now
                    </button>
                </div>
            </div>
            <div class="video-container" id="videoContainer" style="display: none;">
                <!-- Video player will be loaded here -->
            </div>
        `;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Error loading movie details:', error);
        showError('Failed to load movie details.');
    }
}

function playMovie(movieId, type) {
    const videoContainer = document.getElementById('videoContainer');
    const embedUrl = type === 'movie' ?
        `${VIDSRC_MOVIE_EMBED}${movieId}` :
        `${VIDSRC_TV_EMBED}${movieId}`;

    videoContainer.innerHTML = `
        <iframe src="${embedUrl}" allowfullscreen></iframe>
    `;

    videoContainer.style.display = 'block';
    videoContainer.scrollIntoView({ behavior: 'smooth' });
}

function closeMovieModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';

    // Stop any playing video
    const videoContainer = document.getElementById('videoContainer');
    if (videoContainer) {
        videoContainer.innerHTML = '';
        videoContainer.style.display = 'none';
    }
}

// Navigation functions
function showHomePage() {
    currentSection = 'home';
    searchQuery = '';
    searchInput.value = '';

    // Hide full section view
    fullSection.style.display = 'none';

    // Show home sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'block';
    });

    // Reload home content
    loadHomePageContent();
}

function showFullSection(section) {
    currentSection = section;
    currentPage = 1;

    // Hide home sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });

    // Show full section view
    fullSection.style.display = 'block';

    // Update section title
    const titles = {
        'trending': `All Trending ${currentType === 'movie' ? 'Movies' : 'TV Shows'}`,
        'popular-movies': 'All Popular Movies',
        'latest-tv': 'All Latest TV Shows',
        'search': `Search Results for "${searchQuery}"`
    };

    fullSectionTitle.textContent = titles[section] || 'All Content';

    // Clear and load content
    clearGrid(fullSectionGrid);

    if (section === 'search') {
        // Search content is loaded separately
        return;
    }

    loadFullSectionContent(section, 1);
}

function loadMoreContent() {
    if (currentSection === 'search') {
        searchMovies(searchQuery, currentPage);
    } else {
        loadFullSectionContent(currentSection, currentPage);
    }
}

function showGenrePage() {
    // For now, show a placeholder - can be expanded later
    showFullSection('popular-movies');
    fullSectionTitle.textContent = 'Browse by Genre';
}

function showCountriesPage() {
    // For now, show a placeholder - can be expanded later
    showFullSection('popular-movies');
    fullSectionTitle.textContent = 'Browse by Countries';
}

function setupDropdownMenus() {
    // Genre dropdown functionality
    document.querySelectorAll('[data-genre]').forEach(link => {
        link.addEventListener('click', function (e) {
            // Only prevent default if this link has data-genre attribute
            if (this.dataset.genre) {
                e.preventDefault();
                const genreId = this.dataset.genre;
                const genreName = this.textContent;
                loadMoviesByGenre(genreId, genreName);
            }
            // If no data-genre, allow normal link navigation
        });
    });

    // Country dropdown functionality
    document.querySelectorAll('[data-country]').forEach(link => {
        link.addEventListener('click', function (e) {
            // Only prevent default if this link has data-country attribute
            if (this.dataset.country) {
                e.preventDefault();
                const countryCode = this.dataset.country;
                const countryName = this.textContent;
                loadMoviesByCountry(countryCode, countryName);
            }
            // If no data-country, allow normal link navigation
        });
    });
}

async function loadMoviesByGenre(genreId, genreName) {
    currentSection = 'genre';
    currentPage = 1;

    // Hide home sections and show full section
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    fullSection.style.display = 'block';
    fullSectionTitle.textContent = `${genreName} Movies`;

    showLoading();

    try {
        const endpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=1`;
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.results) {
            displayMovies(data.results, true, fullSectionGrid);
            updateLoadMoreButton(data.page < data.total_pages);
        }
    } catch (error) {
        console.error('Error loading movies by genre:', error);
        showError('Failed to load movies by genre');
    } finally {
        hideLoading();
    }
}

async function loadMoviesByCountry(countryCode, countryName) {
    currentSection = 'country';
    currentPage = 1;

    // Hide home sections and show full section
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    fullSection.style.display = 'block';
    fullSectionTitle.textContent = `Movies from ${countryName}`;

    showLoading();

    try {
        const endpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=${countryCode}&page=1`;
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.results) {
            displayMovies(data.results, true, fullSectionGrid);
            updateLoadMoreButton(data.page < data.total_pages);
        }
    } catch (error) {
        console.error('Error loading movies by country:', error);
        showError('Failed to load movies by country');
    } finally {
        hideLoading();
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Smooth scrolling for better UX
// Header is now static and doesn't change on scroll

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeMovieModal();
    }

    if (e.key === '/' && e.target !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
});

// Newsletter subscription functionality
function setupNewsletterSubscription() {
    const newsletterBtn = document.querySelector('.newsletter-btn');
    const newsletterInput = document.querySelector('.newsletter-input');

    if (newsletterBtn && newsletterInput) {
        newsletterBtn.addEventListener('click', function () {
            const email = newsletterInput.value.trim();
            if (email && isValidEmail(email)) {
                showSuccessMessage('Thank you for subscribing! We\'ll keep you updated.');
                newsletterInput.value = '';
            } else {
                showError('Please enter a valid email address.');
            }
        });

        newsletterInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                newsletterBtn.click();
            }
        });
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    successDiv.textContent = message;

    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}


// Initialize newsletter after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(setupNewsletterSubscription, 100);
});


(function () {
    const savedTheme = localStorage.getItem('theme') || 'dark-mode';
    document.documentElement.classList.add(savedTheme);
    document.body.classList.add(savedTheme);
})();
