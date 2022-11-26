import { exec } from 'child_process';

const supabaseCli = 'node_modules/supabase/bin/supabase';
const link = 'link';
const password = `-p  ${process.env.SUPABASE_PROJECT_DB_KEY}`;
const project = `--project-ref ${process.env.SUPABASE_PROJECT_REF}`;

exec(`${supabaseCli} ${link} ${password} ${project}`, (error, stdout, stderr) => {
  if (error || stderr) {
    console.error(error);
    console.log(stderr);
    console.log(stdout);
    process.exit(1);
  }

  console.log(stdout);
});

const setSecret = 'secrets set';
const clientSecret = `REACT_APP_YOUTUBE_CLIENT_SECRET=${process.env.REACT_APP_YOUTUBE_CLIENT_SECRET}`;

exec(`${supabaseCli} ${setSecret} ${clientSecret}`, (error, stdout, stderr) => {
  if (error || stderr) {
    console.error(error);
    console.log(stderr);
    console.log(stdout);
    process.exit(1);
  }

  console.log(stdout);
});

const clientId = `REACT_APP_YOUTUBE_CLIENT_ID=${process.env.REACT_APP_YOUTUBE_CLIENT_ID}`;

exec(`${supabaseCli} ${setSecret} ${clientId}`, (error, stdout, stderr) => {
  if (error || stderr) {
    console.error(error);
    console.log(stderr);
    console.log(stdout);
    process.exit(1);
  }

  console.log(stdout);
});

const deploy = 'deploy';
const edgeFunc = 'hello';
exec(`${supabaseCli} ${deploy} ${edgeFunc}`, (error, stdout, stderr) => {
  if (error || stderr) {
    console.error(error);
    console.log(stderr);
    console.log(stdout);
    process.exit(1);
  }

  console.log(stdout);
});
