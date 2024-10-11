import { exec } from 'child_process';

export default function killProcessOnPort(port, callback) {
  exec(`lsof -t -i:${port}`, (err, stdout) => {
    if (err) {
      if (callback) callback(null);
      return;
    }

    if (stdout) {
      const pid = stdout.trim();
      exec(`kill -9 ${pid}`, (killErr) => {
        if (killErr) {
          console.error(`Error killing process ${pid}:`, killErr);
          if (callback) callback(killErr);
        } else {
          console.log(`Process on port ${port} successfully terminated.`);
          if (callback) callback(null);
        }
      });
    } else {
      console.log(`No process found on port ${port}.`);
      if (callback) callback(null);
    }
  });
}
