// utils/alphaScore.js
function calculateAlphaScore(data) {
    const roi = data.performance?.roi ?? 0;
    const ROI_CAP = 2000;
    const roiScore = Math.min(100, Math.max(0, 100 * (roi / ROI_CAP)));

    const winRate = data.performance?.winRate ?? 0;
    const winRateScore = winRate * 100;

    const entryBlock = data.trades?.[0]?.blockNumber ?? 0;
    const launchBlock = data.tokenLaunchBlock ?? entryBlock + 500;
    const maxBlocksAfterLaunch = 1000;
    const earlyEntryScore = Math.max(
        0,
        100 * (1 - (entryBlock - launchBlock) / maxBlocksAfterLaunch)
    );

    const totalTokens = data.tokens?.length ?? 0;
    const rugTokens = data.tokens?.filter(token =>
        data.rugTokenList?.includes(token.tokenAddress.toLowerCase())
    ).length ?? 0;

    const rugRatio = totalTokens === 0 ? 0 : rugTokens / totalTokens;
    const rugScore = 100 * (1 - rugRatio);

    const drawdownRecoveryScore = 90; // Static for now

    const btcROI = data.btcROI ?? 100;
    const walletROI = roi;
    const outperformanceScore = Math.max(
        0,
        Math.min(100, 50 + 50 * ((walletROI - btcROI) / Math.abs(btcROI || 1)))
    );

    const sharpe = walletROI / (data.performance?.pnlVolatility || 1);
    const minSharpe = 0;
    const maxSharpe = 3;
    const sharpeScore = Math.max(
        0,
        Math.min(100, (100 * (sharpe - minSharpe)) / (maxSharpe - minSharpe))
    );

    const stableTokens = data.tokens?.filter(token =>
        token.symbol?.toLowerCase().includes('usdt') ||
        token.symbol?.toLowerCase().includes('usdc') ||
        token.symbol?.toLowerCase().includes('dai')
    ) ?? [];

    const stableValue = stableTokens.reduce((sum, t) => sum + (t.valueUsd || 0), 0);
    const totalValue = data.tokens?.reduce((sum, t) => sum + (t.valueUsd || 0), 0) || 1;
    const stableRatio = stableValue / totalValue;

    let stableScore = 0;
    if (stableRatio >= 0.2 && stableRatio <= 0.4) stableScore = 100;
    else if (stableRatio === 0 || stableRatio === 1) stableScore = 0;
    else stableScore = 50;

    const tradeCount = data.trades?.length ?? 0;
    let frequencyScore = 0;
    if (tradeCount === 0) frequencyScore = 0;
    else if (tradeCount <= 5) frequencyScore = 30;
    else if (tradeCount <= 100) frequencyScore = 80;
    else frequencyScore = 50;

    const finalAlphaScore =
        0.25 * roiScore +
        0.15 * winRateScore +
        0.15 * earlyEntryScore +
        0.10 * rugScore +
        0.10 * drawdownRecoveryScore +
        0.10 * outperformanceScore +
        0.10 * sharpeScore +
        0.05 * stableScore;

    return Math.round(finalAlphaScore);
}

module.exports = { calculateAlphaScore };
