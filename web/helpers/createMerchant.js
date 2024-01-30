export default function createMerchant(session) {
    return fetch("/api/v1/merchant", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            merchantId: shopId,
            website: shop,
        }),
    });
}
