const goldrush = require('../../utils/goldrush.service');
const { calculateAlphaScore } = require('../../utils/alphaScore');


// Example dummy rug token list
const rugTokenList = [
  '0x000000000000000000000000000000000000dead',
  '0x111111111111111111111111111111111111rug'
];

exports.calculateScore = async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress;

    const [result, performance, trades, tokens] = await Promise.all([
      goldrush.getTokenBalance(walletAddress),
      // goldrush.getWalletOverview(walletAddress),
      // goldrush.getWalletPerformance(walletAddress),
      // goldrush.getWalletTrades(walletAddress),
      // goldrush.getWalletTokens(walletAddress)
    ]);
    
    res.json({
      result
    });
    // const scoreInput = {
    //     performance,
    //     trades,
    //     tokens,
    //     rugTokenList,
    //     btcROI: 100,
    //     tokenLaunchBlock: 18000000
    // };

    // const alphaScore = calculateAlphaScore(scoreInput);
    // const tier = alphaScore >= 72 ? 'Tier 1 (Skilled)' : alphaScore >= 58 ? 'Tier 2 (Competent)' : 'Tier 3 (Unskilled)';

    // res.json({
    //     wallet: walletAddress,
    //     alphaScore,
    //     tier,
    //     breakdown: scoreInput
    // });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to calculate alpha score' });
  }
};




const apiKey = 'cqt_rQdMFXgxd7wPJ9VVktwJdtwXBpBd';
const walletAd = '0x00000000219ab540356cBB839Cbe05303d7705Fa';
const options = {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${apiKey}`  // ✅ Fix: Must use "Bearer" prefix
  }
};


// exports.getFullInfo = async (req, res, next) => {
//   const CHAIN_ID = 1;
//   // Ideally use process.env.COVALENT_API_KEY
//   let address = '0x89fba1d1b5a0750ddbb1894ac4db6ba0615e5669' //Our
//   address = '0x00000000219ab540356cBB839Cbe05303d7705Fa' // Ethmainnet
//   // address = '0xF977814e90dA44bFA03b6295A0616a897441aceC' //Focet testnet
//   const ROI_CAP = 2000; // Normalize extreme values
//   try {
//     const response = await fetch(
//       // `https://api.covalenthq.com/v1/address/${address}/activity/`,
//       // `https://api.covalenthq.com/v1/${CHAIN_ID}/address/${address}/transactions_summary/`,
//       `https://api.covalenthq.com/v1/1/address/${address}/portfolio_v2/`,
//       options
//     );
//     console.log('Response:', response)
//     const result = await response.json();
//     console.log('result:', result)
//     if (!response.ok) {
//       return res.status(response.status).json({
//         status: response.status,
//         message: result.error_message || 'Failed to fetch data',
//       });
//     }
//     

//     // return res.status(200).json({
//     //   status: 200,
//     //   message: 'Fetched successfully',
//     //   data: result.data || result,  // ✅ Return relevant data only
//     // });

//     const items = result?.data?.items || [];

//     let totalInvested = 0;
//     let totalCurrent = 0;

//     for (const token of items) {
//       const holdings = token.holdings;

//       if (holdings?.length >= 2) {
//         const first = holdings[holdings.length - 1]; // Oldest = cost basis
//         const last = holdings[0]; // Latest = current value

//         const invested = first?.close?.quote || 0;
//         const current = last?.close?.quote || 0;

//         totalInvested += invested;
//         totalCurrent += current;
//       }
//     }

//     const unrealizedGain = totalCurrent - totalInvested;
//     const realizedGain = 0; // Not available in this endpoint

//     const roi = totalInvested > 0 ? ((unrealizedGain + realizedGain) / totalInvested) * 100 : 0;
//     const roiScore = Math.min(100, Math.max(0, (roi / ROI_CAP) * 100));

//     return res.status(200).json({
//       status: 200,
//       message: 'ROI calculated successfully',
//       data: {
//         investedCapital: totalInvested.toFixed(2),
//         currentValue: totalCurrent.toFixed(2),
//         unrealizedGains: unrealizedGain.toFixed(2),
//         realizedGains: realizedGain.toFixed(2),
//         roi: roi.toFixed(2),
//         roiScore: roiScore.toFixed(2),
//       },
//     });

//   } catch (error) {
//     console.error('Error fetching:', error);
//     return res.status(500).json({
//       status: 500,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

const { getBalances, getTransfers, getApprovals, getEvents } = require('../../utils/goldrush.service');

exports.getFullInfo = async (req, res) => {
  
  const WALLET = req.body.address || null;
  
  try {
    const balances = await getBalances(WALLET);
    const transfers = await getTransfers(WALLET);
    const approvals = await getApprovals(WALLET);
    const events = await getEvents(WALLET);
    

    console.log({ balances, transfers, approvals, events });
    return req.json({
        message:'Data Fetched.'
    })
    // TODO: Compute ROI, win rate, drawdown, etc.
  } catch (err) {
    console.error(err.message);
  }
}

// Perfect
exports.runQl = async (req, res) => {

  const query = `
        query {
          ohlcvCandlesForPair(
            chain_name: BASE_MAINNET
            pair_address: "0x9c087Eb773291e50CF6c6a90ef0F4500e349B903"
            interval: ONE_MINUTE
            timeframe: ONE_HOUR
          ) {
            open
            high
            low
            close
            timestamp
          }
        }
      `;

  try {
    const response = await fetch('https://gr-staging.streaming.covalenthq.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ query }),
    });

    const json = await response.json();

    if (!response.ok || json.errors) {
      return res.status(500).json({
        status: 500,
        message: 'GraphQL error',
        error: json.errors || json,
      });
    }

    
    // for (const item of json.data.ohlcvCandlesForPair) {
    //   
    // }

    res.status(200).json({
      status: 200,
      message: 'Candles fetched successfully',
      data: json.data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: 'Failed to fetch OHLCV data',
      error: error.message
    });
  }
};




// // Security best practice - don't hardcode sensitive values
// const COVALENT_API_KEY = process.env.COVALENT_API_KEY || 'cqt_rQdMFXgxd7wPJ9VVktwJdtwXBpBd';
// const DEFAULT_WALLET = '0x00000000219ab540356cBB839Cbe05303d7705Fa';

// exports.runQl = async (req, res) => {
//   try {
//     const { wallet = DEFAULT_WALLET, network = 'eth' } = req.body || {}; // Changed to 'ethereum'

//     // Corrected GraphQL query
//     const query = `
//       query GetBuyTransactions($wallet: String!, $network: Network!) {
//   EVM(dataset: combined, network: $network) {
//     buys: DEXTrades(
//       where: {Trade: {Buy: {Buyer: {is: $wallet}}}}
//     ) {
//       Trade {
//         Buy {
//           Amount
//           Currency {
//             Symbol
//             SmartContract
//           }
//           Buyer
//           Price
//         }
//         Transaction {
//           Fee
//         }
//       }
//     }
//   }
// }
//     `;

//     // Using main Covalent API endpoint instead of staging
//     const response = await fetch('https://gr-staging.streaming.covalenthq.com/graphql/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${COVALENT_API_KEY}`
//       },
//       body: JSON.stringify({
//         query,
//         variables: {
//           wallet,
//           network: network.toLowerCase() // Ensure lowercase
//         }
//       }),
//     });

//     const json = await response.json();

//     if (!response.ok || json.errors) {
//       console.error('Covalent API Error:', json.errors);
//       return res.status(500).json({
//         error: 'API request failed',
//         details: json.errors
//       });
//     }
//     for (item in data.items) {
//       
//     }
//     res.json({
//       status: 200,
//       data: json.data?.DEXTrades || []
//     });

//   } catch (error) {
//     console.error('Server Error:', error);
//     res.status(500).json({
//       error: 'Internal server error',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// }






// Full ROI

const API_KEY = process.env.COVALENT_API_KEY; // cqt_...
const CHAIN = 'eth-mainnet'; // or customize via env
const WALLET = '0x00000000219ab540356cBB839Cbe05303d7705Fa';
const ROI_CAP = 2000; // normalization cap

// 1. Fetch portfolio_v2 (Unrealized gains & cost basis)
async function fetchPortfolio(wallet_address) {
  
  const url = `https://api.covalenthq.com/v1/1/address/${wallet_address}/portfolio_v2/`;
  const res = await fetch(url, options);
  const json = await res.json();
  return json.data?.items || [];
}

// 2. Async Generator to paginate transactions_v3
async function* fetchAllTransactions(chain_name, wallet_address) {
  
  let page = 0;
  const MAX_PAGES = 5; // set higher later

  // while (page < MAX_PAGES) {
  const url = `https://api.covalenthq.com/v1/${chain_name}/address/${wallet_address}/transactions_v3/`;
  const res = await fetch(url, options);
  
  if (!res.ok) return;

  const json = await res.json();
  const items = json.data?.items || [];
  if (items.length === 0) return;

  yield* items;
  page += 1;
  // }
}

exports.getROI = async (req, res) => {
  
  try {
    
    // A. Fetch unrealized gains
    const items = await fetchPortfolio(req.body.wallet_address);
    let invested = 0, current = 0;

    items.forEach(token => {
      const h = token?.holdings || [];
      if (h.length >= 2) {
        const cost = h[h.length - 1]?.close?.quote || 0;
        const curr = h[0]?.close?.quote || 0;
        invested += cost;
        current += curr;
      }
    });

    const unrealized = current - invested;

    // B. Calculate realized gains using FIFO
    const lots = {}; // Map: contract_address → array of buy lots
    let realized = 0;

    for await (const tx of fetchAllTransactions(req.body.chain_name, req.body.wallet_address)) {
      (tx.transfers || []).forEach(xfer => {
        const addr = xfer.contract_address?.toLowerCase();
        const delta = BigInt(xfer.delta);
        const usd = Number(xfer.value_quote || 0);

        if (!addr || usd === 0) return;

        if (delta > 0n) {
          lots[addr] ??= [];
          lots[addr].push({ remaining: delta, cost: usd });
        } else if (delta < 0n) {
          let sellAmount = -delta;
          let proceeds = usd;
          let cost = 0;

          const queue = lots[addr] || [];
          while (sellAmount > 0n && queue.length) {
            const lot = queue[0];
            const used = sellAmount < lot.remaining ? sellAmount : lot.remaining;
            const ratio = Number(used) / Number(lot.remaining);
            cost += lot.cost * ratio;
            lot.remaining -= used;
            if (lot.remaining === 0n) queue.shift();
            sellAmount -= used;
          }

          realized += proceeds - cost;
        }
      });
    }

    // C. ROI + Score
    const totalGain = realized + unrealized;
    const roi = invested > 0 ? (totalGain / invested) * 100 : 0;
    const roiScore = Math.min(100, Math.max(0, (roi / ROI_CAP) * 100));
    
    // D. Return response
    return res.status(200).json({
      investedCapital: invested.toFixed(2),
      currentValue: current.toFixed(2),
      unrealizedGains: unrealized.toFixed(2),
      realizedGains: realized.toFixed(2),
      roi: roi.toFixed(2),
      roiScore: roiScore.toFixed(2),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


async function fetchTransfers() {
  let all = [];
  let page = 0;

  while (true) {
    const url = `https://api.covalenthq.com/v1/${CHAIN}/address/${WALLET}/transfers_v2/`;
    
    const res = await fetch(url, options);
    const json = await res.json();
    const items = json.data?.items || [];
    if (!items.length) break;
    all = all.concat(items);
    page++;
  }
  return all;
}

exports.getWinRate = async (req, res) => {
  
  const transfers = await fetchTransfers();
  
  const lots = {};
  let wins = 0, total = 0;

  for (const t of transfers) {
    const addr = t.contract_address.toLowerCase();
    const amount = BigInt(t.delta);
    const value = Number(t.quote_usd);
    const type = t.transfer_type;

    if (!addr || value === 0) continue;

    if (type === 'IN') {
      lots[addr] = lots[addr] || [];
      lots[addr].push({ remaining: amount, cost: value });
    }
    else if (type === 'OUT') {
      let sell = amount;
      let proceeds = value;
      let cost = 0;

      const queue = lots[addr] || [];
      while (sell > 0n && queue.length) {
        const lot = queue[0];
        const used = sell < lot.remaining ? sell : lot.remaining;
        const ratio = Number(used) / Number(lot.remaining);
        cost += lot.cost * ratio;
        lot.remaining -= used;
        if (lot.remaining === 0n) queue.shift();
        sell -= used;
      }

      total++;
      if (proceeds > cost) wins++;
    }
  }

  const winRate = total > 0 ? wins / total : 0;
  const score = Math.round(winRate * 100);

  res.json({
    totalTrades: total,
    winningTrades: wins,
    winRate: +(winRate.toFixed(2)),
    winRateScore: score
  });
}
