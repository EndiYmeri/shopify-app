// @ts-ignore
const shopId = __st.a;
let merchant;
let carbonEmissions;
let rawItems;
let consciousShoppingContainer = document.querySelector("#shopify-app-donation-plan");
let createdVariantId;
let treeQuantity;
let itemIsOnCart = undefined;

function getMerchantData() {
    fetch(`/api/v1/merchant/config/${shopId}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                console.log("Merchant config not found");
            } else {
                merchant = data;
                getCalculations;
                getCartData();
            }
        });
}
getMerchantData();
function getCartData() {
    // @ts-ignore
    fetch(window.Shopify.routes.root + "cart.js")
        .then((resp) => resp.json())
        .then(async (cartInfo) => {
            rawItems = cartInfo.items.map((line) => {
                let lineitem = {
                    title: line.title,
                    category: line.product_type.toLowerCase(),
                    quantity: line.quantity,
                };
                return lineitem;
            });
            if (rawItems.length > 0) {
                createPlanComponent();
            }
            itemIsOnCart = rawItems.find((item) => item.category === "donation");

            if (!itemIsOnCart) {
                let priceFormatted;
                const fullProductId = merchant.plan.products[0].id;
                const productId = fullProductId.substring(fullProductId.lastIndexOf("/") + 1);
                // Price
                if (merchant?.plan?.config?.percentage || merchant?.plan?.config?.checkoutAmount) {
                    const percentage = merchant.plan.config.percentage || merchant.plan.config.checkoutAmount;
                    const price = (cartInfo.total_price * percentage) / 100;
                    const priceArr = price.toString().split("");
                    priceArr.splice(priceArr.length - 2, 0, ",");
                    priceFormatted = priceArr.join("");
                }
                if (merchant?.plan?.planId === "REFORESTATION-1") {
                    priceFormatted = "0.21";
                }
                // Title
                let title;
                if (merchant?.plan?.planId === "CARBON-OFFSETTING-1") {
                    title = "Verified offsetting credits";
                } else if (merchant?.plan?.planId === "REFORESTATION-1") {
                    title = `Plant trees`;
                } else if (merchant?.plan?.planId === "DONATION-1") {
                    title = "Charity donation";
                }
                await getNewVariantPrice(productId, priceFormatted, title);
            }
            if (merchant.plan.paymentOption.user) {
                if (itemIsOnCart) {
                    consciousShoppingContainer?.classList.toggle("hidden");
                }
            }
            if (merchant?.plan?.config?.emissionType === "ALL" || merchant?.plan?.config?.emissionType === "BASKET") {
                getCalculations(rawItems);
            }
        });
}

// merchant && getCartDataUpdatePrice()
function getCalculations(items) {
    let itemsToSend = [];
    for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
            itemsToSend.push({ title: item.title, category: item.category });
        }
    }
    const dataToSend = {
        items: itemsToSend,
        merchantId: `${shopId}`,
    };
    fetch(`myServerurl/api/v1/carbon-accounting/calculate/basket-emission`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
    })
        .then((resp) => resp.json())
        .then((data) => {
            carbonEmissions = data.error ? null : data;
            createCO2Container();
        });
}

// Doesnt work yet because the code isnt merged
/**
 * @param {any} amount
 * @param {any} countryCode
 */
async function co2Price(amount, countryCode) {
    let offsettingPrice;
    await fetch("myServerurl/api/v1/carbon-accounting/calculate/offset", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            co2: {
                amount: amount,
                qty: "kg",
            },
            country: countryCode,
        }),
    })
        .then((resp) => resp.json())
        .then((result) => {
            offsettingPrice = result;
        });
    return offsettingPrice;
}
function createPlanComponent() {
    const learnMoreButton = document.querySelector("#cs-learn-more-button");
    const learnMoreContainer = document.querySelector("#cs-learn-more-container");

    // @ts-ignore
    learnMoreButton.innerHTML = "Learn more";
    learnMoreButton.addEventListener("click", () => {
        learnMoreContainer?.classList.toggle("hidden");
    });
    let planIcon = document.querySelector("#cs-plan-icon img");
    let planTitle = document.querySelector("#cs-plan-title");
    let planProjectTitle = document.querySelector("#cs-projects-title");
    let projectsImg = document.querySelector("#projects-images");
    let metricsTextTitle = document.querySelector("#metrics-text .metrics-title");
    let metricsTextDesc = document.querySelector("#metrics-text .metrics-desc");
    let metricsNumbers = document.querySelector("#metric-numbers");
    let actionButtonPrimary = document.querySelector("#cs-action-primary");

    consciousShoppingContainer?.classList.toggle("hidden");
    planIcon.innerHTML = "";
    planIcon.src = merchant.plan.layout.titleLayout.url;
    planTitle.innerHTML = "";
    actionButtonPrimary.innerHTML = "";
    planProjectTitle.innerHTML = "";
    metricsTextTitle.innerHTML = "";
    metricsTextDesc.innerHTML = "";
    metricsTextDesc.innerHTML = merchant.plan.layout.metricsLayout.description;

    if (!merchant.plan.paymentOption.merchant) {
        actionButtonPrimary.addEventListener("click", async () => {
            if (merchant) {
                await addItemOnCart(createdVariantId);
            }
        });
    }

    if (merchant.plan.planId === "CARBON-OFFSETTING-1") {
        if (merchant.plan.paymentOption.merchant) {
            if (merchant.plan.config.percentage) {
                actionButtonPrimary.innerHTML = "3,456 kg C02 Offset";
                planTitle.innerHTML = `With each transaction we support certified climate action around the world`;
            } else {
                actionButtonPrimary.innerHTML = "3,456 kg C02 Offset";
                planTitle.innerHTML = `We estimate and neutralize the CO2 emmisions, at no extra cost to you.`;
            }
        } else if (merchant.plan.paymentOption.user) {
            actionButtonPrimary.innerHTML = "Carbon Offset";
            planTitle.innerHTML = `Make this order carbon neutral with one click. Together with For the Earth we estimate emissions of every transaction`;
        }
        planProjectTitle.innerHTML = "Invest in verified projects to take climate action";
        metricsTextTitle.innerHTML = "Why make this order carbon-neutral? You get to directly participate in climate protection";

        projectsImg.classList.add("carbon");

        projectsImg.innerHTML = `
        <div class="projectCarbon">
            <div class="projectCarbonTitle">
                Renewable energy in Europe and Asia
            </div>
            <div class="carbonProjectContainer">
                <div class="carbonProjectItem">
                    <img src="https://cdn.shopify.com/s/files/1/0677/4567/7593/files/amazon-1.jpg?v=1670425827" alt="Carbon Offsetting Project">
                    <div class="projectCarbonDesc">
                        Wind energy in the Philippines 🌬⚡️
                    </div>
                </div>
                <div class="carbonProjectItem">
                    <img src="https://cdn.shopify.com/s/files/1/0677/4567/7593/files/envira-school-2.jpg?v=1670425827" alt="Carbon Offsetting Project">
                    <div class="projectCarbonDesc">
                        Biomass energy from landfill in Turkey 🔋
                    </div>
                </div>
            </div>
        </div>
        <div class="projectCarbon">
            <div class="projectCarbonTitle">
                Tree planting and Amazon conservation
            </div>
            <div class="carbonProjectContainer">
                <div class="carbonProjectItem">
                    <img src="https://cdn.shopify.com/s/files/1/0677/4567/7593/files/amazon.jpg?v=1670425827" alt="Carbon Offsetting Project">
                    <div class="projectCarbonDesc">
                        Forest conserveration in the Amazonia/Brazil 🌳🌴
                    </div>
                </div>
                <div class="carbonProjectItem">
                    <img src="https://cdn.shopify.com/s/files/1/0677/4567/7593/files/image_81.jpg?v=1670425827" alt="Carbon Offsetting Project">
                    <div class="projectCarbonDesc">
                        REDD+ forest conserveration in the Amazonia/Brazil 🌳🌴
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    if (merchant.plan.planId === "REFORESTATION-1") {
        if (merchant.plan.paymentOption.merchant && merchant.plan.config.FIXED_AMOUNT_TREES) {
            planTitle.innerHTML = `Together we reforest our planet! We plant ${merchant.plan.config.FIXED_AMOUNT_TREES} trees for every transaction`;
            actionButtonPrimary.innerHTML = " 2512 Trees Planted";
        } else if (merchant.plan.paymentOption.user && !merchant.plan.config.FIXED_AMOUNT_TREES) {
            planTitle.innerHTML = `Reforest the planet! Chose the number of trees that you would like to plant:
                <select id="tree-selector">
                    <option value="2">2 Trees</option>
                    <option value="5">5 Trees</option>
                    <option value="10">10 Trees</option>
                </select>`;
            let treeSelector = document.querySelector("#tree-selector");
            actionButtonPrimary.innerHTML = `Plant ${treeSelector.value} Trees`;
            treeQuantity = treeSelector.value;
            treeSelector.addEventListener("change", () => {
                treeQuantity = treeSelector.value;
                actionButtonPrimary.innerHTML = "";
                actionButtonPrimary.innerHTML = `Plant ${treeSelector.value} Trees`;
            });
        }
        projectsImg.classList.add("reforestation");
        projectsImg.innerHTML = `
            <div class="projectTree">
                <div class="projectReforestationTitle">
                    We plant trees with some of the most impactful tree planting partners worldwide such as Eden Reforestation and Trees for the Future. Tree planting locations include:
                </div>
                <div class="reforestationProjectContainer">
                    <div class="reforestationProjectItem">
                        <img src="https://cdn.shopify.com/s/files/1/0677/4567/7593/files/envira-school-1.jpg?v=1670425827" alt="Reforestation">
                        <div class="projectReforestationDesc">
                            Mangroves,</br> Haiti
                        </div>
                    </div>
                    <div class="reforestationProjectItem">
                        <img src="https://cdn.shopify.com/s/files/1/0677/4567/7593/files/envira-school.jpg?v=1670425827" alt="Reforestation">
                        <div class="projectReforestationDesc">
                            Forest gardens, Uganda
                        </div>
                    </div>
                </div>
            </div>
            `;
        metricsTextTitle.innerHTML = "Reforestation and forest conservation are among the most promising ways to stop climate change";
    }
    if (merchant.plan.planId === "DONATION-1") {
        if (merchant.plan.paymentOption.merchant) {
            planTitle.innerHTML = `We will donate ${merchant.plan.config.checkoutAmount}% of every purchase to ${merchant.plan?.causes[0]?.name}`;
            actionButtonPrimary.innerHTML = `${merchant.plan.config.checkoutAmount}% donated`;
        } else if (merchant.plan.paymentOption.user) {
            planTitle.innerHTML = `We will donate ${merchant.plan.config.checkoutAmount}% of every purchase to ${merchant.plan?.causes[0]?.name}`;
            actionButtonPrimary.innerHTML = `Donate ${merchant.plan.config.checkoutAmount}%`;
        }

        planProjectTitle.innerHTML = "Support registered charities around the globe to fight humanities’ biggest challenges";
        projectsImg.classList.add("donation");
        projectsImg.innerHTML = `
        <div class="projectDonation">
            <div class="projectDonationTitle">
            </div>
            <div class="donationProjectContainer">
                <div class="donationProjectItem">
                    <img src="https://cdn.shopify.com/s/files/1/0677/4567/7593/files/envira-school-3.jpg?v=1670425827" alt="Donation">
                    <div class="projectDonationDesc">
                       Oceans and rivers - Restore coral rees
                    </div>
                </div>
                <div class="donationProjectItem">
                    <img src="https://cdn.shopify.com/s/files/1/0677/4567/7593/files/india-set-to-cross-100gw-renewable-energy-capacity-mark-in-2020.jpg?v=1670425827" alt="Donation">
                    <div class="projectDonationDesc">
                        Human rights - Protect indigenous & their land
                    </div>
                </div>
            </div>
        </div>
        `;
        metricsTextTitle.innerHTML = "By supporting our NGO partners you directly contribute to the Sustainable Development Goals";
    }

    // else{
    //     planTitle.innerHTML =`${merchant.plan.layout.titleLayout.title}`
    // }
    // projectsImg.innerHTML = ""
    // projectsImg.innerHTML = ""
    // merchant.plan.layout.projectsLayout.projects.map(project=>{
    //     let projectImage = document.createElement('img')
    //     projectImage.src =  project.url
    //     projectImage.alt = project.name
    //     projectImage.width = "auto"
    //     projectImage.height = "auto"
    //     projectImage.loading = "lazy"
    //     return projectsImg.appendChild(projectImage)
    // })

    metricsNumbers.innerHTML = "";
    merchant.plan.layout.metricsLayout.metrics.map((metric) => {
        let metricDiv = document.createElement("div");
        metricDiv.classList.add("metric");
        metricDiv.innerHTML = `
            <img src="${metric.url}" alt="" width="40" height="auto" loading="lazy">
            <div class="metric-info">
                <div class="metric-info-title">${metric.name
                    .split("")
                    .map((letter) => (letter = letter === "_" ? " " : letter))
                    .join("")}</div>
                <div class="metric-info-numbers">${metric.metric}</div>
            </div>
      `;
        metricsNumbers.appendChild(metricDiv);
    });
}
function createCO2Container() {
    let c02Conatiner = document.querySelector("#shopify-app-carbon-emissions");
    let calcValue = document.querySelector("#calc-value");
    calcValue.innerHTML = carbonEmissions?.basketEmission?.total || "6";
    // calcValue.innerHTML = "6"
    // if(carbonEmissions?.basketEmission.total){
    // }
    c02Conatiner.classList.toggle("hidden");
}
function getChildrenNodesOfHtml(text) {
    let newHtml = document.createElement("div");
    newHtml.innerHTML = `${text}`;
    return newHtml.children;
}
async function addItemOnCart(productVariantId) {
    // const fullProductId = merchant.plan.products[0].id
    // const productId = fullProductId.substring(fullProductId.lastIndexOf('/')+1)
    console.log(productVariantId);
    let cartBubble = document.querySelector("#cart-icon-bubble");
    let cart = document.querySelector("cart-items");
    let cartFooter = document.querySelector("#main-cart-footer");
    const shopifySection = document.querySelector('[id^="shopify-section-template--"][id$="__cart-footer"]');
    let templateID;
    if (shopifySection) {
        templateID = shopifySection.id.replace(/[^0-9]/g, "");
    }
    let quantityToAdd = 1;
    if (merchant.plan.planId === "REFORESTATION-1") {
        quantityToAdd = treeQuantity;
    }
    await fetch(window.Shopify.routes.root + "cart/add.js", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            items: [
                {
                    id: productVariantId,
                    quantity: quantityToAdd,
                },
            ],
            sections: ["main-cart-items", "cart-icon-bubble", "cart-live-region-text", `template--${templateID ? templateID : null}__cart-footer`],
            sections_url: "/cart",
        }),
    })
        .then((response) => response.json())
        .then((resp) => {
            window.location.reload();
            // if(cartBubble) cartBubble.innerHTML = `${resp.sections['cart-icon-bubble']}`
            // if(cart) cart.parentNode.innerHTML = getChildrenNodesOfHtml(resp.sections['main-cart-items'])[0].innerHTML
            // if(cartFooter) cartFooter.parentNode.innerHTML = getChildrenNodesOfHtml(resp.sections[`template--${templateID? templateID : null }__cart-footer`])[0].innerHTML
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

async function getNewVariantPrice(productId, priceFormatted, title) {
    console.log("Price Formatted", priceFormatted);
    await fetch(`/apps/cs_proxy/update-price`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            id: productId,
            price: priceFormatted,
            title: title,
            merchantPays: merchant.plan.paymentOption.merchant,
        }),
    })
        .then((resp) => resp.json())
        .then((result) => {
            createdVariantId = result.variantId;
            createdVariantId = createdVariantId.substring(createdVariantId.lastIndexOf("/") + 1);
            console.log(result);
            if (merchant.plan.paymentOption.merchant) {
                addItemOnCart(createdVariantId);
            }
        });
}
