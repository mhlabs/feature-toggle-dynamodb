const LaunchDarkly = require('launchdarkly-node-server-sdk');
const DynamoDBFeatureStore = require('launchdarkly-node-server-sdk-dynamodb');

let initialized = false;
let client;

const featureToggleClient = sdkKey => {
  if (!initialized) {
    const tableName = process.env.FeatureFlagsTable || 'FeatureFlagsTable';
    const store = DynamoDBFeatureStore(tableName);
    const config = {
      featureStore: store,
      useLdd: true,
      offline: true
    };
    client = LaunchDarkly.init(sdkKey, config);

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
