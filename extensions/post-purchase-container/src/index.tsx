/**
 * Extend Shopify Checkout with a custom Post Purchase user experience.
 * This template provides two extension points:
 *
 *  1. ShouldRender - Called first, during the checkout process, when the
 *     payment page loads.
 *  2. Render - If requested by `ShouldRender`, will be rendered after checkout
 *     completes
 */
import React, { useEffect } from "react";
import {
    extend,
    render,
    useExtensionInput,
    BlockStack,
    View,
    Button,
    Heading,
    Image,
    Separator,
    InlineStack,
    Text,
    Layout,
    TextBlock,
    Tiles,
    TextContainer,
    Button,
} from "@shopify/post-purchase-ui-extensions-react";

extend("Checkout::PostPurchase::ShouldRender", async ({ inputData, storage }) => {
    const merchantInfo = await getRenderData(inputData.shop.id);
    if (merchantInfo.response.plan) storage.update(merchantInfo);
    return { render: true };
});

async function getRenderData(shopId) {
    const response = await fetch(`/api/v1/merchant/config/${shopId}`)
        .then((resp) => resp.json())
        .then((merchant) => {
            return merchant;
        });
    return {
        response,
    };
}

async function sendCheckoutData(data, merchantConfigInfo) {
    const toBeSent = {
        orderId: data.referenceId,
        merchant: merchantConfigInfo.merchantId,
        customerId: data.customerId,
        amount: data.totalPriceSet.shopMoney.amount,
        currencyCode: data.totalPriceSet.shopMoney.currencyCode,
        lineItems: data.lineItems,
        type: merchantConfigInfo.plan?.type,
        planId: merchantConfigInfo.plan?.planId,
        paymentOption: merchantConfigInfo.plan?.paymentOption,
        config: merchantConfigInfo.plan?.config,
        voucher: merchantConfigInfo.plan?.voucher,
    };

    await fetch("/api/v1/conscious-order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(toBeSent),
    });
}

render("Checkout::PostPurchase::Render", () => <App />);
export function App() {
    const { done, inputData, storage } = useExtensionInput();
    useEffect(async () => {
        await sendCheckoutData(inputData?.initialPurchase, storage.initialData?.response);
    }, []);
    const lineItems = inputData.initialPurchase.lineItems;
    let subtotal = 0;

    return (
        <BlockStack
            spacing="loose"
            alignment="center">
            <View>
                <TextBlock
                    size="xlarge"
                    emphasized>
                    Congrats!
                </TextBlock>
            </View>
            <View>
                <TextBlock
                    size="large"
                    emphasized>
                    {storage?.initialData?.response?.plan.planId === "CARBON-OFFSETTING-1"
                        ? storage?.initialData?.response?.plan?.paymentOption?.merchant
                            ? storage?.initialData?.response?.plan?.config?.percentage
                                ? `We support certified offsetting products with ${storage?.initialData?.response?.plan?.config?.percentage}% of your basket value`
                                : "Congrats! Together with For the Earth we made your order carbon-neutral."
                            : "Congrats! You made your order carbon-neutral by supporting certified offsetting projects."
                        : ""}
                    {storage?.initialData?.response?.plan.planId === "REFORESTATION-1" ? "With this order you planted xx trees in endangered ecosystems." : ""}
                    {storage?.initialData?.response?.plan.planId === "DONATION-1"
                        ? "Congrats! You made your order carbon-neutral by supporting certified offsetting projects."
                        : ""}
                </TextBlock>
            </View>
            <Layout maxInlineSize={500}>
                {storage?.initialData?.response?.plan?.planId === "CARBON-OFFSETTING-1" ? (
                    <Image
                        fit="cover"
                        source="https://cdn.shopify.com/s/files/1/0677/4567/7593/files/43A1692.jpg?v=1669996252"
                    />
                ) : null}
                {storage?.initialData?.response?.plan?.planId === "REFORESTATION-1" ? (
                    <Image
                        fit="cover"
                        source="https://cdn.shopify.com/s/files/1/0677/4567/7593/files/GC24609wm.jpg?v=1669995859"
                    />
                ) : null}
                {storage?.initialData?.response?.plan?.planId === "DONATION-1" ? (
                    <Image
                        fit="cover"
                        source="https://cdn.shopify.com/s/files/1/0677/4567/7593/files/GC24609wm.jpg?v=1669995859"
                    />
                ) : null}
            </Layout>
            <View>
                <TextBlock
                    size="large"
                    emphasized>
                    Your order is confirmed on your way to you. Thank you!
                </TextBlock>
            </View>
            <View>
                {lineItems.map((item) => {
                    subtotal += Number(item.totalPriceSet.shopMoney.amount);
                    return (
                        <Layout
                            maxInlineSize={400}
                            media={["small"]}
                            key={item.product.id}
                            sizes={[250, 100]}
                            spacing="extraLoose">
                            <TextContainer alignment="leading">
                                <Text>{item.product.title}</Text>
                                <View inlinePadding="extraLoose"></View>
                            </TextContainer>
                            <TextContainer alignment="trailing">
                                {+item.totalPriceSet.shopMoney.amount === 0 ? (
                                    <View>Free</View>
                                ) : (
                                    <View>{item.totalPriceSet.shopMoney.amount + " " + item.totalPriceSet.shopMoney.currencyCode}</View>
                                )}
                            </TextContainer>
                        </Layout>
                    );
                })}
            </View>
            <Separator width="medium" />
            <Layout
                maxInlineSize={400}
                sizes={[250, 100]}
                spacing="xloose">
                <TextContainer alignment="leading">
                    <Text emphasized>Subtotal</Text>
                </TextContainer>
                <TextContainer alignment="trailing">
                    <TextBlock emphasized>{subtotal.toFixed(2) + " " + inputData.initialPurchase.totalPriceSet.shopMoney.currencyCode}</TextBlock>
                </TextContainer>
            </Layout>
            <Layout
                maxInlineSize={400}
                sizes={[250, 100]}
                spacing="xloose">
                <TextContainer alignment="trailing">
                    <Text emphasized>Total</Text>
                </TextContainer>
                <TextContainer alignment="trailing">
                    <TextBlock emphasized>
                        {inputData.initialPurchase.totalPriceSet.shopMoney.amount + " " + inputData.initialPurchase.totalPriceSet.shopMoney.currencyCode}
                    </TextBlock>
                </TextContainer>
            </Layout>
            <View>
                <Button onPress={done}>Proceed</Button>
            </View>
        </BlockStack>
    );
}
