'use strict';
import express from 'express';
import mongoose from 'mongoose';
import portfolio from '../models/portfolio';
import transaction from '../models/security_transaction';
import Redis from 'ioredis';

let router = express.Router();

//caching data
const redis = new Redis(6379, '127.0.0.1');

redis.on('error', (error) => {
  console.log('Redis error', error);
});

//CREATING NEW SECURITIES IN A PORFOLIO
router.post ('/createSecurity', async (req, res) => {

try {

  let { ticker, avg_buy_price, shares } = req.body;

  let security = await portfolio.create(req.body);

  //DROPPING STALE CACHE
  await redis.del('portfolio_data');

  //TRANSACTION ENTRY
  await transaction.create({
    transaction_detail : `ADDED NEW ${ticker} SECURITY`,
    ticker,
    shares,
    price : avg_buy_price,
    status : 'SUCCESS'
  });
  
  console.log("New security entered in a portfolio", security);

  res.send('Success, New security entered in a portfolio');

} catch (error) {
  console.log("error",error);
  res.send(error).status(400);
}

});

//FETCHING PORTFOLIO AND ITS SECURITIES
router.get('/portfolio', async (_req, res) => {

  try {
    
    let portfolio = await fetchPortfolio();

    res.send(portfolio);

  } catch (error) {
    console.log("The error", error);
    res.send(error).status(400);
  }
});

const fetchPortfolio = async () => {

  let data = await redis.get(`portfolio_data`);

  if(!data) {

    let response = await portfolio.find({});
  
    await redis.set(`portfolio_data`, JSON.stringify(response), 'EX', 10 * 10);
    
    console.log("Portfolio data cached!");

    return response;

  } else return JSON.parse(data);

};

//PLACING A TRADE
router.post('/placeTrade', async (req, res) => {

  let { ticker, buy_price, new_shares } = req.body;

  try {
    
    let trade = await updateTrade({ ticker, buy_price, new_shares });

    if(trade) res.send('Successfully placed a trade in the security');

    else res.send('Kindly try placing the trade again!');

  } catch (error) {

    console.log(error);

    //TRANSACTION ENTRY
    await transaction.create({
      transaction_detail : `FAILED TO PURCHASE ${ticker} SECURITY`,
      ticker,
      shares : new_shares,
      price : buy_price,
      status : 'FAILED'
    });

    res.send(error).status(400);
  }
});

const updateTrade = async ({ ticker, buy_price, new_shares }) => {

  let data = await portfolio.find({ ticker });
  data = data[0];

  if(!data) throw `You don't own any security for ${ticker} company. Kindly buy new security for ${ticker}!`;

  let { avg_buy_price, shares } = data;

  avg_buy_price = +(((avg_buy_price * shares) + (buy_price * new_shares))/(shares + new_shares)).toFixed(2);
  shares += new_shares;

  await portfolio.update({ ticker },  { $set : { avg_buy_price, shares }});

  //DROPPING STALE CACHE
  await redis.del('portfolio_data');

  //TRANSACTION ENTRY
  await transaction.create({
    transaction_detail : `PURCHASED NEW ${ticker} SHARES`,
    ticker,
    shares : new_shares,
    price : buy_price,
    status : 'SUCCESS'
  });

  return true;
};

//SELLING TRADES AND FETCHING CUMULATIVE RETURNS
router.post('/sellTrade', async (req, res) => {

  let { ticker, selling_shares } = req.body;

  try {
    
    let trade = await sellTrade({ ticker, selling_shares });

    let { shares, result } = trade;

    res.send(`After selling ${selling_shares} shares of ${ticker}, You have ${shares} shares left and your cumulative return of the portfolio is ₹${result}`);

  } catch (error) {

    console.log(error);

     //TRANSACTION ENTRY
     await transaction.create({
      transaction_detail : `FAILED TO SELL ${ticker} SECURITY.`,
      ticker,
      shares : selling_shares,
      status : 'FAILED'
    });

    res.send(error).status(400);
  }
});

const sellTrade = async ({ ticker, selling_shares }) => {

  let data = await portfolio.find({ ticker });
  data = data[0];

  if(!data) throw `You don't own any security for ${ticker} company!`;

  let { avg_buy_price, shares } = data;

  shares -= selling_shares;

  if(shares < 0) throw `You don't have enough ${ticker} shares left. The quantity of a stock should always be positive`;

  await portfolio.update({ ticker },  { $set : { shares }});

  //DROPPING STALE CACHE
  await redis.del('portfolio_data');

  //TRANSACTION ENTRY
  await transaction.create({
    transaction_detail : `SOLD ${ticker} SHARES`,
    ticker,
    shares : selling_shares,
    price : avg_buy_price,
    status : 'SUCCESS'
  });

  let portfolio_data = await fetchPortfolio();
  
  let result = await Promise.all(portfolio_data.map(r => cumulativeReturns(r)));

  result = +(result.reduce((sum, result) => sum + result, 0)).toFixed(2);

  return { shares, result };
};

const cumulativeReturns = (final_value) => {
  
  let { avg_buy_price, shares } = final_value;
  let current_price = 1500, sum = 0; //SETTING CURRENT PRICE TO RS 1500.

  sum += ((current_price - avg_buy_price) * shares);

  return sum;
};


router.get('/cumulative', async (_req, res) => {

  try {
    
    let portfolio_data = await fetchPortfolio();

    let data = await Promise.all(portfolio_data.map(r => cumulativeReturns(r)));
    
    data = +(data.reduce((sum, data) => sum + data, 0)).toFixed(2);

    res.send({'Cumulative return success': data});

  } catch (error) {
    console.log(error);
    res.send(error).status(400);
  }

});

router.get('/holdings', async (_req, res) => {

  try {
    
    let data = await portfolio.aggregate([{ $match : {}}, { $group : { _id : "Portfolio", total_shares : { $sum : "$shares" }, total_share_value : { $sum : "$avg_buy_price"} }}]);;
    data = data[0];
    
    let { _id, total_shares, total_share_value } = data;

    res.send({
      _id,
      total_shares,
      total_share_value
    });

  } catch (error) {
    console.log(error);
    res.send(error).status(400);
  }

});

module.exports = router;
