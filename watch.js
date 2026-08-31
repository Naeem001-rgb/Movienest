// API Configuration
const TMDB_API_KEY = 'b8a35fb6e575578bcd764b42561cbd4e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const VIDSRC_MOVIE_EMBED = 'https://vidsrc.to/embed/movie/';
const VIDSRC_TV_EMBED = 'https://vidsrc.to/embed/tv/';
const VIDFAST_MOVIE_EMBED = 'https://vidfast.pro/movie/';
const VIDFAST_TV_EMBED = 'https://vidfast.pro/tv/';
const VIDEASY_MOVIE_EMBED = 'https://player.videasy.net/movie/';
const VIDEASY_TV_EMBED = 'https://player.videasy.net/tv/';

// Global Variables
let currentMovie = null;
let currentSeason = 1;
let currentEpisode = 1;
let isLoading = false;

// DOM Elements
const loading = document.getElementById('loading');
const movieTitle = document.getElementById('movieTitle');
const moviePoster = document.getElementById('moviePoster');
const movieOverview = document.getElementById('movieOverview');
const movieReleaseDate = document.getElementById('movieReleaseDate');
const movieGenres = document.getElementById('movieGenres');
const movieCast = document.getElementById('movieCast');
const movieCountry = document.getElementById('movieCountry');
const movieProduction = document.getElementById('movieProduction');
const movieYearBadge = document.getElementById('movieYearBadge');
const breadcrumbTitle = document.getElementById('breadcrumbTitle');
const breadcrumbCategory = document.getElementById('breadcrumbCategory');
const relatedMoviesGrid = document.getElementById('relatedMoviesGrid');
const videoEmbed = document.getElementById('videoEmbed');

// Initialize App
document.addEventListener('DOMContentLoaded', function () {
    initializeWatchPage();
    setupEventListeners();
});

function initializeWatchPage() {
    // Get movie ID and type from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const mediaType = urlParams.get('type') || 'movie';

    if (movieId) {
        loadMovieDetails(movieId, mediaType);
        startStreaming(movieId, mediaType);
    } else {
        showError('Movie ID not found in URL');
    }
}

function setupEventListeners() {


    // Server selection
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            if (currentMovie) {
                startStreaming(currentMovie.id, currentMovie.media_type || 'movie');
            }
        });
    });

    // Share buttons
    document.querySelector('.share-btn.facebook').addEventListener('click', function () {
        shareOnFacebook();
    });

    document.querySelector('.share-btn.twitter').addEventListener('click', function () {
        shareOnTwitter();
    });



    // Newsletter subscription
    setupNewsletterSubscription();

    // Header scroll behavior
    setupHeaderScrollBehavior();
}

function setupHeaderScrollBehavior() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScrollTop = 0;
    const scrollThreshold = 100;

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

async function loadMovieDetails(movieId, mediaType) {
    showLoading();

    try {
        // Load main movie details
        const detailsEndpoint = `${TMDB_BASE_URL}/${mediaType}/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
        const response = await fetch(detailsEndpoint);
        const movieData = await response.json();

        if (movieData.id) {
            currentMovie = { ...movieData, media_type: mediaType };
            displayMovieDetails(movieData, mediaType);

            if (mediaType === 'tv') {
                setupTvShowSelectors(movieData);
            } else {
                document.getElementById('episodeSelectionContainer').style.display = 'none';
            }

            // Load related movies
            loadRelatedMovies(movieId, mediaType);
        } else {
            showError('Movie not found');
        }
    } catch (error) {
        console.error('Error loading movie details:', error);
        showError('Failed to load movie details');
    } finally {
        hideLoading();
    }
}

function displayMovieDetails(movie, mediaType) {
    const isMovie = mediaType === 'movie';
    const title = movie.title || movie.name;
    const releaseDate = movie.release_date || movie.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';

    // Update page title
    document.title = `Watch ${title} - Movie Nest`;

    // Update breadcrumb
    breadcrumbTitle.textContent = title;
    breadcrumbCategory.textContent = isMovie ? 'Movies' : 'TV Shows';

    // Update movie info
    movieTitle.textContent = title;
    moviePoster.src = `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`;
    moviePoster.alt = title;

    // Update year badge
    movieYearBadge.textContent = year;

    // Update overview
    movieOverview.textContent = movie.overview || 'No overview available.';

    // Update release date
    movieReleaseDate.textContent = releaseDate || 'N/A';

    // Update genres
    if (movie.genres && movie.genres.length > 0) {
        movieGenres.textContent = movie.genres.map(g => g.name).join(', ');
    } else {
        movieGenres.textContent = 'N/A';
    }

    // Update cast
    if (movie.credits && movie.credits.cast && movie.credits.cast.length > 0) {
        const topCast = movie.credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
        movieCast.textContent = topCast;
    } else {
        movieCast.textContent = 'Cast information not available';
    }

    // Update country
    if (movie.production_countries && movie.production_countries.length > 0) {
        movieCountry.textContent = movie.production_countries.map(c => c.name).join(', ');
    } else {
        movieCountry.textContent = 'N/A';
    }

    // Update production
    if (movie.production_companies && movie.production_companies.length > 0) {
        const topCompanies = movie.production_companies.slice(0, 3).map(c => c.name).join(', ');
        movieProduction.textContent = topCompanies;
    } else {
        movieProduction.textContent = 'Production information not available';
    }
}

function startStreaming(movieId, mediaType) {
    // Get the currently active server
    const activeServer = document.querySelector('.server-btn.active');
    const serverType = activeServer ? activeServer.dataset.server : 'videasy';

    let embedUrl = '';

    // Use global state for TV shows, default to 1 if not set
    const s = currentSeason || 1;
    const e = currentEpisode || 1;

    if (serverType === 'videasy') {
        embedUrl = mediaType === 'movie' ?
            `${VIDEASY_MOVIE_EMBED}${movieId}` :
            `${VIDEASY_TV_EMBED}${movieId}/${s}/${e}`;
    } else if (serverType === 'vidfast') {
        embedUrl = mediaType === 'movie' ?
            `${VIDFAST_MOVIE_EMBED}${movieId}?autoPlay=true` :
            `${VIDFAST_TV_EMBED}${movieId}/${s}/${e}?autoPlay=true`;
    } else {
        // Default to VidSrc
        embedUrl = mediaType === 'movie' ?
            `${VIDSRC_MOVIE_EMBED}${movieId}` :
            `${VIDSRC_TV_EMBED}${movieId}/${s}/${e}`;
    }

    videoEmbed.innerHTML = `
        <iframe src="${embedUrl}" allowfullscreen></iframe>
    `;
}

async function loadRelatedMovies(movieId, mediaType) {
    try {
        // Load similar movies/shows
        const endpoint = `${TMDB_BASE_URL}/${mediaType}/${movieId}/similar?api_key=${TMDB_API_KEY}&page=1`;
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            displayRelatedMovies(data.results.slice(0, 12), mediaType);
        } else {
            // If no similar movies, load popular ones
            const popularEndpoint = `${TMDB_BASE_URL}/${mediaType}/popular?api_key=${TMDB_API_KEY}&page=1`;
            const popularResponse = await fetch(popularEndpoint);
            const popularData = await popularResponse.json();

            if (popularData.results) {
                displayRelatedMovies(popularData.results.slice(0, 12), mediaType);
            }
        }
    } catch (error) {
        console.error('Error loading related movies:', error);
    }
}

function displayRelatedMovies(movies, mediaType) {
    relatedMoviesGrid.innerHTML = '';

    movies.forEach(movie => {
        if (movie.poster_path) {
            const movieCard = createRelatedMovieCard(movie, mediaType);
            relatedMoviesGrid.appendChild(movieCard);
        }
    });
}

function createRelatedMovieCard(movie, mediaType) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const title = movie.title || movie.name;
    const releaseDate = movie.release_date || movie.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';

    card.innerHTML = `
        <div class="movie-poster">
            <img src="${TMDB_IMAGE_BASE_URL}${movie.poster_path}" alt="${title}" loading="lazy">
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${title}</h3>
            <div class="movie-meta">
                <span class="movie-year">${year}</span>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        // Navigate to the new movie watch page
        window.location.href = `watch.html?id=${movie.id}&type=${mediaType}`;
    });

    return card;
}





function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentMovie.title || currentMovie.name);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=Watching ${title} on Movie Nest!`, '_blank');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`Currently watching ${currentMovie.title || currentMovie.name} on Movie Nest!`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
}

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

function showLoading() {
    loading.style.display = 'block';
    isLoading = true;
}

function hideLoading() {
    loading.style.display = 'none';
    isLoading = false;
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

function setupTvShowSelectors(movie) {
    const container = document.getElementById('episodeSelectionContainer');
    const seasonSelect = document.getElementById('seasonSelect');

    if (!movie.seasons || movie.seasons.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    seasonSelect.innerHTML = '';

    // Sort seasons by season number
    const sortedSeasons = [...movie.seasons].sort((a, b) => a.season_number - b.season_number);

    sortedSeasons.forEach(season => {
        // Optional: filter out season 0 (specials) if you want, usually best to keep them
        const option = document.createElement('option');
        option.value = season.season_number;
        option.textContent = season.name;
        seasonSelect.appendChild(option);
    });

    // Default to season 1 if available, else first available
    const hasSeason1 = sortedSeasons.find(s => s.season_number === 1);
    const defaultSeason = hasSeason1 ? 1 : sortedSeasons[0].season_number;

    seasonSelect.value = defaultSeason;
    currentSeason = defaultSeason;
    currentEpisode = 1; // Default to ep 1

    // If we're not on season 1, reload the player
    if (defaultSeason !== 1) {
        startStreaming(movie.id, 'tv');
    }

    // Load episodes for default season
    loadEpisodes(movie.id, defaultSeason);

    // Event listener
    seasonSelect.onchange = (e) => {
        const newSeason = parseInt(e.target.value);
        currentSeason = newSeason;
        loadEpisodes(movie.id, newSeason);
    };
}

async function loadEpisodes(seriesId, seasonNumber) {
    const episodesGrid = document.getElementById('episodesGrid');
    episodesGrid.innerHTML = '<div style="color: var(--text-secondary); padding: 10px;">Loading episodes...</div>';

    try {
        const response = await fetch(`${TMDB_BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`);
        const data = await response.json();

        if (data.episodes) {
            renderEpisodes(data.episodes);
        } else {
            episodesGrid.innerHTML = '<p style="color: var(--text-secondary);">No episodes found.</p>';
        }
    } catch (error) {
        console.error('Error loading episodes:', error);
        episodesGrid.innerHTML = '<p style="color: var(--text-secondary);">Error loading episodes.</p>';
    }
}

function renderEpisodes(episodes) {
    const episodesGrid = document.getElementById('episodesGrid');
    episodesGrid.innerHTML = '';

    episodes.forEach(episode => {
        const card = document.createElement('div');
        // Check if this is the currently selected episode
        const isActive = currentEpisode === episode.episode_number;
        card.className = `episode-card ${isActive ? 'active' : ''}`;

        card.innerHTML = `
            <span class="episode-number">
                <span class="episode-label-e">E</span><span class="episode-label-num">${episode.episode_number}</span>
            </span>
            <span class="episode-name">${episode.name}</span>
        `;

        card.addEventListener('click', () => {
            currentEpisode = episode.episode_number;

            // Update active state UI
            document.querySelectorAll('.episode-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            // Update player
            startStreaming(currentMovie.id, 'tv');

            // Scroll to player behavior
            const player = document.getElementById('videoEmbed');
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        episodesGrid.appendChild(card);
    });
}


