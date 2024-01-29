import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ProductsCard } from "../components";
import { useEffect } from "react";
import { useState } from "react";
import { useAuthenticatedFetch } from "../hooks";
import React from "react";

export default function HomePage() {
  const [merchant, setMerchant] = useState()
  const authFetch = useAuthenticatedFetch()
  const [shopUrl, setShopUrl] = useState()
  const [shopId, setShopId] = useState()

  useEffect( ()=>{
    authFetch('/api/get-session-shop').then(resp => resp.json()).then(info => {
      setShopUrl(info.shop[0].myshopify_domain)
      setShopId(info.shop[0].id)
    })
    
  },[])

  async function updateMerchantPlan(product){
    if(merchant){
      const payload = {
        "products":[
          {	    
            "id": product.id,
            "type": product.type,
            "name": product.title,
            "price": product.price
          }
        ]
       }
      // @ts-ignore
      await fetch(`https://fortheearth-api.cartediem.org/api/v1/merchant/config/products/${merchant.merchantId}`,{
        method:"POST",
        headers:{
          "Content-Type": "application/json"
        },
        body:JSON.stringify(payload)
      }).then(resp => resp.json()).then(data => data)
    }
  }

  useEffect( ()=>{
    if(shopId){
      fetch(`https://fortheearth-api.cartediem.org/api/v1/merchant/config/${shopId}`)
      .then( resp => resp.json())
      .then( merchantInfo => setMerchant(merchantInfo))
    }
  },[shopId])

  const handleRedirect = () => {
    // fetch('https://fortheearth-api.cartediem.org/api/v1/merchant',{
    //   method: "POST",
    //   headers: { 
    //     "Content-Type": "application/json"
    //   },
    //   body:JSON.stringify({
    //     merchantId: shopId,
    //     website: shop
    //   })
    // }).then(resp => resp.json()).then(data => {  
    //   if(data.merchantId){
    //     window.open(`https://b2badminportal.cartediem.org/conscious-shopping/${data.merchantId}`,'_blank')
    //   }
    // })
  }

  return (
    <Page fullWidth >
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack alignment="center">
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Heading><strong>Set up For the Earth account</strong></Heading>
                  <p style={{"fontSize": "1.2rem", "lineHeight": "1.2", "marginBottom":"1rem"}} >To activate the Conscious Shopping feature, configure your custom plan in the For the Earth dashboard</p>
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <Link url={`https://app.fortheearthbytwig.co.uk/conscious-shopping/${shopId}`}>
                  <button className="button" style={{"background": "#1BD7BB", color: "white", padding: "0.5rem 2rem", fontSize:"1rem", fontWeight:"bold", cursor:"pointer", border:"none", borderRadius: "10px"}}>Set up</button>
                </Link>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <ProductsCard merchant={merchant} updateMerchantPlan={updateMerchantPlan} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
