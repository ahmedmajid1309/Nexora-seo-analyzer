import { getRedisConnection } from "../../../src/lib/jobs/queue";

getRedisConnection()
  .ping()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
