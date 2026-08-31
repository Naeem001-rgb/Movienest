/**
 * Movie Nest Sitemap Generator
 * Automatically generates and updates sitemap.xml for better SEO
 */

class SitemapGenerator {
    constructor() {
        this.baseUrl = 'https://movie-nest-application.vercel.app';
        this.currentDate = new Date().toISOString().split('T')[0];
        this.pages = [];
    }

    // Define all website pages with their properties
    initializePages() {
        this.pages = [
            // Main Pages
            {
                url: '/',
                lastmod: this.currentDate,
                changefreq: 'daily',
                priority: '1.0'
            },
            {
                url: '/index.html',
                lastmod: this.currentDate,
                changefreq: 'daily',
                priority: '1.0'
            },

            // Contact Page
            {
                url: '/contact.html',
                lastmod: this.currentDate,
                changefreq: 'monthly',
                priority: '0.8'
            },

            // Legal Pages
            {
                url: '/Terms%20of%20Service.html',
                lastmod: this.currentDate,
                changefreq: 'yearly',
                priority: '0.6'
            },
            {
                url: '/DMCA.html',
                lastmod: this.currentDate,
                changefreq: 'yearly',
                priority: '0.6'
            },
            {
                url: '/privacy-policy.html',
                lastmod: this.currentDate,
                changefreq: 'yearly',
                priority: '0.6'
            },

            // Movie and TV Show Pages
            {
                url: '/movie.html',
                lastmod: this.currentDate,
                changefreq: 'weekly',
                priority: '0.9'
            },
            {
                url: '/watch.html',
                lastmod: this.currentDate,
                changefreq: 'weekly',
                priority: '0.9'
            },

            // Category Pages (Virtual URLs for SEO)
            {
                url: '/#movies',
                lastmod: this.currentDate,
                changefreq: 'daily',
                priority: '0.9'
            },
            {
                url: '/#tv',
                lastmod: this.currentDate,
                changefreq: 'daily',
                priority: '0.9'
            },
            {
                url: '/#trending',
                lastmod: this.currentDate,
                changefreq: 'daily',
                priority: '0.8'
            },

            // Genre Pages
            {
                url: '/#action',
                lastmod: this.currentDate,
                changefreq: 'weekly',
                priority: '0.7'
            },
            {
                url: '/#comedy',
                lastmod: this.currentDate,
                changefreq: 'weekly',
                priority: '0.7'
            },
            {
                url: '/#drama',
                lastmod: this.currentDate,
                changefreq: 'weekly',
                priority: '0.7'
            },
            {
                url: '/#horror',
                lastmod: this.currentDate,
                changefreq: 'weekly',
                priority: '0.7'
            },
            {
                url: '/#sci-fi',
                lastmod: this.currentDate,
                changefreq: 'weekly',
                priority: '0.7'
            }
        ];
    }

    // Add a new page to the sitemap
    addPage(url, changefreq = 'monthly', priority = '0.5', lastmod = null) {
        const page = {
            url: url,
            lastmod: lastmod || this.currentDate,
            changefreq: changefreq,
            priority: priority
        };
        
        // Check if page already exists
        const existingIndex = this.pages.findIndex(p => p.url === url);
        if (existingIndex !== -1) {
            // Update existing page
            this.pages[existingIndex] = page;
            console.log(`Updated existing page: ${url}`);
        } else {
            // Add new page
            this.pages.push(page);
            console.log(`Added new page: ${url}`);
        }
    }

    // Remove a page from the sitemap
    removePage(url) {
        const index = this.pages.findIndex(p => p.url === url);
        if (index !== -1) {
            this.pages.splice(index, 1);
            console.log(`Removed page: ${url}`);
            return true;
        }
        return false;
    }

    // Generate XML sitemap content
    generateXML() {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

`;

        // Add each page to the XML
        this.pages.forEach(page => {
            xml += `    <url>
        <loc>${this.baseUrl}${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>

`;
        });

        xml += `</urlset>`;
        return xml;
    }

    // Generate HTML sitemap for users
    generateHTML() {
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sitemap - Movie Nest</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        .sitemap-container {
            max-width: 800px;
            margin: 2rem auto;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .sitemap-section {
            margin-bottom: 2rem;
        }
        .sitemap-section h2 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .sitemap-links {
            list-style: none;
            padding: 0;
        }
        .sitemap-links li {
            margin: 10px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        .sitemap-links a {
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
        }
        .sitemap-links a:hover {
            text-decoration: underline;
        }
        .page-info {
            font-size: 0.9rem;
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="sitemap-container">
        <h1>Movie Nest - Site Map</h1>
        <p>Find all pages and sections of Movie Nest website below:</p>

        <div class="sitemap-section">
            <h2>Main Pages</h2>
            <ul class="sitemap-links">
                <li>
                    <a href="${this.baseUrl}/">Home Page</a>
                    <div class="page-info">Main landing page with trending movies and TV shows</div>
                </li>
                <li>
                    <a href="${this.baseUrl}/contact.html">Contact Us</a>
                    <div class="page-info">Get in touch with our support team</div>
                </li>
            </ul>
        </div>

        <div class="sitemap-section">
            <h2>Content Categories</h2>
            <ul class="sitemap-links">
                <li>
                    <a href="${this.baseUrl}/#movies">Movies</a>
                    <div class="page-info">Browse all movies</div>
                </li>
                <li>
                    <a href="${this.baseUrl}/#tv">TV Shows</a>
                    <div class="page-info">Browse all TV shows</div>
                </li>
                <li>
                    <a href="${this.baseUrl}/#trending">Trending</a>
                    <div class="page-info">Currently trending content</div>
                </li>
            </ul>
        </div>

        <div class="sitemap-section">
            <h2>Genres</h2>
            <ul class="sitemap-links">
                <li><a href="${this.baseUrl}/#action">Action Movies</a></li>
                <li><a href="${this.baseUrl}/#comedy">Comedy Movies</a></li>
                <li><a href="${this.baseUrl}/#drama">Drama Movies</a></li>
                <li><a href="${this.baseUrl}/#horror">Horror Movies</a></li>
                <li><a href="${this.baseUrl}/#sci-fi">Sci-Fi Movies</a></li>
            </ul>
        </div>

        <div class="sitemap-section">
            <h2>Legal Pages</h2>
            <ul class="sitemap-links">
                <li><a href="${this.baseUrl}/Terms%20of%20Service.html">Terms of Service</a></li>
                <li><a href="${this.baseUrl}/DMCA.html">DMCA Policy</a></li>
                <li><a href="${this.baseUrl}/privacy-policy.html">Privacy Policy</a></li>
            </ul>
        </div>

        <div style="text-align: center; margin-top: 2rem;">
            <a href="${this.baseUrl}/" style="color: #3498db; text-decoration: none; font-weight: 600;">← Back to Home</a>
        </div>
    </div>
</body>
</html>`;
        return html;
    }

    // Initialize and generate sitemap
    generate() {
        this.initializePages();
        return {
            xml: this.generateXML(),
            html: this.generateHTML()
        };
    }
}

// Usage example:
// const generator = new SitemapGenerator();
// const sitemaps = generator.generate();
// console.log('XML Sitemap:', sitemaps.xml);
// console.log('HTML Sitemap:', sitemaps.html);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SitemapGenerator;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
    window.SitemapGenerator = SitemapGenerator;
}

// Auto-generate sitemap when script loads (for development)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Movie Nest Sitemap Generator loaded');
        console.log('Use: new SitemapGenerator().generate() to create sitemaps');
    });
}