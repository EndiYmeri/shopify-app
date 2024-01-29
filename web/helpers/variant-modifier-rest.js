import {Variant} from '@shopify/shopify-api/dist/rest-resources/2022-10/index.js';


export default async function  variantModifierRest(session, fullVariantId, variantDetails){
    let variantId =  fullVariantId.substring(fullVariantId.lastIndexOf('/')+1)

    const variant = new Variant({session});
    console.log(variantDetails)
    variant.id = variantId;
    for(const key in variantDetails){
        variant[key] = variantDetails[key]
      } 
    try{
        await variant.save({
            update: true,
        })
        return variant
    } catch (error) {
        throw new Error(`${error.message}\n${JSON.stringify(error.response, null, 2)}`);
    }
}