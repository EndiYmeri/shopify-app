import React from 'react';
import {
  render,
  View,
  Grid,
  BlockStack,
  useCartLines,
  Heading,
  Image,
  useExtensionApi,
  Spinner
} from '@shopify/checkout-ui-extensions-react';
import { useEffect, useState } from 'react';

render('Checkout::CartLines::RenderAfter', () => <App />);

// const calcs = {
//   "transportEmission": {
//       "totalCo2Production": 1.37,
//       "distance": 11.88,
//       "meta": {
//           "unitCode": "km"
//       }
//   },
//   "basketEmission": {
//       "total": 130,
//       "items": [
//           {
//               "title": "asd",
//               "category": "shorts",
//               "emissionValue": 0
//           }
//       ]
//    }
// }

type Items = {
  title : string,
  category: string
}

type Address = { 
  firstName: string,
  address1: string, 
  city:string, 
  countryCode: string,
  zip : string,
}

function App() {
  const lines = useCartLines();
  const [isLoading, setIsLoading] = useState(true)
  const [showCO2, setShowCO2] =  useState(false)
  const  extension = useExtensionApi()
  const [items, setItems] = useState<Items[]>()
  const [address, setAddress] = useState<Address>(
    { 
      firstName: "",
      address1: "", 
      city:"", 
      countryCode: "",
      zip : "",
    }
    )
  // const shippingAddress = useShippingAddress()
  const [shopUrl, setShopUrl] = useState<string>()
  const [shopId, setShopId] = useState<string>()
  const [calculations, setCalculations] = useState()
  const [co2EmissionsTotal, setCo2EmissionsTotal] = useState(0)
  const [merchant, setMerchant] = useState()
  const [recommerce, setRecommerce] = useState(false)
  const [planType, setPlanType] = useState<string>("")


  useEffect( async ()=>{
    setShopUrl(extension.shop.myshopifyDomain)
    setShopId(extension.shop.id.substring(extension.shop.id.lastIndexOf('/')+1))
  },[])


  useEffect( async ()=>{
      await fetch(`https://fortheearth-api.cartediem.org/api/v1/merchant/config/${shopId}`)
      .then(resp => resp.json())
      .then(merchantInfo => setMerchant(merchantInfo))
  },[shopId])

  useEffect(()=> {
    setIsLoading(true)
    setItems(lines.map( line =>{
        let lineitem = {
          title: line.merchandise.title,
          category:line.merchandise.product.productType.toLowerCase(),
          quantity : line.quantity
        }
        return lineitem
    }))

    if(extension.shippingAddress){
      setAddress({
        firstName: extension.shippingAddress.current.firstName,
        city: extension.shippingAddress.current.city?.toLowerCase(),
        address1: extension.shippingAddress.current.address1,
        countryCode: extension.shippingAddress.current.countryCode,
        zip: extension.shippingAddress.current.zip
      })
    }
  },[lines, extension.shippingAddress.current])

   async function getCalculations(){
    let itemsToSend = []
    for(const item of items){
      for(let i = 0; i< item.quantity; i++ ){
        itemsToSend.push({"title": item.title, "category": item.category})
      }
    }
    const dataToSend = {
      "items": itemsToSend,
      "shippingAddress": address,
      "merchantId": `${shopId}`
    }

    let calcEndpoint = ""
    if(merchant?.plan?.config?.emissionType === "ALL"){
      calcEndpoint = "carbon-production"
    }
    if(merchant?.plan?.config?.emissionType === "TRANSPORT"){
      calcEndpoint = "transport-emission"
    }
    if(merchant?.plan?.config?.emissionType === "BASKET"){
      calcEndpoint = "basket-emission"
    }

    if(calcEndpoint.length > 1){
      extension.storage.write("lineItems", items)
      await fetch(`https://logistics-service.cartediem.org/api/v1/carbon-accounting/calculate/${calcEndpoint}`,{
        "method": "POST",
        "headers":{
          "Content-Type":"application/json"
        },
        "body": JSON.stringify(dataToSend)
      }).then(resp => resp.json()).then(data => {
        setCalculations(data)
        setIsLoading(false)
      })
    }
  }
  useEffect(async ()=>{
    if(address.address1){
      await getCalculations()
    }
  },[address])

  useEffect(()=>{
    if(calculations && merchant?.plan){
      if(merchant.plan.config.emissionType === "ALL"){
        if(calculations?.basketEmission.total < 0){
          setRecommerce(true)
        }
        setCo2EmissionsTotal(calculations.basketEmission.total + calculations?.transportEmission?.totalCo2Production)
      }
      if(merchant.plan.config.emissionType === "BASKET"){
        setCo2EmissionsTotal(calculations.basketEmission.total)
      }
      if(merchant.plan.config.emissionType === "TRANSPORT"){
        setCo2EmissionsTotal(calculations?.transportEmission?.totalCo2Production)
      }
    }
  },[calculations])

  if(calculations){
    return  ( 
        <View  padding={"base"} border={"base"} borderRadius={"base"}>
          <Grid  columns={["auto", "fill"]} spacing="loose" blockAlignment={"start"}>
                <View>
                  <Image source='https://i.imgur.com/Nc8kyQl.png' />
                </View>
                
                <View>
                  <BlockStack>
                    {
                      recommerce
                      ? `With this purchase you give pre-owned items a second life. You help avoiding up to ${Math.abs(co2EmissionsTotal.toFixed(2))} kg CO2 emissions`
                      : `This order causes up to ${co2EmissionsTotal.toFixed(2)} kg CO2eq (product + transport) Together with For the Earth we estimate emissions of every transaction`
                    }
                    <Grid columns={["fill","auto"]} >
                      <Heading level={3}>
                        {
                          recommerce
                          ?  `CO2 emissions avoided`
                          :  `CO2 emissions`
                        }
                       
                      </Heading>
                      <Heading inlineAlignment="center" level={3}>
                        { `${Math.abs(co2EmissionsTotal.toFixed(2))} kg` } 
                      </Heading>
                    </Grid>
                  </BlockStack>
                </View>
          </Grid>
        </View>)

  }else{
    return null
  }

}
