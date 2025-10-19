const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Create or connect to database
const db = new sqlite3.Database(path.join(__dirname, '..', 'cms_database.db'));

console.log('🔧 Initializing database...');

// Sample projects data
const sampleProjects = [
  {
    title: 'E-Commerce Automation Suite',
    slug: 'ecommerce-automation-suite',
    description:
      'A comprehensive full-stack e-commerce platform with automated inventory management, dynamic pricing, and advanced analytics.',
    short_description: 'Full-stack platform with automated inventory and order processing.',
    status: 'Deployed',
    category: 'Web Application',
    client: 'TechMart Solutions',
    duration: '6 months',
    role: 'Full-Stack Lead Developer',
    team_size: 4,
    live_url: 'https://ecommerce-demo.example.com',
    repo_url: 'https://github.com/yourusername/ecommerce-suite',
    featured: 1,
    overview:
      '<p>Developed a cutting-edge e-commerce platform that revolutionizes online retail through intelligent automation and data-driven decision making.</p>',
    challenge:
      '<p>The client needed a solution that could handle 100,000+ SKUs, process thousands of orders daily, and automatically adjust pricing based on market conditions.</p>',
    solution:
      '<p>Built a microservices architecture using Next.js for the frontend and Node.js for backend services, integrated with n8n for workflow automation.</p>',
    process:
      '<p>Implemented agile methodology with 2-week sprints, continuous integration/deployment, and comprehensive testing at every stage.</p>',
    results:
      '<p>Achieved 80% reduction in manual processing time, 35% increase in conversion rates, and 99.9% uptime since deployment.</p>',
    technical_details:
      '<p>Stack includes Next.js 14, PostgreSQL, Redis for caching, n8n for automation, and deployed on AWS with auto-scaling.</p>',
    lessons_learned:
      '<p>The importance of building scalable architecture from day one and investing in comprehensive monitoring and alerting systems.</p>',
  },
  {
    title: 'AI-Powered CRM Platform',
    slug: 'ai-crm-platform',
    description:
      'Custom CRM solution with machine learning capabilities for lead scoring, customer segmentation, and predictive analytics.',
    short_description: 'Intelligent CRM with automated lead scoring and predictive analytics.',
    status: 'Active',
    category: 'SaaS Platform',
    client: 'SalesForce Pro',
    duration: '4 months',
    role: 'Lead Developer',
    team_size: 3,
    live_url: 'https://crm-demo.example.com',
    repo_url: 'https://github.com/yourusername/ai-crm',
    featured: 1,
    overview:
      '<p>Revolutionary CRM platform that leverages artificial intelligence to provide unprecedented insights into customer behavior and sales opportunities.</p>',
    challenge:
      '<p>Traditional CRMs were failing to provide actionable insights from the vast amounts of customer data being collected.</p>',
    solution:
      '<p>Integrated machine learning models for predictive lead scoring and automated customer segmentation based on behavior patterns.</p>',
    results:
      '<p>45% improvement in lead conversion rates and 60% reduction in time spent on manual data entry and analysis.</p>',
  },
  {
    title: 'Real-Time Analytics Dashboard',
    slug: 'analytics-dashboard',
    description:
      'High-performance dashboard for real-time data visualization and business intelligence reporting.',
    short_description: 'Real-time data visualization and business intelligence platform.',
    status: 'Deployed',
    category: 'Data Visualization',
    client: 'DataInsight Corp',
    duration: '3 months',
    role: 'Frontend Specialist',
    team_size: 2,
    live_url: 'https://analytics-demo.example.com',
    featured: 0,
    overview:
      '<p>Built a comprehensive analytics platform capable of processing and visualizing millions of data points in real-time.</p>',
    challenge:
      '<p>The client needed to monitor multiple data streams simultaneously and make instant decisions based on complex metrics.</p>',
    solution:
      '<p>Implemented WebSocket connections for real-time updates, with D3.js and Chart.js for interactive visualizations.</p>',
    results:
      '<p>Reduced decision-making time by 70% and improved operational efficiency by 40% through instant access to key metrics.</p>',
  },
];

// Sample technologies
const sampleTechnologies = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Docker',
  'AWS',
  'Vercel',
  'Tailwind CSS',
  'Framer Motion',
  'GraphQL',
  'REST API',
  'n8n',
  'Python',
  'Django',
  'Vue.js',
  'Svelte',
  'Firebase',
  'Supabase',
  'Prisma',
  'Socket.io',
  'D3.js',
  'Chart.js',
  'Three.js',
  'WebGL',
  'Git',
];

// Initialize database
db.serialize(() => {
  console.log('📊 Creating tables...');

  // Create all tables (same as in server.js)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

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
    overview TEXT,
    challenge TEXT,
    solution TEXT,
    process TEXT,
    results TEXT,
    testimonial TEXT,
    lessons_learned TEXT,
    technical_details TEXT,
    performance_improvement TEXT,
    user_growth TEXT,
    revenue_impact TEXT,
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT,
    project_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

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

  db.run(`CREATE TABLE IF NOT EXISTS technologies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    icon_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS project_technologies (
    project_id INTEGER,
    technology_id INTEGER,
    PRIMARY KEY (project_id, technology_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (technology_id) REFERENCES technologies(id) ON DELETE CASCADE
  )`);

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

  // Affiliate Links table
  db.run(`CREATE TABLE IF NOT EXISTS affiliate_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    original_url TEXT NOT NULL,
    short_code TEXT UNIQUE NOT NULL,
    category TEXT,
    platform TEXT,
    commission_rate DECIMAL(5,2),
    total_clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Affiliate Click Tracking table
  db.run(`CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    country TEXT,
    device_type TEXT,
    clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    converted BOOLEAN DEFAULT 0,
    conversion_value DECIMAL(10,2),
    FOREIGN KEY (link_id) REFERENCES affiliate_links(id)
  )`);

  // Affiliate Performance table (daily aggregates)
  db.run(`CREATE TABLE IF NOT EXISTS affiliate_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER NOT NULL,
    date DATE NOT NULL,
    clicks INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    ctr DECIMAL(5,2),
    FOREIGN KEY (link_id) REFERENCES affiliate_links(id),
    UNIQUE(link_id, date)
  )`);

  console.log('✅ Tables created successfully');

  // Insert admin user
  console.log('👤 Creating admin user...');
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(
    `INSERT OR REPLACE INTO users (username, password, role) VALUES (?, ?, ?)`,
    ['admin', adminPassword, 'admin'],
    (err) => {
      if (err) {
        console.error('Error creating admin user:', err);
      } else {
        console.log('✅ Admin user created (username: admin, password: admin123)');
      }
    }
  );

  // Insert technologies
  console.log('🔧 Adding technologies...');
  const techStmt = db.prepare(`INSERT OR IGNORE INTO technologies (name, category) VALUES (?, ?)`);
  sampleTechnologies.forEach((tech) => {
    techStmt.run(tech, 'General');
  });
  techStmt.finalize();
  console.log('✅ Technologies added');

  // Insert sample projects
  console.log('📁 Adding sample projects...');
  sampleProjects.forEach((project, index) => {
    db.run(
      `INSERT INTO projects (
        title, slug, description, short_description, status, category,
        client, duration, role, team_size, live_url, repo_url,
        featured, sort_order, overview, challenge, solution, process,
        results, technical_details, lessons_learned
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project.title,
        project.slug,
        project.description,
        project.short_description,
        project.status,
        project.category,
        project.client,
        project.duration,
        project.role,
        project.team_size,
        project.live_url,
        project.repo_url,
        project.featured,
        index,
        project.overview,
        project.challenge,
        project.solution,
        project.process || '',
        project.results,
        project.technical_details || '',
        project.lessons_learned || '',
      ],
      function (err) {
        if (err) {
          console.error('Error inserting project:', err);
        } else {
          const projectId = this.lastID;

          // Add sample image
          db.run(
            `INSERT INTO project_images (project_id, image_url, image_type, alt_text) VALUES (?, ?, ?, ?)`,
            [projectId, `/uploads/project-${projectId}.jpg`, 'cover', project.title]
          );

          // Add technologies (randomly assign 3-5 techs)
          const techCount = Math.floor(Math.random() * 3) + 3;
          const shuffled = [...Array(sampleTechnologies.length).keys()].sort(
            () => 0.5 - Math.random()
          );

          for (let i = 0; i < techCount; i++) {
            db.run(`INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)`, [
              projectId,
              shuffled[i] + 1,
            ]);
          }
        }
      }
    );
  });

  console.log('✅ Sample projects added');

  // Add sample messages
  console.log('💬 Adding sample messages...');
  const sampleMessages = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Interested in your services',
      message:
        "Hi, I saw your portfolio and I'm impressed with your work. I have a project that I'd like to discuss with you. Could we schedule a call?",
    },
    {
      name: 'Sarah Smith',
      email: 'sarah@company.com',
      subject: 'Partnership Opportunity',
      message:
        "We're looking for a talented developer to join our team on a contract basis. Your experience with automation and full-stack development is exactly what we need.",
    },
    {
      name: 'Mike Johnson',
      email: 'mike@startup.io',
      subject: 'Quick Question',
      message:
        "Love your work! I'm particularly interested in the e-commerce automation project. What technologies did you use for the real-time inventory management?",
    },
  ];

  const msgStmt = db.prepare(
    `INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)`
  );

  sampleMessages.forEach((msg) => {
    msgStmt.run(msg.name, msg.email, msg.subject, msg.message);
  });
  msgStmt.finalize();
  console.log('✅ Sample messages added');

  // Add sample analytics
  console.log('📊 Adding sample analytics...');
  const events = [
    { type: 'page_view', page: '/', data: '{}' },
    { type: 'page_view', page: '/projects', data: '{}' },
    { type: 'project_view', page: '/projects/1', data: '{"projectId": 1}' },
    { type: 'contact_form_view', page: '/contact', data: '{}' },
  ];

  const analyticsStmt = db.prepare(
    `INSERT INTO analytics (event_type, page_url, event_data) VALUES (?, ?, ?)`
  );

  // Add some events for the last 7 days
  const now = new Date();
  for (let days = 0; days < 7; days++) {
    const date = new Date(now);
    date.setDate(date.getDate() - days);

    // Random number of events per day
    const eventCount = Math.floor(Math.random() * 20) + 10;

    for (let i = 0; i < eventCount; i++) {
      const event = events[Math.floor(Math.random() * events.length)];
      analyticsStmt.run(event.type, event.page, event.data);
    }
  }
  analyticsStmt.finalize();
  console.log('✅ Sample analytics added');

  console.log('\n🎉 Database initialization complete!');
  console.log('📌 You can now start the CMS server with: npm start');
  console.log('🔐 Login credentials: admin / admin123');
});

// Close database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('✅ Database connection closed');
  }
});
