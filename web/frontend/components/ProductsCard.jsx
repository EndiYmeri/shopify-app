import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Heading,
  Stack,
  Image,
  Grid,
  List,
  Link,
  Spinner,
} from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useAuthenticatedFetch } from "../hooks";
import React from "react";

let productDetails = {
  "images": [
    {
      "src": "https://i.imgur.com/DVNztgm.png"
    }
  ],
  "variants": [
    {
      "option1": "Carbon offsetting",
      "price": "0.00"
    }
  ],
}




export function ProductsCard ({ merchant, updateMerchantPlan }) {
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(false);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const fetch = useAuthenticatedFetch();
  const [productID, setProductID] = useState(null)
  const [productExists, setProductExists] = useState(false)
  const [displayCarbonOffsetting, setDisplayCarbonOffsetting] = useState(false)
  const [displayTreePlanting, setDisplayTreePlanting] = useState(false)
  const [displayDonation, setDisplayDonation] = useState(false)


  // const {
  //   data,
  //   refetch: refetchProductCount,
  //   isLoading: isLoadingCount,
  //   isRefetching: isRefetchingCount,
  // } = useAppQuery({
  //   url: "/api/shop",
  //   reactQueryOptions: {
  //     onSuccess: () => {
  //       setIsLoading(false);
  //     },
  //   },
  // });

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  useEffect(() => {
    if (productDetails.productID) {
      setProductID(productDetails.productID)
      setProductExists(true)
    } else {
      setProductID(null)
      setProductExists(false)
    }
  }, [productDetails])
  const handleCreateProduct = async () => {
    let price = "0.00"
    // if(merchant.plan.paymentOption.merchant){
    //   if(merchant?.plan?.config?.percentage){
    //   }
    //   if(merchant?.plan?.config.fixed){
    //   }
    // }
    let productTitle = ""
    let optionName = ""
    if (merchant?.plan?.planId === "CARBON-OFFSETTING-1") {
      productTitle = "Carbon-neutral order"
      // optionName = "Verified offsetting credits"
    } else if (merchant?.plan?.planId === "REFORESTATION-1") {
      productTitle = "Planet regeneration"
      // optionName = "414 trees planted"
    }
    else if (merchant?.plan?.planId === "DONATION-1") {
      productTitle = "Impact contribution"
      // optionName = "Charity donation"
    }

    const productToBeCreated = {
      // "variants" : [
      // {
      // "option1": merchant?.plan?.planId.split('-').map(word =>{
      //   word = word.toLowerCase()
      //   word = word.split('')
      //   word[0] = word[0].toUpperCase()
      //   word = word.join('')
      //   return word
      // }).join(' ').slice(0, -2),
      "title": productTitle,
      // "option1": optionName, 
      "price": price
      //   }
      // ],
    }
    // const newVariant = productToBeCreated.variants[0]
    setIsLoading(true);
    await fetch("/api/productVariant/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "productDetails": productToBeCreated,
      })
    }).then(resp => {
      if (resp.ok) {
        setToastProps({ content: "Conscious Shopping product created" });
        setIsLoading(false);
        return resp.ok && resp.json()
      } else {
        setIsLoading(false)
        setToastProps({
          content: "There was an error creating the product",
          // @ts-ignore
          error: true,
        });
      }
    }).then(data => {
      // productDetails = {...productDetails}
      updateMerchantPlan(data.product)
      setProductID(data.product.id)
      setProductExists(true)
    })
  };
  // const handleDeleteProduct = async () => {
  //   setIsLoading(true);
  //   const response = await fetch(`/api/products/${productID}`, {
  //     method: "DELETE",
  //     headers: {
  //       "Content-Type": "application/json",
  //     }
  //   });
  //   if (response.ok) {
  //     // fetch("",{
  //     //   method:"POST",
  //     // })
  //     setIsLoading(false)
  //     setToastProps({ content: "Conscious Shopping product deleted" });
  //     setProductID(null)
  //     delete productDetails.productID
  //     setProductExists(false)
  //   } else {
  //     setIsLoading(false);
  //     setToastProps({
  //       content: "There was an error deleting the product",
  //       // @ts-ignore
  //       error: true,
  //     });
  //   }
  // };

  function planIncludesCarbonOffsetting () {
    return merchant?.plan?.planId === "CARBON-OFFSETTING-1"
  }
  function planIncludesTreePlanting () {
    return merchant?.plan?.planId === "REFORESTATION-1"
  }
  function planIncludesDonation () {
    return merchant?.plan?.planId === "DONATION-1"
  }

  useEffect(() => {
    setDisplayCarbonOffsetting(planIncludesCarbonOffsetting())
    setDisplayTreePlanting(planIncludesTreePlanting())
    setDisplayDonation(planIncludesDonation())
    merchant?.plan?.products[0]?.name ? setProductExists(true) : setProductExists(false)
  }, [merchant])
  return (
    <>
      {toastMarkup}
      <Card
        sectioned
      >
        <Heading>Configure your Conscious Shopping plan</Heading>
        <p style={{ "marginBottom": "1rem" }}>Select one of our pre-configured plans in your For the Earth dashboard</p>
        <Card sectioned>
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 4, xl: 4 }} >
              <div style={{ "borderRadius": "0.5rem", "borderStyle": "solid", "borderColor": "#1BD7BB", "borderWidth": displayCarbonOffsetting ? "2px" : "0px" }}>
                <Card sectioned subdued={!displayCarbonOffsetting}>
                  <Stack vertical alignment="center" distribution="fill">
                    <div style={{ "minHeight": "450px" }}>
                      <Stack vertical spacing="loose" >
                        <Stack wrap distribution="equalSpacing" alignment="center" >
                          <Heading>
                            Carbon-neutral basket
                          </Heading>
                          {
                            displayCarbonOffsetting ?
                              productExists ?
                                <button
                                  className="button" style={{ "opacity": 0.5, "cursor": "default", "background": "#1BD7BB", color: "white", padding: "0.45rem 1.4rem", fontSize: "0.9rem", fontWeight: "bold", border: "none", borderRadius: "10px" }}>
                                  Activated
                                </button>
                                : <button
                                  onClick={() => {
                                    handleCreateProduct()
                                  }} className="button" style={{ "background": "#1BD7BB", color: "white", padding: "0.45rem 1.4rem", fontSize: "0.9rem", fontWeight: "bold", cursor: "pointer", border: "none", borderRadius: "10px" }}>
                                  {isLoading
                                    ? <Spinner size="small" />
                                    : "Activate"
                                  }
                                </button>
                              : null
                          }
                        </Stack>
                        <Image width={"100%"} source="https://i.imgur.com/4tTFaGj.png" alt={""} />
                        <List type="bullet">
                          <List.Item>Estimate the total CO2 emissions of each customer's purchase (product + shipping)</List.Item>
                          <List.Item>Offset the exact amount of emissions to make your customers' transactions carbon-neutral</List.Item>
                          <List.Item>Inform your customers about the projects during check-out to increase brand loyalty & repeat purchases</List.Item>
                        </List>
                      </Stack>
                    </div>

                  </Stack>
                </Card>
              </div>
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
              <div style={{ "borderRadius": "0.5rem", "borderStyle": "solid", "borderColor": "#1BD7BB", "borderWidth": displayTreePlanting ? "2px" : "0px" }}>
                <Card sectioned subdued={!displayTreePlanting}>
                  <Stack vertical alignment="center" distribution="equalSpacing">
                    <div style={{ "minHeight": "450px" }} >
                      <Stack vertical spacing="loose">
                        <Stack wrap={false} alignment="center" >
                          <Heading>
                            Tree planting
                          </Heading>
                          {
                            displayTreePlanting ?
                              productExists ?
                                <button
                                  className="button" style={{ "opacity": 0.5, "cursor": "default", "background": "#1BD7BB", color: "white", padding: "0.45rem 1.4rem", fontSize: "0.9rem", fontWeight: "bold", border: "none", borderRadius: "10px" }}>
                                  Activated
                                </button>
                                : <button
                                  onClick={() => {
                                    handleCreateProduct()
                                  }} className="button" style={{ "background": "#1BD7BB", color: "white", padding: "0.45rem 1.4rem", fontSize: "0.9rem", fontWeight: "bold", cursor: "pointer", border: "none", borderRadius: "10px" }}>
                                  {isLoading
                                    ? <Spinner size="small" />
                                    : "Activate"
                                  }
                                </button>
                              : null
                          }
                        </Stack>
                        <Image width={"100%"} source="https://i.imgur.com/IEx0CDL.png" alt={""} />
                        <List type="bullet">
                          <List.Item>
                            Select the number of trees that you would like to plant for each transaction in your online shop.
                            {/* <Select
                                  label="Nr of trees:"
                                  options={treeNrOptions}
                                  onChange={handleTreeNrChange}
                                  value={nrOfTrees}
                                /> */}
                          </List.Item>
                          <List.Item>Inform your customers about the projects during check-out to increase brand loyalty & repeat purchases</List.Item>
                        </List>
                      </Stack>
                    </div>
                  </Stack>
                </Card>
              </div>
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 4, xl: 4 }}>
              <div style={{ "borderRadius": "0.5rem", "borderStyle": "solid", "borderColor": "#1BD7BB", "borderWidth": displayDonation ? "2px" : "0px" }}>
                <Card sectioned subdued={!displayDonation}>
                  <Stack vertical alignment="center" distribution="equalSpacing">
                    <div style={{ "minHeight": "450px" }}>
                      <Stack vertical spacing="loose" distribution="fill" >
                        <Stack wrap={false} alignment="center" >
                          <Heading>
                            Charitable Donations
                          </Heading>
                          {
                            displayDonation ?
                              productExists ?
                                <button
                                  className="button" style={{ "opacity": 0.5, "cursor": "default", "background": "#1BD7BB", color: "white", padding: "0.45rem 1.4rem", fontSize: "0.9rem", fontWeight: "bold", border: "none", borderRadius: "10px" }}>
                                  Activated
                                </button>
                                : <button
                                  onClick={() => {
                                    handleCreateProduct()
                                  }} className="button" style={{ "background": "#1BD7BB", color: "white", padding: "0.45rem 1.4rem", fontSize: "0.9rem", fontWeight: "bold", cursor: "pointer", border: "none", borderRadius: "10px" }}>
                                  {isLoading
                                    ? <Spinner size="small" />
                                    : "Activate"
                                  }
                                </button>
                              : null
                          }
                        </Stack>
                        <Image width={"100%"} source="https://i.imgur.com/IEx0CDL.png" alt={""} />
                        <List type="bullet">
                          <List.Item>
                            Chose one of our registered charity partners to support with each transaction.
                            {/* <Select
                              label="Charity partners:"
                              options={charityPartnerOptions}
                              onChange={handleCharityChange}
                              value={charityPartner}
                            /> */}
                          </List.Item>
                          <List.Item>
                            Select the % of the basket value that you want to donate to your chosen partner
                            {/* <Select
                              label="Basket %:"
                              options={basketPercentageOptions}
                              onChange={handleBasketPercentageChange}
                              value={basketPercentage}
                            /> */}
                          </List.Item>
                        </List>
                      </Stack>
                    </div>
                    {/* <button className="button" style={{"background": "#1BD7BB", color: "white", padding: "0.5rem 2rem", fontSize:"1rem", fontWeight:"bold", cursor:"pointer", border:"none", borderRadius: "10px"}}>Activate</button> */}
                  </Stack>
                </Card>
              </div>
            </Grid.Cell>
          </Grid>

          <Card.Section>
            <Stack spacing="loose">
              <Link url="" >
                <button
                  className="button"
                  style={{ "background": "#1BD7BB", color: "white", padding: "0.5rem 2rem", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", border: "none", borderRadius: "10px" }}
                >
                  FAQs
                </button>
              </Link>
              <a
                href=""
                target={"_blank"}
              >
                <button
                  className="button"
                  style={{ "background": "#1BD7BB", color: "white", padding: "0.5rem 2rem", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", border: "none", borderRadius: "10px" }}
                >
                  Contact
                </button>
              </a>
            </Stack>
          </Card.Section>
        </Card>
      </Card>
    </>
  );
}
