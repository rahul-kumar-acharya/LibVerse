import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from '../Button';

describe('Button Component', () => {
  it('renders button with children text', () => {
    render(<Button>Test Text</Button>);
    const btn = screen.getByText('Test Text');
    expect(btn).toBeInTheDocument();
  });

  it('applies standard primary styles when no variant is supplied', () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-primary-brown');
  });

  it('applies secondary styles when variant is secondary', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-light-beige');
  });
});
