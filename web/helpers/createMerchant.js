
export default function createMerchant(session){
    return fetch('https://fortheearth-api.cartediem.org/api/v1/merchant',{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body:JSON.stringify({
          merchantId: shopId,
          website: shop
        })
      })
}