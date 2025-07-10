import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import ThemeToggle from '../components/ThemeToggle';
import Link from 'next/link';

export const metadata = {
  title: 'Design System - Journaline',
  description: 'Complete glassmorphism design system documentation and color palette reference',
};

export default function ThemePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-blue-900 p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="text-center relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <GlassCard variant="strong" className="max-w-4xl mx-auto mb-8">
            <h1 className="text-6xl font-bold text-text-primary mb-4">
              Design System
            </h1>
            <p className="text-xl text-text-secondary mb-6">
              Complete glassmorphism design guidelines, color palette, and component reference
            </p>
            <div className="flex items-center justify-center gap-2 text-text-muted">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Live Documentation</span>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Always Up-to-Date</span>
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
            </div>
          </GlassCard>
        </header>

        {/* Color Palette Section */}
        <section>
          <h2 className="text-4xl font-bold text-text-primary mb-8 text-center">Color Palette</h2>
          
          {/* Primary Colors */}
          <div className="grid gap-8 mb-12">
            <GlassCard className="p-8">
              <h3 className="text-2xl font-semibold text-text-primary mb-6">Primary Colors</h3>
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Primary Blue */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-text-primary">Primary Blue</h4>
                  <p className="text-sm text-text-secondary">Main brand color for primary actions and highlights</p>
                  <div className="glass-primary h-32 rounded-xl border overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-medium text-text-on-glass mb-1">Primary Blue</div>
                        <div className="text-sm text-text-on-glass opacity-80">Live Preview</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-text-secondary font-mono">
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>Hex:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">#3B82F6</code>
                    </div>
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>RGB:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">rgb(59, 130, 246)</code>
                    </div>
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>Glass:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">rgba(59, 130, 246, 0.1)</code>
                    </div>
                  </div>
                </div>

                {/* Secondary Purple */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-text-primary">Secondary Purple</h4>
                  <p className="text-sm text-text-secondary">Secondary brand color for supporting elements</p>
                  <div className="glass-secondary h-32 rounded-xl border overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-medium text-text-on-glass mb-1">Secondary Purple</div>
                        <div className="text-sm text-text-on-glass opacity-80">Live Preview</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-text-secondary font-mono">
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>Hex:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">#8B5CF6</code>
                    </div>
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>RGB:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">rgb(139, 92, 246)</code>
                    </div>
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>Glass:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">rgba(139, 92, 246, 0.1)</code>
                    </div>
                  </div>
                </div>

                {/* Accent Pink */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-text-primary">Accent Pink</h4>
                  <p className="text-sm text-text-secondary">Accent color for special highlights and CTAs</p>
                  <div className="glass-accent h-32 rounded-xl border overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-medium text-text-on-glass mb-1">Accent Pink</div>
                        <div className="text-sm text-text-on-glass opacity-80">Live Preview</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-text-secondary font-mono">
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>Hex:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">#EC4899</code>
                    </div>
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>RGB:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">rgb(236, 72, 153)</code>
                    </div>
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>Glass:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">rgba(236, 72, 153, 0.1)</code>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Semantic Colors */}
            <GlassCard className="p-8">
              <h3 className="text-2xl font-semibold text-text-primary mb-6">Semantic Colors</h3>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                
                {/* Success Green */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-text-primary">Success Green</h4>
                  <p className="text-sm text-text-secondary">Positive actions, confirmations, completed states</p>
                  <div className="glass-success h-32 rounded-xl border overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-medium text-text-on-glass mb-1">Success</div>
                        <div className="text-sm text-text-on-glass opacity-80">✓ Completed</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-text-secondary font-mono">
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>Hex:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">#22C55E</code>
                    </div>
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>RGB:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">rgb(34, 197, 94)</code>
                    </div>
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>Glass:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">rgba(34, 197, 94, 0.1)</code>
                    </div>
                  </div>
                </div>

                {/* Warning Yellow */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-text-primary">Warning Yellow</h4>
                  <p className="text-sm text-text-secondary">Caution states, pending actions, attention needed</p>
                  <div className="glass-warning h-32 rounded-xl border overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-medium text-text-on-glass mb-1">Warning</div>
                        <div className="text-sm text-text-on-glass opacity-80">⚠ Attention</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-text-secondary font-mono">
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>Hex:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">#F59E0B</code>
                    </div>
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>RGB:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">rgb(245, 158, 11)</code>
                    </div>
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>Glass:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">rgba(245, 158, 11, 0.1)</code>
                    </div>
                  </div>
                </div>

                {/* Error Red */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-text-primary">Error Red</h4>
                  <p className="text-sm text-text-secondary">Destructive actions, errors, critical alerts</p>
                  <div className="glass-error h-32 rounded-xl border overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-medium text-text-on-glass mb-1">Error</div>
                        <div className="text-sm text-text-on-glass opacity-80">✕ Failed</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-text-secondary font-mono">
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>Hex:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">#EF4444</code>
                    </div>
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>RGB:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">rgb(239, 68, 68)</code>
                    </div>
                    <div className="flex items-center justify-between bg-surface-base px-3 py-2 rounded">
                      <span>Glass:</span>
                      <code className="bg-surface-elevated px-2 py-1 rounded">rgba(239, 68, 68, 0.1)</code>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Glass Effect Variants */}
            <GlassCard className="p-8">
              <h3 className="text-2xl font-semibold text-text-primary mb-6">Glass Effect Variants</h3>
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Glass Subtle */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-text-primary">Glass Subtle</h4>
                  <p className="text-sm text-text-secondary">5% opacity, minimal blur for backgrounds</p>
                  <div className="glass-subtle h-24 rounded-xl border overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-text-secondary font-medium">Subtle Effect</span>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary">
                    <div className="bg-surface-base px-3 py-2 rounded">
                      Usage: Background overlays, subtle accents
                    </div>
                  </div>
                </div>

                {/* Glass Default */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-text-primary">Glass Default</h4>
                  <p className="text-sm text-text-secondary">10% opacity, standard blur for cards</p>
                  <div className="glass h-24 rounded-xl border overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-text-secondary font-medium">Default Effect</span>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary">
                    <div className="bg-surface-base px-3 py-2 rounded">
                      Usage: Cards, panels, containers
                    </div>
                  </div>
                </div>

                {/* Glass Strong */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-text-primary">Glass Strong</h4>
                  <p className="text-sm text-text-secondary">20% opacity, enhanced blur for prominence</p>
                  <div className="glass-strong h-24 rounded-xl border overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-text-secondary font-medium">Strong Effect</span>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary">
                    <div className="bg-surface-base px-3 py-2 rounded">
                      Usage: Modals, hero sections, emphasis
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Component Showcase */}
        <section>
          <h2 className="text-4xl font-bold text-text-primary mb-8 text-center">Component Gallery</h2>
          
          {/* Button Variants */}
          <GlassCard className="p-8 mb-8">
            <h3 className="text-2xl font-semibold text-text-primary mb-6">Button Variants</h3>
            <div className="grid gap-8">
              <div>
                <h4 className="text-lg font-medium text-text-primary mb-4">Style Variants</h4>
                <div className="flex flex-wrap gap-4">
                  <GlassButton variant="default">Default</GlassButton>
                  <GlassButton variant="primary">Primary</GlassButton>
                  <GlassButton variant="secondary">Secondary</GlassButton>
                  <GlassButton variant="accent">Accent</GlassButton>
                  <GlassButton variant="success">Success</GlassButton>
                  <GlassButton variant="warning">Warning</GlassButton>
                  <GlassButton variant="error">Error</GlassButton>
                  <GlassButton variant="ghost">Ghost</GlassButton>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-text-primary mb-4">Size Variants</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <GlassButton size="sm" variant="primary">Small</GlassButton>
                  <GlassButton size="md" variant="primary">Medium</GlassButton>
                  <GlassButton size="lg" variant="primary">Large</GlassButton>
                  <GlassButton size="xl" variant="primary">Extra Large</GlassButton>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-text-primary mb-4">States</h4>
                <div className="flex flex-wrap gap-4">
                  <GlassButton variant="primary">Normal</GlassButton>
                  <GlassButton variant="primary" loading>Loading</GlassButton>
                  <GlassButton variant="primary" disabled>Disabled</GlassButton>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Card Variants */}
          <GlassCard className="p-8">
            <h3 className="text-2xl font-semibold text-text-primary mb-6">Card Variants</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-text-primary">Default Cards</h4>
                <GlassCard variant="subtle" className="h-32 flex items-center justify-center">
                  <span className="text-text-secondary">Subtle</span>
                </GlassCard>
                <GlassCard variant="default" className="h-32 flex items-center justify-center">
                  <span className="text-text-secondary">Default</span>
                </GlassCard>
                <GlassCard variant="strong" className="h-32 flex items-center justify-center">
                  <span className="text-text-secondary">Strong</span>
                </GlassCard>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-text-primary">Branded Cards</h4>
                <GlassCard variant="primary" className="h-32 flex items-center justify-center">
                  <span className="text-text-on-glass">Primary</span>
                </GlassCard>
                <GlassCard variant="secondary" className="h-32 flex items-center justify-center">
                  <span className="text-text-on-glass">Secondary</span>
                </GlassCard>
                <GlassCard variant="accent" className="h-32 flex items-center justify-center">
                  <span className="text-text-on-glass">Accent</span>
                </GlassCard>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-text-primary">Semantic Cards</h4>
                <GlassCard variant="success" className="h-32 flex items-center justify-center">
                  <span className="text-text-on-glass">Success</span>
                </GlassCard>
                <GlassCard variant="warning" className="h-32 flex items-center justify-center">
                  <span className="text-text-on-glass">Warning</span>
                </GlassCard>
                <GlassCard variant="error" className="h-32 flex items-center justify-center">
                  <span className="text-text-on-glass">Error</span>
                </GlassCard>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-text-primary">Interactive Examples</h4>
                <GlassCard hover className="h-32 flex items-center justify-center cursor-pointer">
                  <span className="text-text-secondary">Hover Effect</span>
                </GlassCard>
                <GlassCard hover={false} className="h-32 flex items-center justify-center">
                  <span className="text-text-secondary">No Hover</span>
                </GlassCard>
                <GlassCard className="h-32 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-glass-primary-border" tabIndex={0}>
                  <span className="text-text-secondary">Focusable</span>
                </GlassCard>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Technical Specifications */}
        <section>
          <h2 className="text-4xl font-bold text-text-primary mb-8 text-center">Technical Specifications</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <GlassCard className="p-8">
              <h3 className="text-2xl font-semibold text-text-primary mb-6">CSS Variables</h3>
              <div className="space-y-3 text-sm text-text-secondary font-mono">
                <div><code className="bg-surface-base px-2 py-1 rounded">.glass</code> - Default glass effect</div>
                <div><code className="bg-surface-base px-2 py-1 rounded">.glass-strong</code> - Enhanced glass effect</div>
                <div><code className="bg-surface-base px-2 py-1 rounded">.glass-subtle</code> - Minimal glass effect</div>
                <div><code className="bg-surface-base px-2 py-1 rounded">.glass-primary</code> - Blue-tinted glass</div>
                <div><code className="bg-surface-base px-2 py-1 rounded">.glass-secondary</code> - Purple-tinted glass</div>
                <div><code className="bg-surface-base px-2 py-1 rounded">.glass-accent</code> - Pink-tinted glass</div>
                <div><code className="bg-surface-base px-2 py-1 rounded">.glass-success</code> - Green-tinted glass</div>
                <div><code className="bg-surface-base px-2 py-1 rounded">.glass-warning</code> - Yellow-tinted glass</div>
                <div><code className="bg-surface-base px-2 py-1 rounded">.glass-error</code> - Red-tinted glass</div>
              </div>
            </GlassCard>

            <GlassCard className="p-8">
              <h3 className="text-2xl font-semibold text-text-primary mb-6">Design Tokens</h3>
              <div className="space-y-6 text-text-secondary">
                <div>
                  <h4 className="text-lg font-medium text-text-primary mb-3">Blur Values</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Small:</strong> 8px (mobile: 6px)</li>
                    <li>• <strong>Medium:</strong> 12px (mobile: 10px)</li>
                    <li>• <strong>Large:</strong> 16px (mobile: 14px)</li>
                    <li>• <strong>Extra Large:</strong> 24px (mobile: 20px)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-text-primary mb-3">Border Radius</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Small:</strong> 8px</li>
                    <li>• <strong>Medium:</strong> 12px</li>
                    <li>• <strong>Large:</strong> 16px</li>
                    <li>• <strong>Extra Large:</strong> 20px</li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section>
          <h2 className="text-4xl font-bold text-text-primary mb-8 text-center">Usage Guidelines</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <GlassCard variant="primary" className="p-8">
              <h3 className="text-2xl font-semibold text-text-on-glass mb-6">✅ Do's</h3>
              <ul className="space-y-3 text-text-on-glass">
                <li>• Use glass effects for UI chrome and overlays</li>
                <li>• Maintain consistent blur and opacity values</li>
                <li>• Ensure sufficient contrast for text readability</li>
                <li>• Test in both light and dark modes</li>
                <li>• Use semantic HTML with glass styling</li>
                <li>• Layer glass elements thoughtfully</li>
                <li>• Consider performance on lower-end devices</li>
              </ul>
            </GlassCard>

            <GlassCard variant="accent" className="p-8">
              <h3 className="text-2xl font-semibold text-text-on-glass mb-6">❌ Don'ts</h3>
              <ul className="space-y-3 text-text-on-glass">
                <li>• Overuse glass effects (causes visual noise)</li>
                <li>• Use glass on small text elements</li>
                <li>• Stack too many transparent layers</li>
                <li>• Ignore accessibility requirements</li>
                <li>• Mix glassmorphism with other design languages</li>
                <li>• Use glass effects without backdrop blur</li>
                <li>• Forget to test on different backgrounds</li>
              </ul>
            </GlassCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12">
          <GlassCard variant="subtle" className="inline-block mb-4">
            <p className="text-text-muted">
              Design System v1.0 • Built with Glassmorphism • Always Evolving
            </p>
          </GlassCard>
          <div className="flex justify-center gap-4">
            <GlassButton variant="ghost" size="sm">
              📥 Download Guidelines
            </GlassButton>
            <GlassButton variant="ghost" size="sm">
              📖 View Source Code
            </GlassButton>
            <Link href="/">
              <GlassButton variant="primary" size="sm">
                ← Back to App
              </GlassButton>
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
} 