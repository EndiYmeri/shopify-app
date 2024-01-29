import { Variant } from '@shopify/shopify-api/dist/rest-resources/2022-10/index.js';

export default async function getNewPrice (session, id, price, title, merchantPays) {
  console.log({ session, id, price })

  let newVariantTitle = title + ' - ' + price
  let existingVariant = null

  const allVariants = await Variant.all({
    session: session,
    product_id: id,
  });

  for (const oldVariant of allVariants) {
    // @ts-ignore
    let timeOfCreation = new Date(oldVariant.created_at)
    const timeNow = new Date()
    // @ts-ignore
    const timeDiff = (timeNow - timeOfCreation) / (1000 * 60 * 60)

    if (timeDiff > 2) {
      await Variant.delete({
        session,
        product_id: id,
        // @ts-ignore
        id: oldVariant.id
      })
    }
    else if (newVariantTitle === oldVariant.title) {
      existingVariant = oldVariant
      return existingVariant
    }
    if (timeDiff > 2) {

    }
    console.log("get new price info line 45", timeOfCreation, oldVariant.title)
  }

  const variant = new Variant({ session: session });
  variant.product_id = id;
  variant.option1 = newVariantTitle;
  variant.price = merchantPays ? "0.00" : price;
  if (merchantPays) {
    variant.compare_at_price = price
  }
  variant.inventory_policy = "continue"
  try {
    if (!existingVariant) {
      await variant.save({
        update: true,
      });
    }
    console.log("Variant:", variant, "exist Variant:", existingVariant)
    return variant || existingVariant
  }
  catch (error) {
    throw new Error(`${error.message}\n${JSON.stringify(error.response, null, 2)}`);
  }
  // return fetch(`https://${session.shop}/admin/api/2022-10/variants/${id}.json`,{
  //   method: "PUT",
  //   headers:{
  //     "Content-Type": "application/json",
  //     "X-Shopify-Access-Token": session.accessToken,
  //   },
  //   body: JSON.stringify({
  //           "variant":
  //           {
  //               "id":id,
  //               "price":price
  //           }
  //   })
  // }).then(resp => resp.json()).then(variant => console.log(variant))

}