const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const EventEmitter = require('events');

const app = express();
const PORT = process.env.CMS_PORT || 1337;

// Real-time analytics event emitter
const analyticsEmitter = new EventEmitter();

// ==================== HELPER FUNCTIONS ====================

/**
 * Detect device type from user agent
 */
function getDeviceType(userAgent) {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Extract browser name from user agent
 */
function getBrowser(userAgent) {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Other';
}

/**
 * Generate random short code for link tracking
 */
function generateShortCode() {
  return crypto.randomBytes(4).toString('hex');
}

// ==================== DATABASE SETUP ====================
const db = new sqlite3.Database('./cms_database.db');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Projects table with extensive fields
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    status TEXT DEFAULT 'In Dev',
    category TEXT,
    client TEXT,
    duration TEXT,
    role TEXT,
    team_size INTEGER,
    live_url TEXT,
    repo_url TEXT,
    demo_url TEXT,
    case_study_url TEXT,
    featured BOOLEAN DEFAULT 0,
    sort_order INTEGER DEFAULT 0,

    -- Rich content sections
    overview TEXT,
    challenge TEXT,
    solution TEXT,
    process TEXT,
    results TEXT,
    testimonial TEXT,
    lessons_learned TEXT,
    technical_details TEXT,

    -- Metrics
    performance_improvement TEXT,
    user_growth TEXT,
    revenue_impact TEXT,

    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT,

    -- Timestamps
    project_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Project images table
  db.run(`CREATE TABLE IF NOT EXISTS project_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    image_url TEXT NOT NULL,
    image_type TEXT DEFAULT 'cover',
    alt_text TEXT,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`);

  // Technologies table
  db.run(`CREATE TABLE IF NOT EXISTS technologies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    icon_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Project-Technology junction table
  db.run(`CREATE TABLE IF NOT EXISTS project_technologies (
    project_id INTEGER,
    technology_id INTEGER,
    PRIMARY KEY (project_id, technology_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (technology_id) REFERENCES technologies(id) ON DELETE CASCADE
  )`);

  // Messages table
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    is_archived BOOLEAN DEFAULT 0,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Analytics table
  db.run(`CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    event_data TEXT,
    page_url TEXT,
    referrer TEXT,
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create default admin user if not exists
  const defaultPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`, [
    'admin',
    defaultPassword,
    'admin',
  ]);

  // Insert sample technologies if table is empty
  db.get(`SELECT COUNT(*) as count FROM technologies`, (err, row) => {
    if (!err && row.count === 0) {
      const techs = [
        'React',
        'Next.js',
        'TypeScript',
        'Node.js',
        'Express',
        'PostgreSQL',
        'MongoDB',
        'Redis',
        'Docker',
        'AWS',
        'Tailwind CSS',
        'Framer Motion',
        'GraphQL',
        'REST API',
        'n8n',
        'Python',
        'Django',
        'FastAPI',
        'Vue.js',
        'Svelte',
      ];

      techs.forEach((tech) => {
        db.run(`INSERT INTO technologies (name, category) VALUES (?, ?)`, [tech, 'General']);
      });
    }
  });
});

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    return next();
  } else {
    return res.status(401).json({ error: 'Authentication required' });
  }
};

// ==================== AUTHENTICATION ROUTES ====================
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    req.session.authenticated = true;
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ success: false, message: 'Logout failed' });
    } else {
      res.json({ success: true, message: 'Logout successful' });
    }
  });
});

app.get('/api/auth/check', (req, res) => {
  if (req.session && req.session.authenticated) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        username: req.session.username,
        role: req.session.role,
      },
    });
  } else {
    res.json({ authenticated: false });
  }
});

// ==================== PROJECT ROUTES ====================

// Get all projects (public endpoint for portfolio)
app.get('/api/projects/public', async (req, res) => {
  const query = `
    SELECT
      p.*,
      GROUP_CONCAT(DISTINCT t.name) as technologies,
      pi.image_url as cover_image,
      pi.alt_text as cover_image_alt
    FROM projects p
    LEFT JOIN project_technologies pt ON p.id = pt.project_id
    LEFT JOIN technologies t ON pt.technology_id = t.id
    LEFT JOIN project_images pi ON p.id = pi.project_id AND pi.image_type = 'cover'
    WHERE p.status != 'Archive'
    GROUP BY p.id
    ORDER BY p.featured DESC, p.sort_order ASC, p.created_at DESC
  `;

  db.all(query, [], (err, projects) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Format projects for frontend
    const formattedProjects = projects.map((project) => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.short_description || project.description,
      status: project.status,
      liveUrl: project.live_url,
      repoUrl: project.repo_url,
      coverImage: project.cover_image
        ? {
            url: project.cover_image.startsWith('http')
              ? project.cover_image
              : `${req.protocol}://${req.get('host')}${project.cover_image}`,
            alternativeText: project.cover_image_alt || project.title,
          }
        : null,
      technologies: project.technologies
        ? project.technologies.split(',').map((name, index) => ({
            id: index + 1,
            name: name.trim(),
          }))
        : [],
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));

    res.json({
      projects: formattedProjects,
      total: formattedProjects.length,
    });
  });
});

// Get featured projects only (public endpoint for homepage)
app.get('/api/projects/featured', async (req, res) => {
  const query = `
    SELECT
      p.*,
      GROUP_CONCAT(DISTINCT t.name) as technologies,
      pi.image_url as cover_image,
      pi.alt_text as cover_image_alt
    FROM projects p
    LEFT JOIN project_technologies pt ON p.id = pt.project_id
    LEFT JOIN technologies t ON pt.technology_id = t.id
    LEFT JOIN project_images pi ON p.id = pi.project_id AND pi.image_type = 'cover'
    WHERE p.status != 'Archive' AND p.featured = 1
    GROUP BY p.id
    ORDER BY p.sort_order ASC, p.created_at DESC
  `;

  db.all(query, [], (err, projects) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Format projects for frontend
    const formattedProjects = projects.map((project) => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.short_description || project.description,
      status: project.status,
      liveUrl: project.live_url,
      repoUrl: project.repo_url,
      coverImage: project.cover_image
        ? {
            url: project.cover_image.startsWith('http')
              ? project.cover_image
              : `${req.protocol}://${req.get('host')}${project.cover_image}`,
            alternativeText: project.cover_image_alt || project.title,
          }
        : null,
      technologies: project.technologies
        ? project.technologies.split(',').map((name, index) => ({
            id: index + 1,
            name: name.trim(),
          }))
        : [],
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));

    res.json({
      projects: formattedProjects,
      total: formattedProjects.length,
    });
  });
});

// Get single project by ID (public)
app.get('/api/projects/public/:id', (req, res) => {
  const projectId = req.params.id;

  console.log(`📁 Fetching project with ID: ${projectId}`);

  const query = `
    SELECT
      p.*,
      GROUP_CONCAT(DISTINCT t.name) as technologies
    FROM projects p
    LEFT JOIN project_technologies pt ON p.id = pt.project_id
    LEFT JOIN technologies t ON pt.technology_id = t.id
    WHERE p.id = ?
    GROUP BY p.id
  `;

  db.get(query, [projectId], (err, project) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!project) {
      console.log(`❌ Project ${projectId} not found`);
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log(`✅ Found project: ${project.title}`);

    // Get all images for this project
    db.all(
      `SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order`,
      [projectId],
      (err, images) => {
        if (err) {
          console.error('Error fetching images:', err);
          images = [];
        }

        // Build detailed content from all sections
        const detailedContent = `
        ${project.overview ? `<h2>Overview</h2>${project.overview}` : ''}
        ${project.challenge ? `<h2>The Challenge</h2>${project.challenge}` : ''}
        ${project.solution ? `<h2>The Solution</h2>${project.solution}` : ''}
        ${project.process ? `<h2>Development Process</h2>${project.process}` : ''}
        ${project.results ? `<h2>Results & Impact</h2>${project.results}` : ''}
        ${project.technical_details ? `<h2>Technical Implementation</h2>${project.technical_details}` : ''}
        ${project.lessons_learned ? `<h2>Lessons Learned</h2>${project.lessons_learned}` : ''}
      `.trim();

        const coverImage = images && images.find((img) => img.image_type === 'cover');

        const formattedProject = {
          id: project.id,
          title: project.title,
          slug: project.slug,
          description: project.description || project.short_description,
          status: project.status,
          liveUrl: project.live_url,
          repoUrl: project.repo_url,
          coverImage: coverImage
            ? {
                url: coverImage.image_url.startsWith('http')
                  ? coverImage.image_url
                  : `${req.protocol}://${req.get('host')}${coverImage.image_url}`,
                alternativeText: coverImage.alt_text || project.title,
              }
            : null,
          galleryImages: images ? images.filter((img) => img.image_type === 'gallery') : [],
          technologies: project.technologies
            ? project.technologies.split(',').map((name, index) => ({
                id: index + 1,
                name: name.trim(),
              }))
            : [],
          detailedContent:
            detailedContent ||
            `<h2>About ${project.title}</h2><p>${project.description || project.short_description}</p>`,
          client: project.client,
          duration: project.duration,
          role: project.role,
          teamSize: project.team_size,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
        };

        console.log(`📤 Sending project data for: ${project.title}`);
        res.json({ project: formattedProject });
      }
    );
  });
});

// Admin routes (require authentication)
app.get('/api/projects', requireAuth, (req, res) => {
  const query = `
    SELECT
      p.*,
      GROUP_CONCAT(DISTINCT t.name) as technologies,
      COUNT(DISTINCT pi.id) as image_count
    FROM projects p
    LEFT JOIN project_technologies pt ON p.id = pt.project_id
    LEFT JOIN technologies t ON pt.technology_id = t.id
    LEFT JOIN project_images pi ON p.id = pi.project_id
    GROUP BY p.id
    ORDER BY p.sort_order ASC, p.created_at DESC
  `;

  db.all(query, [], (err, projects) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      data: projects,
      meta: {
        total: projects.length,
      },
    });
  });
});

// Create new project
app.post('/api/projects', requireAuth, upload.array('images', 10), async (req, res) => {
  const projectData = JSON.parse(req.body.data || '{}');
  const uploadedFiles = req.files || [];

  // Generate slug if not provided
  const slug =
    projectData.slug ||
    projectData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const query = `
    INSERT INTO projects (
      title, slug, description, short_description, status, category,
      client, duration, role, team_size, live_url, repo_url, demo_url,
      featured, overview, challenge, solution, process, results,
      technical_details, lessons_learned, meta_title, meta_description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    projectData.title,
    slug,
    projectData.description,
    projectData.shortDescription,
    projectData.status || 'In Dev',
    projectData.category,
    projectData.client,
    projectData.duration,
    projectData.role,
    projectData.teamSize,
    projectData.liveUrl,
    projectData.repoUrl,
    projectData.demoUrl,
    projectData.featured ? 1 : 0,
    projectData.overview,
    projectData.challenge,
    projectData.solution,
    projectData.process,
    projectData.results,
    projectData.technicalDetails,
    projectData.lessonsLearned,
    projectData.metaTitle || projectData.title,
    projectData.metaDescription || projectData.shortDescription,
  ];

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create project' });
    }

    const projectId = this.lastID;

    // Handle image uploads
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file, index) => {
        const imageUrl = `/uploads/${file.filename}`;
        const imageType = index === 0 ? 'cover' : 'gallery';

        db.run(
          `INSERT INTO project_images (project_id, image_url, image_type, alt_text, sort_order)
                VALUES (?, ?, ?, ?, ?)`,
          [projectId, imageUrl, imageType, projectData.title, index]
        );
      });
    }

    // Handle technologies
    if (projectData.technologies && projectData.technologies.length > 0) {
      projectData.technologies.forEach((techName) => {
        // First, ensure technology exists
        db.run(`INSERT OR IGNORE INTO technologies (name) VALUES (?)`, [techName], function () {
          // Then create the relationship
          db.get(`SELECT id FROM technologies WHERE name = ?`, [techName], (err, tech) => {
            if (tech) {
              db.run(`INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)`, [
                projectId,
                tech.id,
              ]);
            }
          });
        });
      });
    }

    res.status(201).json({
      success: true,
      projectId,
      message: 'Project created successfully',
    });
  });
});

// Update project
app.put('/api/projects/:id', requireAuth, upload.array('images', 10), async (req, res) => {
  const projectId = req.params.id;
  const projectData = JSON.parse(req.body.data || '{}');
  const uploadedFiles = req.files || [];

  const query = `
    UPDATE projects SET
      title = ?, slug = ?, description = ?, short_description = ?,
      status = ?, category = ?, client = ?, duration = ?, role = ?,
      team_size = ?, live_url = ?, repo_url = ?, demo_url = ?,
      featured = ?, overview = ?, challenge = ?, solution = ?,
      process = ?, results = ?, technical_details = ?, lessons_learned = ?,
      meta_title = ?, meta_description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const params = [
    projectData.title,
    projectData.slug,
    projectData.description,
    projectData.shortDescription,
    projectData.status,
    projectData.category,
    projectData.client,
    projectData.duration,
    projectData.role,
    projectData.teamSize,
    projectData.liveUrl,
    projectData.repoUrl,
    projectData.demoUrl,
    projectData.featured ? 1 : 0,
    projectData.overview,
    projectData.challenge,
    projectData.solution,
    projectData.process,
    projectData.results,
    projectData.technicalDetails,
    projectData.lessonsLearned,
    projectData.metaTitle,
    projectData.metaDescription,
    projectId,
  ];

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update project' });
    }

    // Handle new image uploads
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file, index) => {
        const imageUrl = `/uploads/${file.filename}`;
        const imageType = projectData.coverImageIndex === index ? 'cover' : 'gallery';

        db.run(
          `INSERT INTO project_images (project_id, image_url, image_type, alt_text)
                VALUES (?, ?, ?, ?)`,
          [projectId, imageUrl, imageType, projectData.title]
        );
      });
    }

    // Update technologies
    // First, remove all existing relationships
    db.run(`DELETE FROM project_technologies WHERE project_id = ?`, [projectId], () => {
      // Then add new ones
      if (projectData.technologies && projectData.technologies.length > 0) {
        projectData.technologies.forEach((techName) => {
          db.run(`INSERT OR IGNORE INTO technologies (name) VALUES (?)`, [techName], function () {
            db.get(`SELECT id FROM technologies WHERE name = ?`, [techName], (err, tech) => {
              if (tech) {
                db.run(
                  `INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)`,
                  [projectId, tech.id]
                );
              }
            });
          });
        });
      }
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
    });
  });
});

// Get project images
app.get('/api/projects/:id/images', requireAuth, (req, res) => {
  const projectId = req.params.id;

  db.all(
    `SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order, id`,
    [projectId],
    (err, images) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch images' });
      }

      // Make URLs absolute
      const formattedImages = images.map((image) => ({
        ...image,
        image_url: image.image_url.startsWith('http')
          ? image.image_url
          : `${req.protocol}://${req.get('host')}${image.image_url}`,
      }));

      res.json({
        images: formattedImages,
      });
    }
  );
});

// Delete project image
app.delete('/api/projects/:projectId/images/:imageId', requireAuth, async (req, res) => {
  const { projectId, imageId } = req.params;

  // First get the image to delete the file
  db.get(
    `SELECT image_url FROM project_images WHERE id = ? AND project_id = ?`,
    [imageId, projectId],
    async (err, image) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Delete file if it exists
      if (image.image_url.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, image.image_url);
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.error('Failed to delete image file:', err);
        }
      }

      // Delete from database
      db.run(`DELETE FROM project_images WHERE id = ?`, [imageId], function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete image' });
        }

        res.json({
          success: true,
          message: 'Image deleted successfully',
        });
      });
    }
  );
});

// Delete project
app.delete('/api/projects/:id', requireAuth, async (req, res) => {
  const projectId = req.params.id;

  // First, get all images to delete files
  db.all(
    `SELECT image_url FROM project_images WHERE project_id = ?`,
    [projectId],
    async (err, images) => {
      // Delete image files
      for (const image of images) {
        if (image.image_url.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, image.image_url);
          try {
            await fs.unlink(filePath);
          } catch (err) {
            console.error('Failed to delete image file:', err);
          }
        }
      }

      // Delete from database (cascade will handle related records)
      db.run(`DELETE FROM projects WHERE id = ?`, [projectId], function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete project' });
        }

        res.json({
          success: true,
          message: 'Project deleted successfully',
        });
      });
    }
  );
});

// ==================== MESSAGE ROUTES ====================

// Public endpoint for contact form
app.post('/api/messages', (req, res) => {
  const { name, email, subject, message } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.get('user-agent');

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const query = `
    INSERT INTO messages (name, email, subject, message, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [name, email, subject, message, ipAddress, userAgent], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to send message' });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      messageId: this.lastID,
    });
  });
});

// Get all messages (admin)
app.get('/api/messages', requireAuth, (req, res) => {
  const query = `
    SELECT * FROM messages
    WHERE is_archived = 0
    ORDER BY created_at DESC
  `;

  db.all(query, [], (err, messages) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      data: messages,
      meta: {
        total: messages.length,
        unread: messages.filter((m) => !m.is_read).length,
      },
    });
  });
});

// Mark message as read
app.put('/api/messages/:id/read', requireAuth, (req, res) => {
  const messageId = req.params.id;

  db.run(`UPDATE messages SET is_read = 1 WHERE id = ?`, [messageId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update message' });
    }

    res.json({
      success: true,
      message: 'Message marked as read',
    });
  });
});

// Delete message
app.delete('/api/messages/:id', requireAuth, (req, res) => {
  const messageId = req.params.id;

  db.run(`DELETE FROM messages WHERE id = ?`, [messageId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete message' });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  });
});

// ==================== TECHNOLOGY ROUTES ====================
app.get('/api/technologies', (req, res) => {
  db.all(`SELECT * FROM technologies ORDER BY name`, [], (err, technologies) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      data: technologies,
      meta: {
        total: technologies.length,
      },
    });
  });
});

// ==================== ANALYTICS ROUTES ====================
app.post('/api/analytics/track', (req, res) => {
  const { event_type, event_data, page_url, referrer } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.get('user-agent');
  const sessionId = req.session?.id || crypto.randomBytes(16).toString('hex');

  const query = `
    INSERT INTO analytics (event_type, event_data, page_url, referrer, ip_address, user_agent, session_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [event_type, JSON.stringify(event_data), page_url, referrer, ipAddress, userAgent, sessionId],
    function (err) {
      if (err) {
        console.error('Analytics tracking error:', err);
        return res.status(500).json({ error: 'Failed to track analytics' });
      }

      res.json({
        success: true,
        eventId: this.lastID,
      });
    }
  );
});

app.get('/api/analytics', requireAuth, (req, res) => {
  const { timeframe = '7d' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate = new Date();

  switch (timeframe) {
    case '1d':
      startDate.setDate(now.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  const query = `
    SELECT * FROM analytics
    WHERE created_at >= datetime(?)
    ORDER BY created_at DESC
  `;

  db.all(query, [startDate.toISOString()], (err, events) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Calculate statistics
    const pageViews = events.filter((e) => e.event_type === 'page_view').length;
    const uniqueSessions = new Set(events.map((e) => e.session_id)).size;
    const projectViews = events.filter((e) => e.event_type === 'project_view').length;

    res.json({
      timeframe,
      summary: {
        totalEvents: events.length,
        pageViews,
        uniqueSessions,
        projectViews,
      },
      recentEvents: events.slice(0, 100),
    });
  });
});

// ==================== CAMPAIGN & LINK TRACKING ROUTES ====================

app.post('/api/campaigns', requireAuth, (req, res) => {
  const { name, platform, comment_format, description, target_url } = req.body;
  if (!name || !platform || !comment_format || !target_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(
    'INSERT INTO campaigns (name, platform, comment_format, description, target_url) VALUES (?, ?, ?, ?, ?)',
    [name, platform, comment_format, description, target_url],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to create campaign' });
      db.run('INSERT INTO campaign_stats (campaign_id) VALUES (?)', [this.lastID]);
      res.status(201).json({ success: true, campaignId: this.lastID });
    }
  );
});

app.get('/api/campaigns', requireAuth, (req, res) => {
  db.all(
    `SELECT c.*, cs.total_clicks, cs.unique_clicks, cs.ctr, cs.last_click,
     COUNT(DISTINCT tl.id) as link_count
     FROM campaigns c
     LEFT JOIN campaign_stats cs ON c.id = cs.campaign_id
     LEFT JOIN tracked_links tl ON c.id = tl.campaign_id
     GROUP BY c.id ORDER BY c.created_at DESC`,
    [],
    (err, campaigns) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ data: campaigns, meta: { total: campaigns.length } });
    }
  );
});

app.get('/api/campaigns/:id', requireAuth, (req, res) => {
  db.get(
    'SELECT c.*, cs.total_clicks, cs.unique_clicks, cs.ctr FROM campaigns c LEFT JOIN campaign_stats cs ON c.id = cs.campaign_id WHERE c.id = ?',
    [req.params.id],
    (err, campaign) => {
      if (err || !campaign) return res.status(404).json({ error: 'Campaign not found' });
      db.all('SELECT * FROM tracked_links WHERE campaign_id = ?', [req.params.id], (err, links) => {
        res.json({ campaign, links: links || [] });
      });
    }
  );
});

app.put('/api/campaigns/:id', requireAuth, (req, res) => {
  const { name, platform, comment_format, description, target_url, is_active } = req.body;
  db.run(
    'UPDATE campaigns SET name = COALESCE(?, name), platform = COALESCE(?, platform), comment_format = COALESCE(?, comment_format), description = COALESCE(?, description), target_url = COALESCE(?, target_url), is_active = COALESCE(?, is_active), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, platform, comment_format, description, target_url, is_active, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to update' });
      res.json({ success: true });
    }
  );
});

app.post('/api/campaigns/:id/links', requireAuth, (req, res) => {
  db.get('SELECT id, target_url FROM campaigns WHERE id = ?', [req.params.id], (err, campaign) => {
    if (err || !campaign) return res.status(404).json({ error: 'Campaign not found' });
    const shortCode = generateShortCode();
    db.run(
      'INSERT INTO tracked_links (campaign_id, short_code, original_url) VALUES (?, ?, ?)',
      [req.params.id, shortCode, campaign.target_url],
      function (err) {
        if (err) return res.status(400).json({ error: 'Failed to create link' });
        res.status(201).json({
          success: true,
          linkId: this.lastID,
          shortCode,
          trackingUrl: `http://localhost:1337/l/${shortCode}`,
        });
      }
    );
  });
});

app.get('/l/:shortCode', (req, res) => {
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'] || '';
  const referrer = req.headers['referer'] || '';
  db.get(
    'SELECT tl.*, c.target_url, c.is_active, c.id as campaign_id FROM tracked_links tl JOIN campaigns c ON tl.campaign_id = c.id WHERE tl.short_code = ?',
    [req.params.shortCode],
    (err, link) => {
      if (err || !link) return res.status(404).send('Link not found');
      if (!link.is_active) return res.status(410).send('Campaign inactive');
      const deviceType = getDeviceType(userAgent);
      const browser = getBrowser(userAgent);
      db.run(
        'INSERT INTO link_clicks (link_id, ip_address, user_agent, referrer, device_type, browser) VALUES (?, ?, ?, ?, ?, ?)',
        [link.id, ipAddress, userAgent, referrer, deviceType, browser]
      );
      db.run('UPDATE tracked_links SET total_clicks = total_clicks + 1 WHERE id = ?', [link.id]);
      db.get(
        "SELECT COUNT(*) as count FROM link_clicks WHERE link_id = ? AND ip_address = ? AND clicked_at > datetime('now', '-24 hours')",
        [link.id, ipAddress],
        (err, result) => {
          if (!err && result && result.count === 1) {
            db.run('UPDATE tracked_links SET unique_clicks = unique_clicks + 1 WHERE id = ?', [link.id]);
            db.run('UPDATE campaign_stats SET total_clicks = total_clicks + 1, unique_clicks = unique_clicks + 1, last_click = CURRENT_TIMESTAMP WHERE campaign_id = ?', [link.campaign_id]);
          } else {
            db.run('UPDATE campaign_stats SET total_clicks = total_clicks + 1, last_click = CURRENT_TIMESTAMP WHERE campaign_id = ?', [link.campaign_id]);
          }
        }
      );
      res.redirect(link.target_url);
    }
  );
});

app.get('/api/campaigns/:id/analytics', requireAuth, (req, res) => {
  const results = {};
  let completed = 0;
  db.all('SELECT DATE(lc.clicked_at) as date, COUNT(*) as clicks, COUNT(DISTINCT lc.ip_address) as unique_visitors FROM link_clicks lc JOIN tracked_links tl ON lc.link_id = tl.id WHERE tl.campaign_id = ? GROUP BY DATE(lc.clicked_at) ORDER BY date DESC', [req.params.id], (err, data) => {
    results.timeline = data || [];
    if (++completed === 3) res.json(results);
  });
  db.all('SELECT lc.device_type, COUNT(*) as clicks FROM link_clicks lc JOIN tracked_links tl ON lc.link_id = tl.id WHERE tl.campaign_id = ? GROUP BY lc.device_type', [req.params.id], (err, data) => {
    results.devices = data || [];
    if (++completed === 3) res.json(results);
  });
  db.all('SELECT lc.browser, COUNT(*) as clicks FROM link_clicks lc JOIN tracked_links tl ON lc.link_id = tl.id WHERE tl.campaign_id = ? GROUP BY lc.browser', [req.params.id], (err, data) => {
    results.browsers = data || [];
    if (++completed === 3) res.json(results);
  });
});

app.get('/api/campaigns/compare', requireAuth, (req, res) => {
  let query = 'SELECT c.*, cs.total_clicks, cs.unique_clicks, cs.ctr FROM campaigns c LEFT JOIN campaign_stats cs ON c.id = cs.campaign_id WHERE c.is_active = 1';
  const params = [];
  if (req.query.platform) {
    query += ' AND c.platform = ?';
    params.push(req.query.platform);
  }
  query += ' ORDER BY cs.total_clicks DESC';
  db.all(query, params, (err, campaigns) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ platform: req.query.platform || 'all', campaigns });
  });
});

app.delete('/api/campaigns/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM campaigns WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to delete' });
    res.json({ success: true });
  });
});

// ==================== INCOME TRACKING ROUTES ====================

app.post('/api/income', requireAuth, (req, res) => {
  const { project_id, client_name, amount, currency, payment_method, payment_date, invoice_number, status, category, description, notes } = req.body;
  if (!client_name || !amount) return res.status(400).json({ error: 'Client name and amount required' });
  db.run(
    'INSERT INTO income_records (project_id, client_name, amount, currency, payment_method, payment_date, invoice_number, status, category, description, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [project_id, client_name, amount, currency || 'USD', payment_method, payment_date, invoice_number, status || 'pending', category || 'project', description, notes],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to create record' });
      res.status(201).json({ success: true, incomeId: this.lastID });
    }
  );
});

app.get('/api/income', requireAuth, (req, res) => {
  let query = 'SELECT ir.*, p.title as project_title FROM income_records ir LEFT JOIN projects p ON ir.project_id = p.id WHERE 1=1';
  const params = [];
  if (req.query.status) {
    query += ' AND ir.status = ?';
    params.push(req.query.status);
  }
  if (req.query.year && req.query.month) {
    query += " AND strftime('%Y', ir.payment_date) = ? AND strftime('%m', ir.payment_date) = ?";
    params.push(req.query.year, String(req.query.month).padStart(2, '0'));
  }
  query += ' ORDER BY ir.payment_date DESC';
  db.all(query, params, (err, records) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const totals = {
      total: records.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
      received: records.filter(r => r.status === 'received').reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
      pending: records.filter(r => r.status === 'pending').reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
    };
    res.json({ data: records, meta: { count: records.length, totals } });
  });
});

app.get('/api/income/dashboard', requireAuth, (req, res) => {
  const results = {};
  let completed = 0;
  db.all("SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM income_records WHERE strftime('%Y-%m', payment_date) = strftime('%Y-%m', 'now') AND status = 'received'", [], (err, data) => {
    results.currentMonth = data && data[0] ? data[0] : { total: 0, count: 0 };
    if (++completed === 5) res.json(results);
  });
  db.all("SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM income_records WHERE strftime('%Y', payment_date) = strftime('%Y', 'now') AND status = 'received'", [], (err, data) => {
    results.ytd = data && data[0] ? data[0] : { total: 0, count: 0 };
    if (++completed === 5) res.json(results);
  });
  db.all("SELECT category, COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM income_records WHERE status = 'received' GROUP BY category", [], (err, data) => {
    results.byCategory = data || [];
    if (++completed === 5) res.json(results);
  });
  db.all("SELECT client_name, COALESCE(SUM(amount), 0) as total, COUNT(*) as payments FROM income_records WHERE status = 'received' GROUP BY client_name ORDER BY total DESC LIMIT 10", [], (err, data) => {
    results.topClients = data || [];
    if (++completed === 5) res.json(results);
  });
  db.all("SELECT id, client_name, amount, payment_date, invoice_number FROM income_records WHERE status = 'pending' ORDER BY payment_date ASC", [], (err, data) => {
    results.pending = data || [];
    if (++completed === 5) res.json(results);
  });
});

app.put('/api/income/:id', requireAuth, (req, res) => {
  const { client_name, amount, status, payment_date, category } = req.body;
  db.run(
    'UPDATE income_records SET client_name = COALESCE(?, client_name), amount = COALESCE(?, amount), status = COALESCE(?, status), payment_date = COALESCE(?, payment_date), category = COALESCE(?, category), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [client_name, amount, status, payment_date, category, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to update' });
      res.json({ success: true });
    }
  );
});

app.delete('/api/income/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM income_records WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to delete' });
    res.json({ success: true });
  });
});

// ==================== ENHANCED VISITOR ANALYTICS ====================

app.get('/api/analytics/dashboard', requireAuth, (req, res) => {
  const timeframe = req.query.timeframe || '7d';
  let days = 7;
  if (timeframe === '1d') days = 1;
  else if (timeframe === '30d') days = 30;
  const results = { timeframe };
  let completed = 0;
  db.all("SELECT COUNT(DISTINCT session_id) as total_visitors, SUM(page_views) as total_page_views, ROUND(AVG(page_views), 2) as avg_pages_per_session, ROUND(AVG(session_duration), 2) as avg_session_duration, COUNT(DISTINCT CASE WHEN is_returning = 1 THEN session_id END) as returning_visitors FROM visitor_sessions WHERE first_visit >= datetime('now', '-" + days + " days')", [], (err, data) => {
    results.overview = data || [];
    if (++completed === 4) res.json(results);
  });
  db.all("SELECT referrer_source, COUNT(*) as visitors FROM visitor_sessions WHERE first_visit >= datetime('now', '-" + days + " days') GROUP BY referrer_source ORDER BY visitors DESC", [], (err, data) => {
    results.sources = data || [];
    if (++completed === 4) res.json(results);
  });
  db.all("SELECT device_type, COUNT(*) as visitors FROM visitor_sessions WHERE first_visit >= datetime('now', '-" + days + " days') GROUP BY device_type", [], (err, data) => {
    results.devices = data || [];
    if (++completed === 4) res.json(results);
  });
  db.all("SELECT page_url, COUNT(*) as views, ROUND(AVG(time_on_page), 2) as avg_time_on_page FROM page_views WHERE viewed_at >= datetime('now', '-" + days + " days') GROUP BY page_url ORDER BY views DESC LIMIT 10", [], (err, data) => {
    results.pages = data || [];
    if (++completed === 4) res.json(results);
  });
});

app.get('/api/analytics/realtime', requireAuth, (req, res) => {
  db.all(
    "SELECT vs.session_id, vs.last_visit, vs.device_type, pv.page_url as current_page FROM visitor_sessions vs LEFT JOIN page_views pv ON vs.session_id = pv.session_id WHERE vs.last_visit >= datetime('now', '-5 minutes') AND pv.id = (SELECT MAX(id) FROM page_views WHERE session_id = vs.session_id) ORDER BY vs.last_visit DESC",
    [],
    (err, visitors) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ active_visitors: visitors.length, visitors });
    }
  );
});

// ==================== AFFILIATE LINKS ROUTES ====================

// Middleware to require API key (optional - you can use requireAuth instead)
const requireApiKey = (req, res, next) => {
  // For now, use the same auth as admin. You can implement API key auth later
  return requireAuth(req, res, next);
};

// Get all affiliate links (admin)
app.get('/api/affiliate/links', requireApiKey, async (req, res) => {
  const { category, platform, active } = req.query;

  let query = 'SELECT * FROM affiliate_links WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (platform) {
    query += ' AND platform = ?';
    params.push(platform);
  }

  if (active !== undefined) {
    query += ' AND is_active = ?';
    params.push(active === 'true' ? 1 : 0);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, links) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      success: true,
      data: links,
      meta: {
        total: links.length,
      },
    });
  });
});

// Get single affiliate link (admin)
app.get('/api/affiliate/links/:id', requireApiKey, async (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM affiliate_links WHERE id = ?', [id], (err, link) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!link) {
      return res.status(404).json({ error: 'Affiliate link not found' });
    }

    res.json({
      success: true,
      data: link,
    });
  });
});

// Create new affiliate link (admin)
app.post('/api/affiliate/links', requireApiKey, async (req, res) => {
  const {
    name,
    description,
    original_url,
    short_code,
    category,
    platform,
    commission_rate,
    expires_at,
  } = req.body;

  if (!name || !original_url || !short_code) {
    return res.status(400).json({
      error: 'Name, original_url, and short_code are required',
    });
  }

  const query = `
    INSERT INTO affiliate_links (
      name, description, original_url, short_code, category,
      platform, commission_rate, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [name, description, original_url, short_code, category, platform, commission_rate, expires_at],
    function (err) {
      if (err) {
        console.error('Database error:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({
            error: 'Short code already exists',
          });
        }
        return res.status(500).json({ error: 'Failed to create affiliate link' });
      }

      res.status(201).json({
        success: true,
        data: {
          id: this.lastID,
          name,
          short_code,
        },
        message: 'Affiliate link created successfully',
      });
    }
  );
});

// Update affiliate link (admin)
app.put('/api/affiliate/links/:id', requireApiKey, async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    original_url,
    short_code,
    category,
    platform,
    commission_rate,
    is_active,
    expires_at,
  } = req.body;

  const query = `
    UPDATE affiliate_links SET
      name = ?, description = ?, original_url = ?, short_code = ?,
      category = ?, platform = ?, commission_rate = ?, is_active = ?,
      expires_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(
    query,
    [
      name,
      description,
      original_url,
      short_code,
      category,
      platform,
      commission_rate,
      is_active,
      expires_at,
      id,
    ],
    function (err) {
      if (err) {
        console.error('Database error:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({
            error: 'Short code already exists',
          });
        }
        return res.status(500).json({ error: 'Failed to update affiliate link' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Affiliate link not found' });
      }

      res.json({
        success: true,
        message: 'Affiliate link updated successfully',
      });
    }
  );
});

// Delete affiliate link (admin)
app.delete('/api/affiliate/links/:id', requireApiKey, async (req, res) => {
  const { id } = req.params;

  // First delete associated clicks and performance data
  db.run('DELETE FROM affiliate_clicks WHERE link_id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting clicks:', err);
    }

    db.run('DELETE FROM affiliate_performance WHERE link_id = ?', [id], (err) => {
      if (err) {
        console.error('Error deleting performance data:', err);
      }

      // Now delete the link itself
      db.run('DELETE FROM affiliate_links WHERE id = ?', [id], function (err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to delete affiliate link' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Affiliate link not found' });
        }

        res.json({
          success: true,
          message: 'Affiliate link deleted successfully',
        });
      });
    });
  });
});

// Public redirect endpoint with click tracking
app.get('/go/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  const ipAddress = req.ip;
  const userAgent = req.get('user-agent');
  const referrer = req.get('referer') || req.get('referrer') || 'direct';

  // Get the affiliate link
  db.get(
    'SELECT * FROM affiliate_links WHERE short_code = ? AND is_active = 1',
    [shortCode],
    (err, link) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Internal server error');
      }

      if (!link) {
        return res.status(404).send('Link not found');
      }

      // Check if link has expired
      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        return res.status(410).send('Link has expired');
      }

      // Detect device type from user agent
      const deviceType = /mobile/i.test(userAgent)
        ? 'mobile'
        : /tablet/i.test(userAgent)
          ? 'tablet'
          : 'desktop';

      // Track the click
      const clickQuery = `
        INSERT INTO affiliate_clicks (
          link_id, ip_address, user_agent, referrer, device_type
        ) VALUES (?, ?, ?, ?, ?)
      `;

      db.run(clickQuery, [link.id, ipAddress, userAgent, referrer, deviceType], function (err) {
        if (err) {
          console.error('Error tracking click:', err);
        }

        // Update total clicks count
        db.run(
          'UPDATE affiliate_links SET total_clicks = total_clicks + 1 WHERE id = ?',
          [link.id],
          (err) => {
            if (err) {
              console.error('Error updating click count:', err);
            }
          }
        );

        // Update daily performance
        const today = new Date().toISOString().split('T')[0];
        db.run(
          `INSERT INTO affiliate_performance (link_id, date, clicks)
           VALUES (?, ?, 1)
           ON CONFLICT(link_id, date) DO UPDATE SET clicks = clicks + 1`,
          [link.id, today],
          (err) => {
            if (err) {
              console.error('Error updating performance:', err);
            }
          }
        );

        // Emit real-time event
        analyticsEmitter.emit('click', {
          linkId: link.id,
          linkName: link.name,
          shortCode: link.short_code,
          timestamp: new Date(),
          deviceType,
          ip: ipAddress.substring(0, 10) + '...', // Anonymize IP
        });
      });

      // Redirect to the original URL
      res.redirect(302, link.original_url);
    }
  );
});

// Get affiliate analytics (admin)
app.get('/api/affiliate/analytics', requireApiKey, async (req, res) => {
  const { timeframe = '7d', link_id } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate = new Date();

  switch (timeframe) {
    case '1d':
      startDate.setDate(now.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  const dateFilter = startDate.toISOString().split('T')[0];

  // Get performance data
  let performanceQuery = `
    SELECT
      ap.*,
      al.name as link_name,
      al.short_code
    FROM affiliate_performance ap
    JOIN affiliate_links al ON ap.link_id = al.id
    WHERE ap.date >= ?
  `;

  const params = [dateFilter];

  if (link_id) {
    performanceQuery += ' AND ap.link_id = ?';
    params.push(link_id);
  }

  performanceQuery += ' ORDER BY ap.date DESC';

  db.all(performanceQuery, params, (err, performance) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Get summary statistics
    const summaryQuery = link_id
      ? 'SELECT * FROM affiliate_links WHERE id = ?'
      : 'SELECT * FROM affiliate_links';

    const summaryParams = link_id ? [link_id] : [];

    db.all(summaryQuery, summaryParams, (err, links) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const summary = {
        totalClicks: links.reduce((sum, link) => sum + (link.total_clicks || 0), 0),
        totalConversions: links.reduce((sum, link) => sum + (link.conversions || 0), 0),
        totalRevenue: links.reduce((sum, link) => sum + (parseFloat(link.revenue) || 0), 0),
        activeLinks: links.filter((link) => link.is_active).length,
        totalLinks: links.length,
      };

      res.json({
        success: true,
        timeframe,
        summary,
        performance,
        links,
      });
    });
  });
});

// Get click details for a specific link (admin)
app.get('/api/affiliate/links/:id/clicks', requireApiKey, async (req, res) => {
  const { id } = req.params;
  const { limit = 100, offset = 0 } = req.query;

  const query = `
    SELECT * FROM affiliate_clicks
    WHERE link_id = ?
    ORDER BY clicked_at DESC
    LIMIT ? OFFSET ?
  `;

  db.all(query, [id, parseInt(limit), parseInt(offset)], (err, clicks) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Get total count
    db.get('SELECT COUNT(*) as total FROM affiliate_clicks WHERE link_id = ?', [id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        success: true,
        data: clicks,
        meta: {
          total: row.total,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    });
  });
});

// Record conversion (can be called from client or webhook)
app.post('/api/affiliate/conversion', async (req, res) => {
  const { link_id, click_id, conversion_value } = req.body;

  if (!link_id) {
    return res.status(400).json({ error: 'link_id is required' });
  }

  // Update click record if click_id provided
  if (click_id) {
    db.run(
      'UPDATE affiliate_clicks SET converted = 1, conversion_value = ? WHERE id = ?',
      [conversion_value || 0, click_id],
      (err) => {
        if (err) {
          console.error('Error updating click:', err);
        }
      }
    );
  }

  // Update link totals
  db.run(
    `UPDATE affiliate_links SET
      conversions = conversions + 1,
      revenue = revenue + ?
     WHERE id = ?`,
    [conversion_value || 0, link_id],
    (err) => {
      if (err) {
        console.error('Error updating link:', err);
        return res.status(500).json({ error: 'Failed to record conversion' });
      }

      // Update daily performance
      const today = new Date().toISOString().split('T')[0];
      db.run(
        `INSERT INTO affiliate_performance (link_id, date, conversions, revenue)
         VALUES (?, ?, 1, ?)
         ON CONFLICT(link_id, date) DO UPDATE SET
           conversions = conversions + 1,
           revenue = revenue + ?`,
        [link_id, today, conversion_value || 0, conversion_value || 0],
        (err) => {
          if (err) {
            console.error('Error updating performance:', err);
          }
        }
      );

      // Emit real-time event
      analyticsEmitter.emit('conversion', {
        linkId: link_id,
        value: conversion_value || 0,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Conversion recorded successfully',
      });
    }
  );
});

// Get comprehensive dashboard analytics
app.get('/api/affiliate/dashboard', requireApiKey, (req, res) => {
  const { period = '7d' } = req.query; // 7d, 30d, 90d, all

  let dateFilter = '';
  if (period !== 'all') {
    const days = parseInt(period);
    dateFilter = `AND ac.clicked_at >= datetime('now', '-${days} days')`;
  }

  // Get overall stats
  const overallQuery = `
    SELECT
      COUNT(DISTINCT al.id) as total_links,
      SUM(al.total_clicks) as total_clicks,
      SUM(al.unique_clicks) as unique_clicks,
      SUM(al.conversions) as total_conversions,
      SUM(al.revenue) as total_revenue,
      ROUND(AVG((CAST(al.conversions AS FLOAT) / NULLIF(al.total_clicks, 0)) * 100), 2) as avg_conversion_rate,
      ROUND(AVG((CAST(al.unique_clicks AS FLOAT) / NULLIF(al.total_clicks, 0)) * 100), 2) as avg_unique_rate
    FROM affiliate_links al
    WHERE al.is_active = 1
  `;

  // Get top performing links
  const topLinksQuery = `
    SELECT
      al.id,
      al.name,
      al.short_code,
      al.category,
      al.total_clicks,
      al.unique_clicks,
      al.conversions,
      al.revenue,
      ROUND((CAST(al.conversions AS FLOAT) / NULLIF(al.total_clicks, 0)) * 100, 2) as conversion_rate,
      ROUND((CAST(al.unique_clicks AS FLOAT) / NULLIF(al.total_clicks, 0)) * 100, 2) as ctr
    FROM affiliate_links al
    WHERE al.is_active = 1
    ORDER BY al.total_clicks DESC
    LIMIT 10
  `;

  // Get clicks over time
  const clicksTimelineQuery = `
    SELECT
      DATE(ac.clicked_at) as date,
      COUNT(*) as clicks,
      COUNT(DISTINCT ac.ip_address) as unique_visitors
    FROM affiliate_clicks ac
    WHERE 1=1 ${dateFilter}
    GROUP BY DATE(ac.clicked_at)
    ORDER BY date DESC
  `;

  // Get device breakdown
  const deviceBreakdownQuery = `
    SELECT
      ac.device_type,
      COUNT(*) as clicks,
      ROUND((CAST(COUNT(*) AS FLOAT) / (SELECT COUNT(*) FROM affiliate_clicks WHERE 1=1 ${dateFilter})) * 100, 2) as percentage
    FROM affiliate_clicks ac
    WHERE 1=1 ${dateFilter}
    GROUP BY ac.device_type
  `;

  // Get category performance
  const categoryPerformanceQuery = `
    SELECT
      al.category,
      COUNT(DISTINCT al.id) as link_count,
      SUM(al.total_clicks) as total_clicks,
      SUM(al.conversions) as conversions,
      SUM(al.revenue) as revenue,
      ROUND((CAST(SUM(al.conversions) AS FLOAT) / NULLIF(SUM(al.total_clicks), 0)) * 100, 2) as conversion_rate
    FROM affiliate_links al
    WHERE al.is_active = 1 AND al.category IS NOT NULL
    GROUP BY al.category
    ORDER BY total_clicks DESC
  `;

  // Execute all queries
  const results = {};

  db.get(overallQuery, (err, overall) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    results.overall = overall;

    db.all(topLinksQuery, (err, topLinks) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      results.topLinks = topLinks;

      db.all(clicksTimelineQuery, (err, timeline) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        results.timeline = timeline;

        db.all(deviceBreakdownQuery, (err, devices) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          results.deviceBreakdown = devices;

          db.all(categoryPerformanceQuery, (err, categories) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            results.categoryPerformance = categories;

            // Calculate additional metrics
            results.overall.ctr = results.overall.total_clicks > 0
              ? ((results.overall.unique_clicks / results.overall.total_clicks) * 100).toFixed(2)
              : 0;

            res.json(results);
          });
        });
      });
    });
  });
});

// Real-time analytics stream (SSE)
app.get('/api/affiliate/stream', requireApiKey, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial data
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date() })}\n\n`);

  // Listen for click events
  const clickHandler = (data) => {
    res.write(`data: ${JSON.stringify({ type: 'click', ...data })}\n\n`);
  };

  const conversionHandler = (data) => {
    res.write(`data: ${JSON.stringify({ type: 'conversion', ...data })}\n\n`);
  };

  analyticsEmitter.on('click', clickHandler);
  analyticsEmitter.on('conversion', conversionHandler);

  // Send heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date() })}\n\n`);
  }, 30000);

  // Cleanup on close
  req.on('close', () => {
    clearInterval(heartbeat);
    analyticsEmitter.off('click', clickHandler);
    analyticsEmitter.off('conversion', conversionHandler);
  });
});

// Export analytics data as CSV
app.get('/api/affiliate/export', requireApiKey, (req, res) => {
  const { type = 'links', startDate, endDate } = req.query;

  let query = '';

  if (type === 'links') {
    query = `
      SELECT
        al.id,
        al.name,
        al.short_code,
        al.original_url,
        al.category,
        al.platform,
        al.total_clicks,
        al.unique_clicks,
        al.conversions,
        al.revenue,
        al.created_at
      FROM affiliate_links al
      ORDER BY al.total_clicks DESC
    `;
  } else if (type === 'clicks') {
    query = `
      SELECT
        al.name as link_name,
        al.short_code,
        ac.ip_address,
        ac.user_agent,
        ac.referrer,
        ac.device_type,
        ac.clicked_at,
        ac.converted
      FROM affiliate_clicks ac
      JOIN affiliate_links al ON ac.link_id = al.id
      WHERE 1=1
    `;

    if (startDate) query += ` AND ac.clicked_at >= '${startDate}'`;
    if (endDate) query += ` AND ac.clicked_at <= '${endDate}'`;

    query += ' ORDER BY ac.clicked_at DESC';
  }

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }

    // Convert to CSV
    const headers = Object.keys(rows[0]).join(',');
    const csv = [
      headers,
      ...rows.map(row => Object.values(row).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="affiliate-${type}-${Date.now()}.csv"`);
    res.send(csv);
  });
});

// ==================== BOOKING SYSTEM ====================

const { createTransport } = require('nodemailer');

// Email transporter
const emailTransporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify email on startup
emailTransporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server ready');
  }
});

// Helper: Generate meeting link
function generateMeetLink(bookingId) {
  return `https://meet.google.com/new`;
}

// Helper: Send booking confirmation email
async function sendBookingConfirmation(booking) {
  const meetLink = booking.meeting_link;
  const bookingDate = new Date(booking.date);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981, #3b82f6); padding: 40px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px; }
        .meeting-card { background: #f1f5f9; padding: 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #10b981; }
        .detail { margin: 12px 0; color: #475569; }
        .button { display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Meeting Confirmed!</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; font-weight: 600;">Hi ${booking.name},</p>
          <p>Your consultation has been successfully scheduled.</p>
          <div class="meeting-card">
            <h3>📋 Meeting Details</h3>
            <div class="detail"><strong>📅 Date:</strong> ${bookingDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div class="detail"><strong>🕐 Time:</strong> ${booking.time} (${booking.duration} minutes)</div>
            <div class="detail"><strong>📹 Platform:</strong> Google Meet</div>
            <div class="detail"><strong>📧 Email:</strong> ${booking.email}</div>
            ${booking.notes ? `<div class="detail"><strong>📝 Notes:</strong> ${booking.notes}</div>` : ''}
          </div>
          <div style="text-align: center;">
            <a href="${meetLink}" class="button">Join Meeting</a>
          </div>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <strong>💡 Preparation Tips:</strong>
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>Join from a quiet space with stable internet</li>
              <li>Have your project details ready</li>
              <li>Test camera and microphone beforehand</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>Looking forward to speaking with you! 👋</p>
          <p style="margin-top: 10px;">Need to reschedule? Reply to this email 24 hours before.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await emailTransporter.sendMail({
    from: `"Portfolio" <${process.env.EMAIL_FROM}>`,
    to: booking.email,
    subject: `✅ Meeting Confirmed - ${bookingDate.toLocaleDateString()} at ${booking.time}`,
    html,
  });

  // Send copy to yourself
  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_FROM,
    subject: `🔔 New Booking: ${booking.name}`,
    html: `
      <h2>New Meeting Booked</h2>
      <p><strong>Name:</strong> ${booking.name}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Phone:</strong> ${booking.phone || 'Not provided'}</p>
      <p><strong>Date:</strong> ${bookingDate.toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${booking.time} (${booking.duration} min)</p>
      ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
      <p><a href="${meetLink}">Meeting Link</a></p>
    `,
  });
}

// CREATE BOOKING
app.post('/api/bookings', async (req, res) => {
  const { name, email, phone, date, time, duration, meetingType, notes } = req.body;

  if (!name || !email || !date || !time || !duration) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if slot is available
  db.get(
    'SELECT id FROM bookings WHERE date = ? AND time = ? AND status = "confirmed"',
    [date, time],
    async (err, existing) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (existing) return res.status(409).json({ error: 'Time slot no longer available' });

      db.run(
        `INSERT INTO bookings (name, email, phone, date, time, duration, meeting_type, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
        [name, email, phone, date, time, duration, meetingType, notes],
        async function (err) {
          if (err) return res.status(500).json({ error: 'Failed to create booking' });

          const bookingId = this.lastID;
          const meetingLink = generateMeetLink(bookingId);

          db.run('UPDATE bookings SET meeting_link = ? WHERE id = ?', [meetingLink, bookingId]);

          db.get('SELECT * FROM bookings WHERE id = ?', [bookingId], async (err, booking) => {
            try {
              await sendBookingConfirmation(booking);
              console.log(`✅ Booking created: ${booking.name} - ${booking.date} ${booking.time}`);
            } catch (emailError) {
              console.error('Email error:', emailError);
            }

            res.status(201).json({
              success: true,
              bookingId,
              booking: { id: bookingId, name, email, date, time, duration, meetingLink },
              message: 'Booking confirmed! Check your email.',
            });
          });
        }
      );
    }
  );
});

// GET ALL BOOKINGS (Admin)
app.get('/api/bookings', requireAuth, (req, res) => {
  const { status, date, upcoming } = req.query;
  let query = 'SELECT * FROM bookings WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }
  if (upcoming === 'true') {
    query += ' AND date >= date("now") AND status = "confirmed"';
  }

  query += ' ORDER BY date ASC, time ASC';

  db.all(query, params, (err, bookings) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({
      data: bookings,
      meta: {
        total: bookings.length,
        upcoming: bookings.filter(b => b.date >= new Date().toISOString().split('T')[0] && b.status === 'confirmed').length,
      },
    });
  });
});

// UPDATE BOOKING STATUS
app.put('/api/bookings/:id/status', requireAuth, (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'cancelled', 'completed', 'no-show'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to update' });
      res.json({ success: true, message: `Booking ${status}` });
    }
  );
});

// DELETE BOOKING
app.delete('/api/bookings/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM bookings WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to delete' });
    res.json({ success: true });
  });
});

// GET AVAILABILITY FOR DATE (with dynamic working hours)
app.get('/api/bookings/availability/:date', (req, res) => {
  const { date } = req.params;
  const { duration = 30 } = req.query;
  const dayOfWeek = new Date(date).getDay();

  // Check if day has availability override
  db.get('SELECT * FROM availability_overrides WHERE date = ?', [date], (err, override) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    // If day is marked unavailable, return empty
    if (override && !override.is_available) {
      return res.json({
        date,
        isAvailable: false,
        reason: override.reason,
        availableSlots: [],
      });
    }

    // Get working hours for this day
    db.all(
      'SELECT * FROM working_hours WHERE day_of_week = ? AND is_working = 1',
      [dayOfWeek],
      (err, workingHours) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        // Get custom available slots for this date
        db.all('SELECT * FROM available_slots WHERE date = ?', [date], (err, customSlots) => {
          if (err) return res.status(500).json({ error: 'Database error' });

          // Get blocked slots
          db.all('SELECT * FROM blocked_slots WHERE date = ?', [date], (err, blockedSlots) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            // Get booked slots
            db.all(
              'SELECT time, duration FROM bookings WHERE date = ? AND status = "confirmed"',
              [date],
              (err, bookedSlots) => {
                if (err) return res.status(500).json({ error: 'Database error' });

                // Generate all possible slots
                let allSlots = [];

                // Use custom slots if available, otherwise use working hours
                const timeRanges = customSlots.length > 0 ? customSlots : workingHours;

                timeRanges.forEach(range => {
                  const start = range.start_time.split(':');
                  const end = range.end_time.split(':');
                  const startMin = parseInt(start[0]) * 60 + parseInt(start[1]);
                  const endMin = parseInt(end[0]) * 60 + parseInt(end[1]);

                  for (let min = startMin; min < endMin; min += parseInt(duration)) {
                    if (min + parseInt(duration) <= endMin) {
                      const hour = Math.floor(min / 60);
                      const minute = min % 60;
                      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                      allSlots.push(time);
                    }
                  }
                });

                // Filter out blocked and booked slots
                const availableSlots = allSlots.filter(slot => {
                  const isBooked = bookedSlots.some(b => b.time === slot);
                  const isBlocked = blockedSlots.some(blocked => slot >= blocked.start_time && slot < blocked.end_time);
                  return !isBooked && !isBlocked;
                });

                res.json({
                  date,
                  dayOfWeek,
                  isAvailable: availableSlots.length > 0,
                  duration: parseInt(duration),
                  workingHours: timeRanges.map(r => ({ start: r.start_time, end: r.end_time })),
                  availableSlots,
                  bookedCount: bookedSlots.length,
                  blockedCount: blockedSlots.length,
                });
              }
            );
          });
        });
      }
    );
  });
});

// SET AVAILABILITY OVERRIDE (Admin)
app.post('/api/bookings/availability/override', requireAuth, (req, res) => {
  const { date, is_available, custom_hours, reason } = req.body;

  if (!date || is_available === undefined) {
    return res.status(400).json({ error: 'Date and is_available are required' });
  }

  db.run(
    `INSERT INTO availability_overrides (date, is_available, custom_hours, reason)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       is_available = excluded.is_available,
       custom_hours = excluded.custom_hours,
       reason = excluded.reason`,
    [date, is_available ? 1 : 0, custom_hours, reason],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to set override' });
      res.json({ success: true, message: 'Availability updated' });
    }
  );
});

// BLOCK TIME SLOT (Admin)
app.post('/api/bookings/block', requireAuth, (req, res) => {
  const { date, start_time, end_time, reason } = req.body;

  if (!date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Date, start_time, and end_time required' });
  }

  db.run(
    'INSERT INTO blocked_slots (date, start_time, end_time, reason) VALUES (?, ?, ?, ?)',
    [date, start_time, end_time, reason || 'Blocked by admin'],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to block slot' });
      res.status(201).json({ success: true, blockedSlotId: this.lastID });
    }
  );
});

// UNBLOCK TIME SLOT (Admin)
app.delete('/api/bookings/block/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM blocked_slots WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to unblock' });
    res.json({ success: true });
  });
});

// GET BLOCKED SLOTS FOR DATE (Admin)
app.get('/api/bookings/block/:date', requireAuth, (req, res) => {
  db.all('SELECT * FROM blocked_slots WHERE date = ?', [req.params.date], (err, slots) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ data: slots });
  });
});

// ADD AVAILABLE SLOT (Admin - custom availability)
app.post('/api/bookings/available', requireAuth, (req, res) => {
  const { date, start_time, end_time, slot_duration, notes } = req.body;

  if (!date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Date, start_time, and end_time required' });
  }

  db.run(
    'INSERT INTO available_slots (date, start_time, end_time, slot_duration, notes) VALUES (?, ?, ?, ?, ?)',
    [date, start_time, end_time, slot_duration || 30, notes],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to add slot' });
      res.status(201).json({ success: true, slotId: this.lastID });
    }
  );
});

// DELETE AVAILABLE SLOT (Admin)
app.delete('/api/bookings/available/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM available_slots WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to delete' });
    res.json({ success: true });
  });
});

// GET WORKING HOURS (Admin)
app.get('/api/bookings/working-hours', requireAuth, (req, res) => {
  db.all('SELECT * FROM working_hours ORDER BY day_of_week', [], (err, hours) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ data: hours });
  });
});

// UPDATE WORKING HOURS (Admin)
app.put('/api/bookings/working-hours/:dayOfWeek', requireAuth, (req, res) => {
  const { start_time, end_time, is_working } = req.body;

  db.run(
    'UPDATE working_hours SET start_time = ?, end_time = ?, is_working = ? WHERE day_of_week = ?',
    [start_time, end_time, is_working ? 1 : 0, req.params.dayOfWeek],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to update' });
      res.json({ success: true });
    }
  );
});

// ==================== ADMIN DASHBOARD ====================
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CMS is running with SQLite database',
    timestamp: new Date().toISOString(),
  });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ==================== START SERVER ====================
const server = app.listen(PORT, () => {
  console.log('\n🚀 Portfolio CMS Server started!');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🗄️  Database: SQLite (cms_database.db)`);
  console.log(`📂 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  console.log('✨ Ready to manage your portfolio!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, closing database and server');
  db.close();
  server.close(() => {
    console.log('✅ Server closed');
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, closing database and server');
  db.close();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;
