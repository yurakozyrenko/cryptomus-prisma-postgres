export default () => ({
  secret: process.env.SECRET_JWT,
  expireJwt: process.env.JWT_EXPIRE,
  cryptomus_api: process.env.CRYPTOMUS_API,
  cryptomus_payout_api: process.env.CRYPTOMUS_PAYOUT_API,
  cryptomus_merchant: process.env.CRYPTOMUS_MERCHANT,
});
