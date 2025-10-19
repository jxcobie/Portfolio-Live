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
