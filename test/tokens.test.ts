import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('tokens.css design tokens', () => {
  const tokensPath = path.resolve(__dirname, '../src/styles/tokens.css');

  it('exists on disk', () => {
    expect(fs.existsSync(tokensPath)).toBe(true);
  });

  it('defines all required semantic tokens and valid properties', () => {
    const css = fs.readFileSync(tokensPath, 'utf-8');

    const requiredTokens = [
      '--bg-primary',
      '--bg-surface',
      '--bg-card',
      '--bg-card-hover',
      '--bg-overlay',
      '--bg-kraft',
      '--bg-cardboard',
      '--tape-bg',
      '--tape-border',
      '--tape-shadow',
      '--shadow-cardboard',
      '--shadow-paper-layer',
      '--paper-ink',
      '--neon-cyan',
      '--neon-pink',
      '--neon-yellow',
      '--neon-green',
      '--neon-purple',
      '--glow-cyan',
      '--glow-pink',
      '--glow-yellow',
      '--font-display',
      '--font-mono',
      '--font-sans',
      '--font-handwriting',
      '--font-sketch',
      '--text-xs',
      '--text-sm',
      '--text-base',
      '--text-lg',
      '--text-xl',
      '--text-2xl',
      '--text-3xl',
      '--border-subtle',
      '--border-accent',
      '--border-pink',
      '--border-dashed',
      '--radius-sm',
      '--radius-md',
      '--radius-lg',
      '--radius-full',
    ];

    for (const token of requiredTokens) {
      expect(css).toContain(token);
    }
  });

  it('contains valid root declaration block', () => {
    const css = fs.readFileSync(tokensPath, 'utf-8');
    expect(css).toMatch(/:root\s*\{[\s\S]*\}/);
  });
});
