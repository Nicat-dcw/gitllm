const { exec } = require('child_process');

function getStagedDiff() {
  return new Promise((resolve, reject) => {
    exec('git diff --cached', (err, stdout) => {
      if (err) return reject(err);
      resolve(stdout);
    });
  });
}

module.exports = { getStagedDiff };