const LaunchDarkly = require('launchdarkly-node-server-sdk');
const DynamoDBFeatureStore = require('launchdarkly-node-server-sdk-dynamodb');

let initialized = false;
let client;

const featureToggleClient = async sdkKey => {
  if (!initialized) {
    const tableName = process.env.FeatureFlagsTable || 'FeatureFlagsTable';
    const store = DynamoDBFeatureStore(tableName);
    const config = {
      featureStore: store,
      useLdd: true,
      offline: true
    };

    console.log('Initializing LD...');

    client = LaunchDarkly.init(sdkKey, config);
    await client.waitForInitialization();

    console.log('Initializing LD done.');

    initialized = true;
  }

  async function get(flagName, userKey) {
    const response = await client.variation(flagName, { key: userKey });
    return response;
  }

  return {
    get
  };
};

module.exports = {
  featureToggleClient
};
