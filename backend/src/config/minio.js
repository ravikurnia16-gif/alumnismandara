const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'manajemen-aset-minio.ltdh6w.easypanel.host',
  port: parseInt(process.env.MINIO_PORT || '443'),
  useSSL: process.env.MINIO_USE_SSL === 'true' || true,
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'password',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'smandara';

const ensureBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME);
      // Set bucket policy to public read
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      console.log(`MinIO bucket '${BUCKET_NAME}' created with public read policy.`);
    } else {
      console.log(`MinIO bucket '${BUCKET_NAME}' already exists.`);
    }
  } catch (err) {
    console.error('MinIO bucket check/create failed:', err.message);
  }
};

const uploadToMinio = (buffer, filename, mimetype) => {
  return new Promise((resolve, reject) => {
    const metaData = { 'Content-Type': mimetype };
    minioClient.putObject(BUCKET_NAME, filename, buffer, buffer.length, metaData, (err, etag) => {
      if (err) return reject(err);
      const fileUrl = `${process.env.MINIO_SERVER_URL || 'https://manajemen-aset-minio.ltdh6w.easypanel.host'}/${BUCKET_NAME}/${filename}`;
      resolve(fileUrl);
    });
  });
};

module.exports = { minioClient, BUCKET_NAME, ensureBucket, uploadToMinio };
