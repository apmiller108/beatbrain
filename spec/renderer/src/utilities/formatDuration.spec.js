import { describe, it, expect } from 'vitest';
import { formatDuration } from '@renderer/utilities/formatDuration';

describe('formatDuration', () => {
  it('returns N/A if seconds is not provided', () => {
    expect(formatDuration(null)).toBe('N/A');
    expect(formatDuration(undefined)).toBe('N/A');
    expect(formatDuration(0)).toBe('N/A');
  });

  it('formats seconds only if duration is less than a minute', () => {
    expect(formatDuration(45)).toBe('45s');
  });

  it('formats minutes and seconds if duration is less than an hour', () => {
    expect(formatDuration(125)).toBe('2m 5s');
    expect(formatDuration(60)).toBe('1m 0s');
    expect(formatDuration(3599)).toBe('59m 59s');
  });

  it('formats hours and minutes if duration is one hour or more', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
    expect(formatDuration(3661)).toBe('1h 1m');
    expect(formatDuration(7200)).toBe('2h 0m');
    expect(formatDuration(7380)).toBe('2h 3m');
  });
});
