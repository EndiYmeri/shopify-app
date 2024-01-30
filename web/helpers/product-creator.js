import { Shopify } from "@shopify/shopify-api";
import { SmartCollection } from "@shopify/shopify-api/dist/rest-resources/2022-10/index.js";

export default async function productCreator(session, productDetails) {
    const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);
    // let optionsArray = [productDetails.option1]

    try {
        const collections = await client.query({
            data: `query {
          collections(first: 15) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
        }`,
        });

        const existingSmartCollections = await SmartCollection.all({ session });
        console.log("SMART COLLECTIONS:", existingSmartCollections);

        // @ts-ignore
        let collectionsToLeaveArray = collections.body.data.collections.edges.map((collection) => {
            return collection.node.id;
        });
        const data = await client.query({
            data: `mutation {
          productCreate(
            input: {
              title: ${JSON.stringify(productDetails.title)},
              productType: "Donation",
              vendor: "",
              published: true,
              collectionsToJoin: [],
              collectionsToLeave: ${JSON.stringify(collectionsToLeaveArray)}
            }
            media: {
              alt: "Conscious Shopping",
              mediaContentType: IMAGE,
              originalSource: "https://cdn.shopify.com/s/files/1/0677/4567/7593/files/ForTheEarthIcon.png?v=1671548583"
            }
            ) {
            product {
              createdAt
              defaultCursor
              description
              descriptionHtml
              featuredImage {
                id
              }
              handle
              id
              onlineStorePreviewUrl
              onlineStoreUrl
              options {
                name
              }
              productType
              publishedAt
              seo {
                title
              }
              storefrontId
              tags
              templateSuffix
              title
              totalInventory
              totalVariants
              tracksInventory
              updatedAt
             
              vendor
            }
          }
        }`,
        });

        let smartCollectionAllExists = false;

        existingSmartCollections.forEach((collection) => {
            if (collection.title === "All" || collection.handle === "all") {
                smartCollectionAllExists = true;
                return;
            }
        });
        if (!smartCollectionAllExists) {
            console.log({ smartCollectionAllExists });
            const smart_collection = new SmartCollection({ session });
            smart_collection.title = "All";
            smart_collection.rules = [
                {
                    column: "title",
                    relation: "not_equals",
                    condition: "Carbon-neutral order",
                },
                {
                    column: "title",
                    relation: "not_equals",
                    condition: "Planet regeneration",
                },
                {
                    column: "title",
                    relation: "not_equals",
                    condition: "Impact contribution",
                },
            ];
            smart_collection.published = true;
            await smart_collection.save({
                update: true,
            });
        }

        // @ts-ignore
        return data.body.data.productCreate.product;
    } catch (error) {
        // if (error instanceof ShopifyErrors.GraphqlQueryError) {
        throw new Error(`${error.message}\n${JSON.stringify(error.response, null, 2)}`);
        // } else {
        // throw error;
        // }
    }
}
