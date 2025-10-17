'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TimelineItem } from '@/app/types';
import SectionHeader from '../shared/SectionHeader';

// Timeline data
const timelineData: TimelineItem[] = [
  {
    id: '1',
    year: '2022 - Present',
    title: 'Full-Stack Developer & Automation Expert',
    description: 'Building scalable web applications and automation workflows',
  },
  {
    id: '2',
    year: '2020 - 2022',
    title: 'Software Development Intern at Deus Media Group',
    description: 'Gained experience in full-stack development and project management',
  },
  {
    id: '3',
    year: '2018',
    title: 'Deployed first react project',
    description: 'Started journey into modern web development',
  },
];

// Skills data
const skillsData = {
  frontend: {
    title: 'Frontend',
    skills: ['React & Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
  },
  backend: {
    title: 'Backend',
    skills: ['Node.js & Python', 'PostgreSQL & MongoDB', 'REST APIs & GraphQL'],
  },
  automation: {
    title: 'Automation',
    skills: ['n8n (Advanced)', 'API Integration', 'Custom Scripting'],
  },
  devops: {
    title: 'DevOps & Tools',
    skills: ['Git & Docker', 'AWS & Vercel', 'Figma'],
  },
};

// Profile Card Component
const ProfileCard = memo(() => (
  <motion.div
    className="about-card glowing-border"
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true, amount: 0.3 }}
  >
    <h3>WHO AM I?</h3>
    <p>
      I&apos;m <strong>Jacob Jaballah</strong>, a passionate Full-Stack Developer and n8n Automation
      Expert based in <strong>Sepang, Selangor, Malaysia</strong>. With a knack for transforming
      intricate problems into <strong>elegant digital solutions</strong>, I thrive on building
      robust, scalable applications and automating complex workflows to boost efficiency and
      innovation.
    </p>
  </motion.div>
));

ProfileCard.displayName = 'ProfileCard';

// Terminal Component
const TerminalWindow = memo(() => (
  <motion.div
    className="terminal-window glowing-border"
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    viewport={{ once: true, amount: 0.3 }}
    role="complementary"
    aria-label="Developer terminal output"
  >
    <div className="terminal-header">
      <div className="terminal-buttons">
        <span className="term-btn red" aria-hidden="true"></span>
        <span className="term-btn yellow" aria-hidden="true"></span>
        <span className="term-btn green" aria-hidden="true"></span>
      </div>
      <span className="terminal-title">jacob@portfolio:~</span>
    </div>
    <div className="terminal-content">
      <p className="terminal-line">&gt; Initializing developer profile...</p>
      <p className="terminal-output">
        A passionate <span className="highlight-green">full-stack developer</span> and{' '}
        <span className="highlight-orange">n8n automation specialist</span> who transforms complex
        problems into elegant digital solutions.
      </p>
      <p className="terminal-line">
        &gt; Ready to build the future, one line of code at a time.
        <span className="terminal-cursor">_</span>
      </p>
    </div>
  </motion.div>
));

TerminalWindow.displayName = 'TerminalWindow';

// Stats Component
const StatsContainer = memo(() => (
  <motion.div
    className="stats-container"
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true, amount: 0.3 }}
  >
    <div className="stat-box glowing-border" role="group" aria-label="Projects deployed">
      <span className="stat-number">20+</span>
      <span className="stat-label">PROJECTS DEPLOYED</span>
    </div>
    <div className="stat-box glowing-border" role="group" aria-label="Workflows automated">
      <span className="stat-number">20+</span>
      <span className="stat-label">WORKFLOWS AUTOMATED</span>
    </div>
  </motion.div>
));

StatsContainer.displayName = 'StatsContainer';

// Expertise Card Component
const ExpertiseCard = memo(() => (
  <motion.div
    className="about-card glowing-border"
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    viewport={{ once: true, amount: 0.3 }}
  >
    <h3>MY EXPERTISE</h3>
    <div className="expertise-grid">
      {Object.entries(skillsData).map(([key, skill]) => (
        <div key={key} className="skill-category">
          <h4>{skill.title}</h4>
          <ul>
            {skill.skills.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </motion.div>
));

ExpertiseCard.displayName = 'ExpertiseCard';

// Timeline Component
const Timeline = memo(() => (
  <motion.div
    className="timeline-section"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    viewport={{ once: true, amount: 0.2 }}
    role="region"
    aria-label="Professional timeline"
  >
    <h3 className="timeline-title">MY JOURNEY</h3>
    <div className="timeline-container">
      {/* Central Line */}
      <div className="timeline-line" aria-hidden="true"></div>

      {timelineData.map((item, index) => (
        <motion.div
          key={item.id}
          className="timeline-item"
          initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          viewport={{ once: true }}
        >
          <div className="timeline-content glowing-border">
            <h4>{item.year}</h4>
            <p>
              <strong>{item.title}</strong>
            </p>
            <p className="timeline-description">{item.description}</p>
          </div>
          <div className="timeline-dot" aria-hidden="true"></div>
        </motion.div>
      ))}
    </div>
  </motion.div>
));

Timeline.displayName = 'Timeline';

// Main About Section Component
const AboutSection = memo(() => {
  return (
    <section id="about" className="about-section" role="region" aria-labelledby="about-heading">
      <SectionHeader tag="PROFILE_DATA" title="ABOUT ME" />

      <div className="about-content-grid">
        {/* Left Column: Who Am I? & Terminal Text */}
        <div className="about-column">
          <ProfileCard />
          <TerminalWindow />
        </div>

        {/* Right Column: Stats & Skills */}
        <div className="about-column">
          <StatsContainer />
          <ExpertiseCard />
        </div>
      </div>

      {/* My Journey (Timeline) */}
      <Timeline />
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;
