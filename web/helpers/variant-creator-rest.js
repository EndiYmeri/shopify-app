import { Shopify } from "@shopify/shopify-api";
import {Variant} from '@shopify/shopify-api/dist/rest-resources/2022-10/index.js';

export default async function variantCreatorRest(session, variantDetails, product_id) {
    const variant = new Variant({session});
    variant.product_id =  product_id
    variant.price = variantDetails.price
    variant.title = variant.title
    try{
        await variant.save({
        update: true,
        });
        return variant
    } catch (error) {
        throw new Error(`${error.message}\n${JSON.stringify(error.response, null, 2)}`);
    }
}
