import Redis from 'ioredis';
import RedisStore from 'connect-redis';

let redisClient;

try {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Connected to Redis successfully');
  });
} catch (err) {
  console.error('Failed to create Redis client:', err);
}

const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'myapp:',
});

export { redisClient, redisStore };