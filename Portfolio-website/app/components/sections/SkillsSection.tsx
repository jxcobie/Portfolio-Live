'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { SkillCategory } from '@/app/types';
import SectionHeader from '../shared/SectionHeader';
import CircuitTrace from '../shared/CircuitTrace';

// Skills data
const skillCategories: SkillCategory[] = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    color: 'cyan',
  },
  {
    id: 'backend',
    title: 'Backend Development',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'REST APIs'],
    color: 'orange',
  },
  {
    id: 'automation',
    title: 'Automation & Integration',
    skills: ['n8n Workflows', 'API Integration', 'Webhooks', 'Data Processing'],
    color: 'purple',
  },
  {
    id: 'tools',
    title: 'Tools & Technologies',
    skills: ['Git', 'Docker', 'AWS', 'Vercel'],
    color: 'green',
  },
];

// Individual Skill Card Component
interface SkillCardProps {
  category: SkillCategory;
  index: number;
}

const SkillCard = memo<SkillCardProps>(({ category, index }) => (
  <motion.div
    id={category.id}
    className={`skill-card ${category.color}`}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    viewport={{ once: true }}
    role="group"
    aria-labelledby={`skill-${category.id}-title`}
  >
    <div className="skill-header">
      <span className="skill-icon" aria-hidden="true">
        ◈
      </span>
      <h3 id={`skill-${category.id}-title`}>{category.title}</h3>
    </div>

    <div className="skill-list" role="list">
      {category.skills.map((skill, skillIndex) => (
        <span key={skillIndex} className="skill-tag" role="listitem">
          {skill}
        </span>
      ))}
    </div>

    <div className="skill-footer">
      <span className="status-text" aria-label={`${category.title} status: active`}>
        [STATUS: ACTIVE]
      </span>
    </div>
  </motion.div>
));

SkillCard.displayName = 'SkillCard';

// Skills Grid Component
const SkillsGrid = memo(() => (
  <div className="skills-grid">
    {skillCategories.map((category, index) => (
      <SkillCard key={category.id} category={category} index={index} />
    ))}
  </div>
));

SkillsGrid.displayName = 'SkillsGrid';

// Circuit Traces Component
const CircuitTraces = memo(() => (
  <div aria-hidden="true">
    <CircuitTrace startElement="frontend" endElement="backend" delay={0.5} />
    <CircuitTrace startElement="backend" endElement="automation" delay={1} />
    <CircuitTrace startElement="automation" endElement="tools" delay={1.5} />
  </div>
));

CircuitTraces.displayName = 'CircuitTraces';

// Main Skills Section Component
const SkillsSection = memo(() => {
  return (
    <section id="skills" className="content-section" role="region" aria-labelledby="skills-heading">
      <SectionHeader tag="TECH_STACK" title="SKILLS & EXPERTISE" />

      <div className="skills-container">
        {/* Circuit traces connecting skill cards */}
        <CircuitTraces />

        {/* Skills grid */}
        <SkillsGrid />
      </div>
    </section>
  );
});

SkillsSection.displayName = 'SkillsSection';

export default SkillsSection;
