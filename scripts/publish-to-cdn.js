const AWS = require('aws-sdk');
const fs = require('fs/promises');
const fetch = require('node-fetch');
const { version } = require('../package.json');

const CHANGELOG_URL =
  'https://github.com/SumoLogic/sumologic-opentelemetry-js/blob/master/CHANGELOG.md';
const RUM_CDN_URL = 'https://rum.sumologic.com';

const getFileNames = () => {
  const uriVersion = encodeURIComponent(version);
  const [major, minor, patch] = uriVersion.split('.');
  if (!Number.isInteger(Number(patch))) {
    return [`sumologic-rum-v${uriVersion}.js`];
  }

  return [
    `sumologic-rum-v${uriVersion}.js`,
    `sumologic-rum-v${major}.${minor}.js`,
    `sumologic-rum-v${major}.js`,
    `sumologic-rum.js`,
  ];
};

const MAX_AGE = 5 * 60 * 60; // 5 hours

const filenames = getFileNames();
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const cloudfront = new AWS.CloudFront({ apiVersion: '2020-05-31' });

const postMessageToSlack = () => {
  const hashVersion = version.replace(/\./g, '');

  return fetch(process.env.SLACK_WEBHOOK_TRACING_RELEASES, {
    method: 'POST',
    body: JSON.stringify({
      blocks: [
        `:tada: *The RUM script v.${version} has been released!* :tada:`,
        `The following files have been uploaded to S3:\n${filenames
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
    }),
    credentials: 'omit',
  });
};

const main = async () => {
  const file = await fs.readFile('./dist/browser.js');

  for (const filename of filenames) {
    console.log(`Upload ${filename}`);
    await s3
      .upload({
        Bucket: process.env.RUM_S3_BUCKET,
        Key: filename,
        Body: file,
        CacheControl: `max-age=${MAX_AGE}`,
        ContentType: 'application/javascript',
      })
      .promise();
  }

  console.log('Invalidate files');
  await cloudfront
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

  console.log('sending a message to slack');
  await postMessageToSlack();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
