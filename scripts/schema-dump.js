import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

function exportSchema() {
  const userDataPath = app.getPath('userData');
  console.log(`Application Data Path: ${userDataPath}`);

  const projectRootPath = process.cwd();
  console.log(`Project Root Path: ${projectRootPath}`);

  const dbFilePath = path.join(userDataPath, 'beatbrain.sqlite');
  const outputFilePath = path.join(projectRootPath, 'structure.sql');

  if (!fs.existsSync(dbFilePath)) {
    console.error(`Error: Sqlite database not found at ${dbFilePath}`);
    app.quit();
    return;
  }

  const command = `sqlite3 "${dbFilePath}" ".schema" > "${outputFilePath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Execution error: ${error}`);
      app.quit();
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    console.log(`Database schema successfully written to ${outputFilePath}`);
    app.quit();
  });
}

app.setName('beatbrain');
app.on('ready', exportSchema);
