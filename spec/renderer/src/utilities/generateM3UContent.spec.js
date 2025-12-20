import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateM3UContent } from '@renderer/utilities/generateM3UContent';

describe('generateM3UContent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const date = new Date('2025-12-20T12:00:00Z');
    vi.setSystemTime(date);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates a valid M3U file content with tracks', () => {
    const playlist = {
      name: 'Test Playlist',
      tracks: [
        {
          duration: 300.5,
          artist: 'Artist A',
          title: 'Track A',
          file_path: '/path/to/trackA.mp3'
        },
        {
          duration: 120,
          artist: 'Artist B',
          title: 'Track B',
          file_path: '/path/to/trackB.mp3'
        }
      ]
    };

    const content = generateM3UContent(playlist);

    expect(content).toContain('#EXTM3U');
    expect(content).toContain('# Playlist: Test Playlist');
    expect(content).toContain('# Generated: 2025-12-20T12:00:00.000Z');
    expect(content).toContain('# Tracks: 2');

    // Check first track
    // Duration is rounded: 300.5 -> 301
    expect(content).toContain('#EXTINF:301,Artist A - Track A');
    expect(content).toContain('/path/to/trackA.mp3');

    // Check second track
    expect(content).toContain('#EXTINF:120,Artist B - Track B');
    expect(content).toContain('/path/to/trackB.mp3');

    // Check general structure (newlines)
    const lines = content.split('\n');
    expect(lines[0]).toBe('#EXTM3U');
    expect(lines).toContain('/path/to/trackA.mp3');
    expect(lines).toContain('/path/to/trackB.mp3');
  });

  it('throws an error if tracks array is empty', () => {
    const playlist = {
      name: 'Empty Playlist',
      tracks: []
    };

    expect(() => generateM3UContent(playlist)).toThrow('Tracks array is required and must not be empty');
  });

  it('handles missing metadata by using defaults', () => {
    const playlist = {
      name: 'Minimal Playlist',
      tracks: [
        {
          file_path: '/path/to/minimal.mp3'
          // duration, artist, title missing
        }
      ]
    };

    const content = generateM3UContent(playlist);

    expect(content).toContain('#EXTINF:0,Unknown Artist - Unknown Title');
    expect(content).toContain('/path/to/minimal.mp3');
  });
});
