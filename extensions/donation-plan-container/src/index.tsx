import React from 'react';
import { useState, useEffect } from 'react';
import {
  render,
  Grid,
  View,
  useTranslate,
  Image,
  Text,
  Heading,
  TextBlock,
  Button,
  BlockLayout,
  useCartLines,
  useApplyCartLinesChange,
  useExtensionApi,
  BlockSpacer,
  useShop,
  useShippingAddress,
} from '@shopify/checkout-ui-extensions-react';
render('Checkout::Actions::RenderBefore', () => <App />);


function App() {
  const [displayMore, setDisplayMore] = useState(false)
  const extension = useExtensionApi();
  const translate = useTranslate();
  const [merchantInfo, setMerchantInfo] = useState(null)
  const [showError, setShowError] = useState(false);
	const applyCartLinesChange = useApplyCartLinesChange();
  const lines = useCartLines();
  const shop = useShop()
  const [productIsOnCart, setProductIsOnCart] = useState(false)
  const [actionButtons, setActionButtons] = useState({})

  async function loadData(){
    let shopId =  shop.id.substring(shop.id.lastIndexOf('/')+1)
    try{
      await fetch(`https://fortheearth-api.cartediem.org/api/v1/merchant/config/${shopId}`)
      .then( response => response.json())
      .then( data => {
        console.log({data})
        data.error ? setShowError("Data not loaded") : setMerchantInfo(data)
      });
    }
    catch(e){
      setShowError("Merchant info not loaded")
    }
  }
  useEffect( async () => {
    await loadData()
  }, [showError, shop]);

  useEffect(()=>{
    let newActionButtons = merchantInfo?.plan.layout.actionsLayout.actions.reduce((a, v) => ({ ...a, [v.name]: v}), {})
    setActionButtons(newActionButtons)
  },[merchantInfo?.plan])

  async function handleAddItemOnCart(plan){
    const result =  await applyCartLinesChange({
      type: "addCartLine",
      merchandiseId: plan.products[0]?.variant.id,
      quantity: 1,
    })
    if (result.type === "error") {
      setShowError(true);
      console.error(result.message);
    }else{
      setProductIsOnCart(true)
    }
  }
  if(merchantInfo?.plan){
    let plan = merchantInfo?.plan
    return (
      <BlockLayout spacing="loose">
                <View border="base" padding="base" borderRadius="base">
                  <BlockLayout rows={['auto','auto']} spacing="none" > 
                  {/* Title and Buttons */}
                    <Grid
                      columns={[50, 'fill', 'auto']}
                      spacing="loose"
                    > 
                      <Image fit="cover" source={plan.layout.titleLayout.url} />
                      {/* Title */}
                      <BlockLayout rows={20} spacing="none">
                        <Text size="base">{plan.layout.titleLayout.title}</Text>
                      </BlockLayout>
                      {/* Action buttons */}
                      <BlockLayout 
                      rows={['2', 'auto']}>
                        <View maxInlineSize={150}>
                          <Button
                            kind='plain'
                            onPress={() => productIsOnCart? null : handleAddItemOnCart(plan)}
                            >
                              <Image fit={"contain"} source={ actionButtons? actionButtons["PRICE"].url: null} />
                          </Button>
                        </View>
                        <Grid
                          columns={[100,20]}
                          rows={"auto"}
                          blockAlignment={"center"}
                          spacing="tight"
                          inlineAlignment={"center"}
                        >
                          <Button
                            kind="plain"
                            onPress={() => {
                              setDisplayMore(!displayMore)
                            }}
                            > 
                              <Image fit={"contain"} source={actionButtons? actionButtons["LEARN_MORE"].url : null}/>
                          </Button>
                          <Button 
                            kind='plain'
                            onPress={() => {
                            }}
                            >
                              <Image fit={"contain"} source={actionButtons? actionButtons["INFO"].url : null} />
                          </Button>
                        </Grid>
                      </BlockLayout>
                    </Grid>
                    {/* Learn more Section */}
                    {
                      displayMore &&
                      <Grid
                        columns={['55%', '45%']}
                        spacing="tight">
                          {/* Projects */}
                          <BlockLayout rows="auto" spacing="tight" blockAlignment={"end"}>
                            <TextBlock size="small" emphasis="stress" >{plan.layout.projectsLayout.title}</TextBlock>
                            <Grid columns={["50%", "50%"]} inlineAlignment="center" spacing="tight" >
                                {
                                  plan.layout.projectsLayout.projects.map((project,index)=>{
                                    return (
                                      <View maxBlockSize={150} maxInlineSize={150} key={index} >
                                        <Image fit="cover" source={project.url}/>
                                      </View>
                                    )
                                  })
                                }
                            </Grid>
                          </BlockLayout>
                          {/* Metrics */}
                          <BlockLayout rows="auto" spacing="extraLoose" blockAlignment={"end"} >
                            <BlockLayout rows="auto" spacing={"loose"} >
                              <TextBlock emphasis="stress" size="small" >{plan.layout.metricsLayout.title}</TextBlock>
                              <TextBlock size="small" >{plan.layout.metricsLayout.description}</TextBlock>
                            </BlockLayout>
                            <Grid
                              columns={['50%', '50%']}
                              spacing="tight"
                            >
                              {
                                  plan.layout.metricsLayout.metrics.map( metric => {
                                    return (  
                                      <Grid
                                        columns={[30, 'fill']}
                                        spacing="tight"
                                          > 
                                        <Image source={metric.url} />
                                        <BlockLayout rows="auto">
                                          <Text size="extraSmall">{metric.name.split('').map((letter) => letter = letter === "_" ? " " : letter)}</Text>
                                          <Text size="extraSmall">{metric.metric}</Text>
                                        </BlockLayout>
                                      </Grid>
                                    )
                                  })
                                }
                            </Grid>
                          </BlockLayout>
                      </Grid>
                    }
                  </BlockLayout>
                </View>
      </BlockLayout>
      )
  } else {
   return null
  }
}

