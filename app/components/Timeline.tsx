'use client';

import React from 'react';
import GlassCard from './GlassCard';

export function Timeline() {
  return (
    <div className="max-w-6xl mx-auto">
      <GlassCard variant="default" className="min-h-96">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Timeline Playground
          </h2>
          <p className="text-text-secondary mb-6">
            This is the Timeline section where you can view your events chronologically.
          </p>
          <div className="text-left max-w-2xl mx-auto">
            <p className="text-text-secondary mb-4">
              Features coming soon:
            </p>
            <ul className="text-text-secondary space-y-2 ml-4">
              <li>• Vertical timeline with alternating cards</li>
              <li>• Date range selector</li>
              <li>• View modes (Day, Week, Month)</li>
              <li>• Custom start selector</li>
              <li>• Only shows events marked for timeline</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default Timeline; 