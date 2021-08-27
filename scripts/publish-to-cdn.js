const AWS = require('aws-sdk');
const fs = require('fs');
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

const fileStream = fs.createReadStream('./dist/index.js');
fileStream.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

const main = async () => {
  for (const filename of filenames) {
    await s3
      .upload({
        Bucket: process.env.RUM_S3_BUCKET,
        Key: filename,
        Body: fileStream,
        CacheControl: `max-age=${MAX_AGE}`,
      })
      .promise();
  }

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
