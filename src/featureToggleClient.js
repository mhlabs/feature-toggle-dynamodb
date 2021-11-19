const LaunchDarkly = require('launchdarkly-node-server-sdk');
const { DynamoDBFeatureStore } = require('launchdarkly-node-server-sdk-dynamodb');

let initialized = false;
let client;

async function intializeLd(sdkKey) {
  const tableName = process.env.FeatureFlagsTable || 'FeatureFlagsTable';
  const store = DynamoDBFeatureStore(tableName);
  const config = {
    featureStore: store,
    useLdd: true,
    sendEvents: false
  };

  console.log('Initializing LD...');

  client = LaunchDarkly.init(sdkKey, config);
  await client.waitForInitialization();

  console.log('Initializing LD done.');

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
