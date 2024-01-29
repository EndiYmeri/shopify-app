import { Shopify } from "@shopify/shopify-api";
// @ts-ignore
import {Product} from '@shopify/shopify-api/dist/rest-resources/2022-10/index.js';

export default async function productCreatorRest(session, productDetails) {
  const product = new Product({session: session});
  console.log(productDetails)
  product.vendor = "Twig";
  product.product_type = "Donation";
  product.title = "Conscious shopping"
  product.published = false;
  product.images = [
    {
      "src": "https://cdn.shopify.com/s/files/1/0677/4567/7593/files/ForTheEarthIcon.png?v=1671548583"
    }
  ],
  product.price = "0.00"
  product.variants = [productDetails]
  // for(const key in productDetails){
  //   product[key] = productDetails[key]
  // }

 try{
    await product.save({
      update: true,
    });
    return product
  } catch (error) {
    throw new Error(`${error.message}\n${JSON.stringify(error.response, null, 2)}`);
  }
}
