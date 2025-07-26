const { createClient } = require('graphql-ws');
const WebSocket = require('ws');

const API_KEY = 'cqt_rQdMFXgxd7wPJ9VVktwJdtwXBpBd';
const WALLET_ADDRESS = '0x00000000219ab540356cBB839Cbe05303d7705Fa';
const CHAIN_NAME = 'ETH_MAINNET';

const client = createClient({
  url: 'wss://gr-staging.streaming.covalenthq.com/graphql', // Make sure this is correct
  webSocketImpl: WebSocket,
  connectionParams: {
    Authorization: `Bearer ${API_KEY}`,
  },
  on: {
    closed: (event) => {
      console.error('❌ WebSocket closed:', event);
    },
    connected: () => {
      console.log('✅ Connected to GoldRush WebSocket API');
    },
  }
});


async function introspectTokenContractMetadataFields() {
  const introspectionQuery = `
    query {
      __type(name: "TokenContractMetadata") {
        fields {
          name
        }
      }
    }
  `;

  return new Promise((resolve, reject) => {
    client.subscribe(
      { query: introspectionQuery },
      {
        next: (result) => {
          if (result.data && result.data.__type) {
            const fields = result.data.__type.fields.map(f => f.name);
            resolve(fields);
          } else {
            reject(new Error('Failed to introspect TokenContractMetadata fields'));
          }
        },
        error: reject,
      }
    );
  });
}

async function runUpnlForWalletQuery(contractMetadataFields) {
  // Build the contract_metadata sub-selection string
  const contractMetadataSelection = contractMetadataFields.join('\n');

  const query = `
    query GetPnL {
      upnlForWallet(
        chain_name: ${CHAIN_NAME},
        wallet_address: "${WALLET_ADDRESS}"
      ) {
        cost_basis
        contract_metadata {
          ${contractMetadataSelection}
        }
        net_balance_change
        current_price
        pnl_realized_usd
        pnl_unrealized_usd
        marketcap_usd
      }
    }
  `;

  return new Promise((resolve, reject) => {
    client.subscribe(
      { query },
      {
        next: (data) => {
          console.log('📈 PnL Data:', JSON.stringify(data, null, 2));
          resolve();
          client.dispose(); // Close connection after first response
        },
        error: (err) => {
          console.error('❌ Subscription error:', err);
          reject(err);
        },
        complete: () => {
          console.log('✅ Subscription complete');
        },
      }
    );
  });
}

(async () => {
  try {
    console.log('🔍 Introspecting TokenContractMetadata fields...');
    const contractMetadataFields = await introspectTokenContractMetadataFields();
    console.log('✅ Found contract_metadata fields:', contractMetadataFields);

    console.log('🚀 Running upnlForWallet query...');
    await runUpnlForWalletQuery(contractMetadataFields);

  } catch (err) {
    console.error('🚨 Error:', err);
  }
})();
