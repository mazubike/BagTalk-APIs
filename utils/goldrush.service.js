// services/goldrush.service.js
const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'https://api.covalenthq.com/v1/'; // ✅ CORRECT ENDPOINT
const chainName = 'eth-mainnet';
const headers = {
    Authorization: `Bearer ${process.env.GOLDRUSH_API_KEY}`
};


const getBalances = async (address) => {
    
    const res = await axios.get(`${BASE_URL}${chainName}/address/${address}/balances_v2/`, { headers });
    
    return res.data.data.items;
};


const getTransfers = async (wallet) => {
    try {
        const url = `${BASE_URL}${chainName}/address/${wallet}/transfers_v2/?page-size=50`;
        const res = await axios.get(url, { headers, timeout: 10000 });
        return res.data.data.items;
    } catch (err) {
        console.error('Error fetching transfers:', err.message);
        return [];
    }
};


const getApprovals = async (wallet) => {
    
    const url = `${BASE_URL}${chainName}/approvals/${wallet}/`;
    const res = await axios.get(url, { headers });
    
    return res.data.data.items;
};


const getEvents = async (wallet) => {
    try {
        const url = `${BASE_URL}${chainName}/events/address/${wallet}/?page-size=50`;
        const res = await axios.get(url, { headers, timeout: 10000 });
        return res.data.data.items;
    } catch (err) {
        console.error('Error fetching events:', err.message);
        return [];
    }
};


const getWalletOverview = async (address) => {
    
    const url = `${BASE_URL}wallet/${address}`;
    const res = await axios.get(url, { headers });
    return res.data;
};

const getWalletPerformance = async (address) => {
    const res = await axios.get(`${BASE_URL}wallet/${address}/performance`, { headers });
    return res.data;
};

const getWalletTrades = async (address) => {
    const res = await axios.get(`${BASE_URL}wallet/${address}/trades`, { headers });
    return res.data;
};

const getWalletTokens = async (address) => {
    const res = await axios.get(`${BASE_URL}wallet/${address}/tokens`, { headers });
    return res.data;
};

module.exports = {
    getBalances,
    getTransfers,
    getApprovals,
    getEvents,
    // getWalletOverview,
    // getWalletPerformance,
    // getWalletTrades,
    // getWalletTokens,
};
