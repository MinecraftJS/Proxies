const { createInterface } = require('node:readline');
const { stdin, stdout } = require('node:process');
const { spawnSync } = require('node:child_process');
const { peerDependencies } = require('../package.json');

const interface = createInterface({ input: stdin, output: stdout });

interface.question(
  'Are you planning on using an InterceptableProxy? (y/n) ',
  (answer) => {
    interface.close();

    const answers = ['y', 'yes', '1'];
    if (!answers.includes(answer.toLocaleLowerCase())) return;

    const toInstall = Object.keys(peerDependencies).map(
      (dep) => dep + '@' + peerDependencies[dep]
    );

    const args = ['install', ...toInstall];
    try {
      spawnSync('npm', args, {
        cwd: process.cwd(),
        shell: true,
        stdio: 'ignore',
      });
      console.log(
        `Successfuly installed ${toInstall.length} peer dependency-ies.`
      );
    } catch (error) {
      console.error(error);
      console.log('An error occured while installing peer dependencies');
      process.exit(0);
    }
  }
);
