const mongoose = require("mongoose");
const redis = require("redis");
const { promisify } = require("util");
const execFn = mongoose.Query.prototype.exec;

const redisUrl = process.env.REDIS_URL;
const redisClient = redis.createClient(redisUrl);
redisClient.hget = promisify(redisClient.hget);

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key) || "";
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return await execFn.apply(this, arguments);
  }

  const cacheKey = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  const cachedValue = await redisClient.hget(this.hashKey, cacheKey);

  if (cachedValue) {
    const doc = JSON.parse(cachedValue);
    if (Array.isArray(doc)) {
      return doc.map((d) => new this.model(d));
    } else {
      return new this.model(doc);
    }
  }

  const result = await execFn.apply(this, arguments);

  redisClient.hset(this.hashKey, cacheKey, JSON.stringify(result));

  return result;
};

module.exports = {
  clearCache(cacheKey) {
    redisClient.del(JSON.stringify(cacheKey));
  },
};
