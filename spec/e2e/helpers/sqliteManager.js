import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Manages building and caching of better-sqlite3 for Electron and Node.js
export default class SqliteManager {
  constructor() {
    this.nodeModulesDir = path.join(process.cwd(), 'node_modules', 'better-sqlite3');
    this.buildDir = path.join(this.nodeModulesDir, 'build');
    this.electronBuildCache = path.join(this.nodeModulesDir, 'build-electron-cache');
    this.nodeBuildCache = path.join(this.nodeModulesDir, 'build-node-cache');
  }

  cacheCurrentBuild(target) {
    const cacheDir = target === 'electron' ? this.electronBuildCache : this.nodeBuildCache;

    // Remove existing cache directory
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }
    // Copy the current build to cache directory
    fs.cpSync(this.buildDir, cacheDir, { recursive: true });
    console.log(`✅ Cached ${target} build`);
  }

  restoreCachedBuild(target) {
    const cacheDir = target === 'electron' ? this.electronBuildCache : this.nodeBuildCache;

    if (fs.existsSync(cacheDir)) {
      if (fs.existsSync(this.buildDir)) {
        fs.rmSync(this.buildDir, { recursive: true, force: true });
      }
      fs.cpSync(cacheDir, this.buildDir, { recursive: true });
      console.log(`✅ Restored ${target} build from cache`);
      return true;
    }
    return false;
  }

  async switchToElectron() {
    console.log('Switching to Electron build...');

    // Try to restore cached Electron build
    if (!this.restoreCachedBuild('electron')) {
      // No cached build, need to rebuild
      console.log('No cached Electron build found, rebuilding...');
      execSync('npm run rebuild', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      // Cache this new build
      this.cacheCurrentBuild('electron');
    }
  }

  async switchToNode() {
    console.log('Switching to Node.js build...');

    // Try to restore cached Node.js build
    if (!this.restoreCachedBuild('node')) {
      // No cached build, need to rebuild
      console.log('No cached Node.js build found, rebuilding...');
      execSync('npm rebuild better-sqlite3', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      // Cache this new build
      this.cacheCurrentBuild('node');
    }
  }
}
