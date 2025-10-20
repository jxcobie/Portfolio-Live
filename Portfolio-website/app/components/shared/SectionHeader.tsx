'use client';

import React, { memo } from 'react';
import { SectionHeaderProps } from '@/app/types';
import GlitchText from './GlitchText';

const SectionHeader = memo<SectionHeaderProps>(({ tag, title, className = '' }) => (
  <header className={`section-header flex flex-col items-center gap-5 text-center ${className}`}>
    <div
      className="border-border-base/50 bg-accent/10 text-accent inline-flex items-center rounded-full border px-4 py-1 text-[11px] font-semibold tracking-[0.35em]"
      role="banner"
    >
      [{tag}]
    </div>
    <h2 className="section-title font-display text-text-primary text-4xl tracking-[0.3em] uppercase md:text-5xl">
      <GlitchText scramble>{title}</GlitchText>
    </h2>
    <div
      className="header-line via-accent shadow-glow h-0.5 w-32 rounded-full bg-gradient-to-r from-transparent to-transparent"
      aria-hidden="true"
    />
  </header>
));

SectionHeader.displayName = 'SectionHeader';

export default SectionHeader;
