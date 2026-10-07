const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const SNIPPETS_DIR =
  process.env.NGINX_SNIPPETS_DIR ||
  path.join(__dirname, "../nginx-snippets");

const LOG_DIR =
  process.env.NGINX_LOG_DIR ||
  path.join(__dirname, "../nginx-logs");

function writeLocationBlock({
  companySlug,
  divisionSlug,
  usernameSlug,
  projectSlug,
  targetDir,
}) {
  fs.mkdirSync(SNIPPETS_DIR, { recursive: true });
  fs.mkdirSync(LOG_DIR, { recursive: true });

  const confName =
    `${companySlug}-${divisionSlug}-${usernameSlug}-${projectSlug}`;

  const confPath = path.join(
    SNIPPETS_DIR,
    `${confName}.conf`
  );

  const logPath = path.join(
    LOG_DIR,
    `${confName}-ppt.log`
  );

  const block = `location ^~ /ppt/${companySlug}/${divisionSlug}/${usernameSlug}/${projectSlug}/ {
    alias ${targetDir}/;
    index index.html;
    try_files $uri $uri/ =404;
    access_log ${logPath};
}
`;

  fs.writeFileSync(confPath, block, "utf8");

  console.log(
    "Nginx config created:",
    confPath
  );

  return confPath;
}

function reloadNginx() {
  return new Promise((resolve, reject) => {

    execFile(
      "sudo",
      ["nginx", "-t"],
      (testError, stdout, stderr) => {

        if (testError) {
          console.error(
            "❌ Nginx config test failed:",
            stderr || testError.message
          );

          return reject(testError);
        }

        console.log(
          "✅ Nginx config test successful"
        );

        execFile(
          "sudo",
          ["systemctl", "reload", "nginx"],
          (reloadError, reloadStdout, reloadStderr) => {

            if (reloadError) {
              console.error(
                "❌ Nginx reload failed:",
                reloadStderr || reloadError.message
              );

              return reject(reloadError);
            }

            console.log(
              "✅ Nginx reloaded successfully"
            );

            resolve();
          }
        );
      }
    );
  });
}

module.exports = {
  writeLocationBlock,
  reloadNginx,
};