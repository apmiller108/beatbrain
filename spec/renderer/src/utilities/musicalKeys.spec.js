import { describe, it, expect } from 'vitest';
import { toCamelot, toTraditional, formatKey } from '@renderer/utilities/musicalKeys';

describe('musicalKeys utility', () => {
  describe('toCamelot', () => {
    it('converts traditional keys to Camelot', () => {
      expect(toCamelot('Am')).toBe('8A');
      expect(toCamelot('Amin')).toBe('8A');
      expect(toCamelot('Gmaj')).toBe('9B');
      expect(toCamelot('Emin')).toBe('9A');
    });

    it('handles already formatted keys with both notations', () => {
      expect(toCamelot('8A (Am)')).toBe('8A');
      expect(toCamelot('1B (B)')).toBe('1B');
    });

    it('returns the same key if it is unknown', () => {
      expect(toCamelot('UnknownKey')).toBe('UnknownKey');
    });

    it('returns null/undefined as is', () => {
      expect(toCamelot(null)).toBe(null);
      expect(toCamelot(undefined)).toBe(undefined);
    });
  });

  describe('toTraditional', () => {
    it('converts keys to standardized traditional notation', () => {
      expect(toTraditional('8A')).toBe('Am');
      expect(toTraditional('8B')).toBe('C');
      expect(toTraditional('1A')).toBe('G#m');
    });

    it('handles already formatted keys', () => {
      expect(toTraditional('8A (Am)')).toBe('Am');
    });
  });

  describe('formatKey', () => {
    it('returns the key based on the notation preference', () => {
      const key = 'Am';
      expect(formatKey(key, 'camelot')).toBe('8A');
      expect(formatKey(key, 'traditional')).toBe('Am');
      expect(formatKey(key, 'original')).toBe('Am');
    });

    it('returns original key if notation is unknown', () => {
      expect(formatKey('Am', 'foo')).toBe('Am');
    });

    it('returns null/undefined as is', () => {
      expect(formatKey(null, 'camelot')).toBe(null);
    });
  });
});
