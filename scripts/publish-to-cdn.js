const AWS = require('aws-sdk');
const fs = require('fs/promises');
const { version } = require('../package.json');

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

const main = async () => {
  const file = await fs.readFile('./dist/index.js');

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
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});