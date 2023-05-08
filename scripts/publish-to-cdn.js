// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require('aws-sdk');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs/promises');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json');

const CHANGELOG_URL =
  'https://github.com/SumoLogic/sumologic-opentelemetry-js/blob/master/CHANGELOG.md';
const RUM_CDN_URL = 'https://rum.sumologic.com';

const getFileNames = () => {
  const res = (paths) => ({
    script: paths,
    sourcemap: paths.map((path) => `${path}.map`),
  });

  const uriVersion = encodeURIComponent(version);
  const [major, minor, patch] = uriVersion.split('.');

  if (!Number.isInteger(Number(patch))) {
    return res([`sumologic-rum-v${uriVersion}.js`]);
  }

  return res([
    `sumologic-rum-v${uriVersion}.js`,
    `sumologic-rum-v${major}.${minor}.js`,
    `sumologic-rum-v${major}.js`,
    `sumologic-rum.js`,
  ]);
};

const MAX_AGE = 5 * 60 * 60; // 5 hours

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const cloudfront = new AWS.CloudFront({ apiVersion: '2020-05-31' });

const postMessageToSlack = (filenames) => {
  const hashVersion = version.replace(/\./g, '');

  console.log('Sending a message to Slack');

  return axios.post(process.env.SLACK_WEBHOOK_TRACING_RELEASES, {
    blocks: [
      `:tada: *The RUM script v.${version} has been released!* :tada:`,
      `The following files have been uploaded to AWS S3:\n${filenames
        .map((file) => `- <${RUM_CDN_URL}/${file}|${file}>`)
        .join('\n')}`,
      `Check what has changed in the <${CHANGELOG_URL}#${hashVersion}|CHANGELOG>.`,
    ].map((message) => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: message,
      },
    })),
  });
};

const uploadFileToCDN = (filename, file) => {
  console.log(`Uploading ${filename} to CDN`);

  return s3
    .upload({
      Bucket: process.env.RUM_S3_BUCKET,
      Key: filename,
      Body: file,
      CacheControl: `max-age=${MAX_AGE}`,
      ContentType: 'application/javascript',
    })
    .promise();
};

const invalidateKeyInCDN = (filenames) => {
  console.log('Invalidating keys in CDN');

  return cloudfront
    .createInvalidation({
      DistributionId: process.env.RUM_CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: String(Date.now()),
        Paths: {
          Quantity: filenames.length,
          Items: filenames.map((filename) => `/${filename}`),
        },
      },
    })
    .promise();
};

const main = async () => {
  const filenames = getFileNames();

  const scriptFile = await fs.readFile('./dist/browser.js');
  const sourcemapFile = await fs.readFile('./dist/browser.js.map');

  for (const filename of filenames.script) {
    await uploadFileToCDN(filename, scriptFile);
  }
  for (const filename of filenames.sourcemap) {
    await uploadFileToCDN(filename, sourcemapFile);
  }

  const allFilenames = [...filenames.script, ...filenames.sourcemap].sort();

  await invalidateKeyInCDN(allFilenames);

  // await postMessageToSlack(allFilenames);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
