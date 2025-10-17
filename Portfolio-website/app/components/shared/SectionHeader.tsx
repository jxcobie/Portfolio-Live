'use client';

import React, { memo } from 'react';
import { SectionHeaderProps } from '@/app/types';
import GlitchText from './GlitchText';

const SectionHeader = memo<SectionHeaderProps>(({ tag, title, className = '' }) => {
  return (
    <header className={`section-header ${className}`}>
      <div className="header-tag" role="banner">
        [{tag}]
      </div>
      <h2 className="section-title">
        <GlitchText scramble>{title}</GlitchText>
      </h2>
      <div className="header-line" aria-hidden="true"></div>
    </header>
  );
});

SectionHeader.displayName = 'SectionHeader';

export default SectionHeader;
