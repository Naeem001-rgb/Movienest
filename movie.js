// API Configuration
const TMDB_API_KEY = 'b8a35fb6e575578bcd764b42561cbd4e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
const VIDSRC_MOVIE_EMBED = 'https://vidsrc.to/embed/movie/';
const VIDSRC_TV_EMBED = 'https://vidsrc.to/embed/tv/';

// Global Variables
let currentMovie = null;
let isLoading = false;

// DOM Elements
const loading = document.getElementById('loading');
const movieTitle = document.getElementById('movieTitle');
const moviePoster = document.getElementById('moviePoster');
const backdropImage = document.getElementById('backdropImage');
const movieRating = document.getElementById('movieRating');
const movieYear = document.getElementById('movieYear');
const movieDuration = document.getElementById('movieDuration');
const movieType = document.getElementById('movieType');
const movieOverview = document.getElementById('movieOverview');
const movieReleaseDate = document.getElementById('movieReleaseDate');
const movieGenres = document.getElementById('movieGenres');
const movieCast = document.getElementById('movieCast');
const movieCountry = document.getElementById('movieCountry');
const movieProduction = document.getElementById('movieProduction');
const breadcrumbTitle = document.getElementById('breadcrumbTitle');
const breadcrumbCategory = document.getElementById('breadcrumbCategory');
const relatedMoviesGrid = document.getElementById('relatedMoviesGrid');
const videoPlayerSection = document.getElementById('videoPlayerSection');
const videoEmbed = document.getElementById('videoEmbed');
const playerTitle = document.getElementById('playerTitle');

// Initialize App
document.addEventListener('DOMContentLoaded', function () {
    initializeMoviePage();
    setupEventListeners();
});

// Set up header scroll behavior after page is fully loaded
window.addEventListener('load', function () {
    setupHeaderScrollBehavior();
});

function initializeMoviePage() {
    // Get movie ID and type from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const mediaType = urlParams.get('type') || 'movie';

    if (movieId) {
        loadMovieDetails(movieId, mediaType);
    } else {
        showError('Movie ID not found in URL');
    }
}

function setupEventListeners() {
    // Watch Now buttons
    document.getElementById('watchNowBtn').addEventListener('click', function () {
        if (currentMovie) {
            playMovie(currentMovie.id, currentMovie.media_type || 'movie');
        }
    });

    document.getElementById('heroPlayBtn').addEventListener('click', function () {
        if (currentMovie) {
            playMovie(currentMovie.id, currentMovie.media_type || 'movie');
        }
    });

    // Close player button
    document.getElementById('closePlayerBtn').addEventListener('click', function () {
        closeVideoPlayer();
    });

    // Favorite button
    document.getElementById('favoriteBtn').addEventListener('click', function () {
        toggleFavorite();
    });

    // Server selection buttons
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            if (currentMovie) {
                const server = this.dataset.server;
                switchServer(server);
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

    document.querySelector('.share-btn.whatsapp').addEventListener('click', function () {
        shareOnWhatsApp();
    });

    // Newsletter subscription
    setupNewsletterSubscription();
}

function setupHeaderScrollBehavior() {
    console.log('Setting up header scroll behavior on movie page');
    const header = document.querySelector('.header');

    if (!header) {
        console.error('Header element not found on movie page');
        return;
    }

    console.log('Header found, adding scroll listener');
    let lastScrollTop = 0;
    const scrollThreshold = 100;

    window.addEventListener('scroll', function () {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Only trigger behavior after scrolling past threshold
        if (Math.abs(currentScrollTop - lastScrollTop) < 5) return;

        if (currentScrollTop > scrollThreshold) {
            // Scrolling down - hide header
            if (currentScrollTop > lastScrollTop) {
                console.log('Movie page: Hiding header');
                header.style.transform = 'translateY(-100%)';
                header.style.opacity = '0';
            }
            // Scrolling up - show header
            else {
                console.log('Movie page: Showing header');
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

async function loadMovieDetails(movieId, mediaType) {
    showLoading();

    try {
        // Load main movie details
        const detailsEndpoint = `${TMDB_BASE_URL}/${mediaType}/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`;
        const response = await fetch(detailsEndpoint);
        const movieData = await response.json();

        if (movieData.id) {
            currentMovie = { ...movieData, media_type: mediaType };
            displayMovieDetails(movieData, mediaType);

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
    document.title = `${title} - Movie Nest`;

    // Update breadcrumb
    breadcrumbTitle.textContent = title;
    breadcrumbCategory.textContent = isMovie ? 'Movies' : 'TV Shows';

    // Update movie info
    movieTitle.textContent = title;
    moviePoster.src = `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`;
    moviePoster.alt = title;

    // Update backdrop
    if (movie.backdrop_path) {
        backdropImage.src = `${TMDB_BACKDROP_BASE_URL}${movie.backdrop_path}`;
        backdropImage.alt = title;
    }

    // Update rating
    movieRating.textContent = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    // Update year
    movieYear.textContent = year;

    // Update duration
    if (isMovie && movie.runtime) {
        const hours = Math.floor(movie.runtime / 60);
        const minutes = movie.runtime % 60;
        movieDuration.textContent = `${hours}h ${minutes}m`;
    } else if (!isMovie && movie.number_of_seasons) {
        movieDuration.textContent = `${movie.number_of_seasons} Season${movie.number_of_seasons > 1 ? 's' : ''}`;
    } else {
        movieDuration.textContent = 'N/A';
    }

    // Update type
    movieType.textContent = isMovie ? 'Movie' : 'TV Show';

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

    // Calculate rating percentage from TMDB vote_average (0-10 scale to 0-100%)
    const rating = movie.vote_average ? Math.round(movie.vote_average * 10) : 0;
    const ratingColor = getRatingColor(rating);

    card.innerHTML = `
        <div class="movie-poster">
            <img src="${TMDB_IMAGE_BASE_URL}${movie.poster_path}" alt="${title}" loading="lazy">
            ${rating > 0 ? `
                <div class="rating-badge" style="--rating-color: ${ratingColor}">
                    <div class="rating-circle">
                        <span class="rating-text">${rating}<sup>%</sup></span>
                    </div>
                </div>
            ` : ''}
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${title}</h3>
            <div class="movie-meta">
                <span class="movie-year">${year}</span>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        // Navigate to the new movie page
        window.location.href = `movie.html?id=${movie.id}&type=${mediaType}`;
    });

    return card;
}

function getRatingColor(rating) {
    if (rating >= 70) return '#21d07a'; // Green for high ratings
    if (rating >= 40) return '#d2d531'; // Yellow for medium ratings
    return '#db2360'; // Red for low ratings
}

function playMovie(movieId, mediaType) {
    // Redirect to dedicated watch page
    window.location.href = `watch.html?id=${movieId}&type=${mediaType}`;
}

function closeVideoPlayer() {
    videoPlayerSection.style.display = 'none';
    videoEmbed.innerHTML = '';
}

function switchServer(server) {
    if (!currentMovie) return;

    let embedUrl = '';
    const movieId = currentMovie.id;
    const mediaType = currentMovie.media_type || 'movie';

    switch (server) {
        case 'vidsrc':
            embedUrl = mediaType === 'movie' ?
                `${VIDSRC_MOVIE_EMBED}${movieId}` :
                `${VIDSRC_TV_EMBED}${movieId}`;
            break;
        case 'movcloud':
            // Alternative server URLs (these are examples)
            embedUrl = `https://movcloud.net/embed/${movieId}`;
            break;
        case 'mixdrop':
            embedUrl = `https://mixdrop.co/e/${movieId}`;
            break;
        default:
            embedUrl = mediaType === 'movie' ?
                `${VIDSRC_MOVIE_EMBED}${movieId}` :
                `${VIDSRC_TV_EMBED}${movieId}`;
    }

    videoEmbed.innerHTML = `
        <iframe src="${embedUrl}" allowfullscreen></iframe>
    `;
}

function toggleFavorite() {
    const favoriteBtn = document.getElementById('favoriteBtn');
    const icon = favoriteBtn.querySelector('i');

    if (icon.classList.contains('fas')) {
        icon.classList.remove('fas');
        icon.classList.add('far');
        favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Add to Favorite';
        showSuccessMessage('Removed from favorites');
    } else {
        icon.classList.remove('far');
        icon.classList.add('fas');
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Added to Favorite';
        showSuccessMessage('Added to favorites');
    }
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentMovie.title || currentMovie.name);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`, '_blank');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`Check out ${currentMovie.title || currentMovie.name} on Movie Nest!`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
}

function shareOnWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`Check out ${currentMovie.title || currentMovie.name} on Movie Nest! ${url}`);
    window.open(`https://wa.me/?text=${title}`, '_blank');
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


