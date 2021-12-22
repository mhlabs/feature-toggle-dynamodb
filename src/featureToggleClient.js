const LaunchDarkly = require('launchdarkly-node-server-sdk');
const {
  DynamoDBFeatureStore
} = require('launchdarkly-node-server-sdk-dynamodb');

let initialized = false;
let initializing = false;
let client;

async function intializeLd(sdkKey) {
  const tableName = process.env.FeatureFlagsTable || 'FeatureFlagsTable';
  const store = DynamoDBFeatureStore(tableName);
  const config = {
    featureStore: store,
    useLdd: true,
    sendEvents: false
  };

  if (initializing) {
    console.log('Already initializing LD, waiting 100 ms...');
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`Initialized after waiting? ${initialized}`);

    if (initialized) return;
  }

  console.log('Initializing LD...');
  initializing = true;

  client = LaunchDarkly.init(sdkKey, config);
  await client.waitForInitialization();

  console.log('Initializing LD done.');
  initializing = false;

  initialized = true;
}

const featureToggleClient = async (sdkKey = 'dummyKey') => {
  if (!initialized) {
    await intializeLd(sdkKey);
  }

  async function get(flagName, userKey) {
    const response = await client.variation(flagName, { key: userKey });
    return response;
  }

  return Promise.resolve({
    get
  });
};

module.exports = {
  featureToggleClient
};
