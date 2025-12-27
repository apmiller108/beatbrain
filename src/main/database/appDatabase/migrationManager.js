// migrations/MigrationManager.js
export default class MigrationManager {
  constructor(appDatabase) {
    this.appDatabase = appDatabase
    this.migrations = []
  }

  initialize() {
    // Create migrations tracking table
    this.appDatabase.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)
  }

  register(migrations) {
    this.migrations.push(...migrations)
    return this
  }

  getCurrentVersion() {
    const result = this.appDatabase
      .prepare('SELECT MAX(version) as version FROM schema_migrations')
      .get()
    return result.version || 0
  }

  async runMigrations() {
    this.initialize()
    const currentVersion = this.getCurrentVersion()

    // Sort migrations by version
    const pendingMigrations = this.migrations
      .filter(m => m.version > currentVersion)
      .sort((a, b) => a.version - b.version)

    if (pendingMigrations.length === 0) {
      console.log('Database schema is up to date')
      return
    }

    console.log(`Running ${pendingMigrations.length} pending migration(s)...`)

    for (const migration of pendingMigrations) {
      try {
        console.log(`Applying migration ${migration.version}: ${migration.name}`)

        this.appDatabase.exec('BEGIN TRANSACTION')

        migration.up(this.appDatabase)

        this.appDatabase
          .prepare('INSERT INTO schema_migrations (version, name) VALUES (?, ?)')
          .run(migration.version, migration.name)

        this.appDatabase.exec('COMMIT')

        console.log(`✓ Migration ${migration.version} applied successfully`)
      } catch (error) {
        this.appDatabase.exec('ROLLBACK')
        console.error(`✗ Migration ${migration.version} failed:`, error)
        throw new Error(`Migration ${migration.version} failed: ${error.message}`)
      }
    }
  }

  async rollback(targetVersion = null) {
    const currentVersion = this.getCurrentVersion()
    const target = targetVersion || currentVersion - 1

    const migrationsToRollback = this.migrations
      .filter(m => m.version > target && m.version <= currentVersion)
      .sort((a, b) => b.version - a.version) // Reverse order

    for (const migration of migrationsToRollback) {
      try {
        console.log(`Rolling back migration ${migration.version}: ${migration.name}`)

        this.appDatabase.exec('BEGIN TRANSACTION')

        if (migration.down) {
          migration.down(this.appDatabase)
        }

        this.appDatabase
          .prepare('DELETE FROM schema_migrations WHERE version = ?')
          .run(migration.version)

        this.appDatabase.exec('COMMIT')

        console.log(`✓ Migration ${migration.version} rolled back`)
      } catch (error) {
        this.appDatabase.exec('ROLLBACK')
        console.error(`✗ Rollback ${migration.version} failed:`, error)
        throw error
      }
    }
  }
}
