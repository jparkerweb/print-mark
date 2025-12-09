# 🖨️ print-mark

Convert Markdown to clean, printable HTML with PDF export

## Features

- **Live Preview** - See formatted output as you type with real-time rendering
- **Multiple Themes** - Choose from 4 print-optimized themes (Clean, Academic, Modern, Compact)
- **PDF Export** - Generate professional PDFs with customizable page sizes, margins, and page numbers
- **Syntax Highlighting** - Beautiful code highlighting powered by Shiki
- **File Upload** - Drag and drop or upload `.md`, `.markdown`, or `.txt` files
- **Responsive Design** - Works on desktop and tablets with resizable split panes
- **No Account Required** - Stateless, privacy-focused design

## Quick Start

### Docker (Recommended)

```bash
docker run -p 3000:3000 ghcr.io/jparkerweb/print-mark:latest
```

Then open http://localhost:3000 in your browser.

### Docker Compose

```yaml
services:
  print-mark:
    image: ghcr.io/jparkerweb/print-mark:latest
    ports:
      - "3000:3000"
    environment:
      - PDF_TIMEOUT=30000
      - PDF_CONCURRENT_LIMIT=3
    restart: unless-stopped
```

```bash
docker-compose up -d
```

### Local Development

Prerequisites:
- Node.js 22 or later
- npm 10 or later

```bash
# Clone the repository
git clone https://github.com/jparkerweb/print-mark.git
cd print-mark

# Install dependencies
npm install

# Build the application
npm run build

# Start the server
npm start
```

Development mode with hot reload:

```bash
npm run dev
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `HOST` | `0.0.0.0` | Server bind address |
| `NODE_ENV` | `production` | Environment (`development`, `production`, `test`) |
| `MAX_FILE_SIZE` | `26214400` | Maximum upload size in bytes (default: 25MB) |
| `PDF_TIMEOUT` | `30000` | PDF generation timeout in milliseconds |
| `PDF_CONCURRENT_LIMIT` | `3` | Maximum concurrent PDF generations |

## API Documentation

### Health Check

```http
GET /api/health
```

Returns server health status and version.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

**Example:**
```bash
curl http://localhost:3000/api/health
```

---

### List Themes

```http
GET /api/themes
```

Returns available themes with metadata.

**Response:**
```json
{
  "themes": [
    {
      "id": "clean",
      "name": "Clean",
      "description": "Minimal, professional styling"
    },
    {
      "id": "academic",
      "name": "Academic",
      "description": "Scholarly formatting with serifs"
    },
    {
      "id": "modern",
      "name": "Modern",
      "description": "Contemporary sans-serif design"
    },
    {
      "id": "compact",
      "name": "Compact",
      "description": "Space-efficient for dense content"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/api/themes
```

---

### Generate PDF

```http
POST /api/pdf
Content-Type: application/json
```

Converts Markdown to PDF and returns the file.

**Request Body:**
```json
{
  "markdown": "# Hello World\n\nThis is **bold** text.",
  "theme": "clean",
  "options": {
    "pageSize": "A4",
    "margins": "normal",
    "includePageNumbers": true
  }
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `markdown` | string | Yes | Markdown content to convert |
| `theme` | string | Yes | Theme ID (`clean`, `academic`, `modern`, `compact`) |
| `options.pageSize` | string | No | Page size: `A4`, `Letter`, `Legal` (default: `A4`) |
| `options.margins` | string | No | Margins: `normal`, `narrow`, `wide` (default: `normal`) |
| `options.includePageNumbers` | boolean | No | Show page numbers (default: `true`) |

**Response:** Binary PDF file with headers:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="document.pdf"`

**Example:**
```bash
curl -X POST http://localhost:3000/api/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello World\n\nThis is a test document.",
    "theme": "clean",
    "options": {
      "pageSize": "A4",
      "margins": "normal",
      "includePageNumbers": true
    }
  }' \
  --output document.pdf
```

**Error Responses:**

| Status | Description |
|--------|-------------|
| 400 | Validation failed (missing/invalid parameters) |
| 408 | Request timeout (document too large) |
| 503 | Service unavailable (server busy) |
| 500 | Internal server error |

---

### Upload File

```http
POST /api/upload
Content-Type: multipart/form-data
```

Upload a Markdown file and receive its content.

**Request:** Multipart form with file field

**Response:**
```json
{
  "filename": "document.md",
  "content": "# File content here...",
  "size": 1234
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@document.md"
```

**Supported file types:** `.md`, `.markdown`, `.txt`

**Error Responses:**

| Status | Description |
|--------|-------------|
| 400 | No file provided or invalid file type |
| 413 | File too large (exceeds MAX_FILE_SIZE) |
| 500 | Internal server error |

## Docker Deployment

### Building the Image

```bash
docker build -t print-mark:latest .
```

### Running with Docker

```bash
docker run -d \
  --name print-mark \
  -p 3000:3000 \
  -e PDF_TIMEOUT=60000 \
  -e PDF_CONCURRENT_LIMIT=5 \
  print-mark:latest
```

### Docker Compose (Production)

```yaml
services:
  print-mark:
    image: ghcr.io/jparkerweb/print-mark:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PDF_TIMEOUT=30000
      - PDF_CONCURRENT_LIMIT=3
      - MAX_FILE_SIZE=26214400
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Reverse Proxy (nginx)

Example nginx configuration for running behind a reverse proxy:

```nginx
server {
    listen 80;
    server_name print-mark.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeout for PDF generation
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;

        # Increase max body size for file uploads
        client_max_body_size 25M;
    }
}
```

## Themes

print-mark includes 4 print-optimized themes:

| Theme | Description |
|-------|-------------|
| **Clean** | Minimal, professional styling with excellent readability |
| **Academic** | Scholarly formatting with serif fonts, ideal for papers |
| **Modern** | Contemporary sans-serif design with subtle accents |
| **Compact** | Space-efficient layout for dense technical content |

All themes are optimized for:
- Print media with proper page breaks
- Syntax-highlighted code blocks
- Tables with clear borders
- Proper heading hierarchy

## Tech Stack

- **Runtime:** Node.js 22 LTS
- **Backend:** Fastify 5.x
- **Markdown:** markdown-it 14.x with plugins
- **Syntax Highlighting:** Shiki 1.x
- **PDF Generation:** Puppeteer 23.x
- **HTML Sanitization:** DOMPurify 3.x
- **Editor:** CodeMirror 6.x
- **Build:** Vite 6.x
- **Language:** TypeScript 5.x

## Security

- All HTML output is sanitized with DOMPurify to prevent XSS attacks
- File uploads are validated for type and size
- Input validation using Zod schemas
- Runs as non-root user in Docker
- No data persistence - all processing is stateless

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

Apache License 2.0 - see [LICENSE](LICENSE) for details.
