import Shopify from "shopify-api-node";

const shopify = new Shopify({
    shopName: '{shop-name}',
    apiKey: '{your-api-key}',
    password: '{your-api-password}',
    autoLimit: true,
    presentmentPrices: true
  });