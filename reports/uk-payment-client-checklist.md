# UK payment setup — client preparation checklist

Research only · 29 September 2026 · No payment integration has been implemented.

## What to request from the client

First confirm whether the business is a sole trader, limited company or partnership, and whether the requirement is ordinary checkout, instalments, or both. “UK-based” alone does not identify the legal entity or account eligibility.

| Item | What the client should prepare | Where it belongs |
| --- | --- | --- |
| Business identity | Legal name, trading name, business type, registered/trading address and contact details | Payment-provider onboarding; approved public details to developer |
| Limited company | Companies House number; incorporation/registration evidence if requested; directors and beneficial-owner information | Client submits through provider dashboard |
| Sole trader | Owner's legal name and trading name; business/address evidence requested for that account type | Provider dashboard; no invented company number |
| Partnership | Partnership registration or agreement if requested, partner and authorised-representative details | Provider dashboard |
| Person verification | Valid passport or other accepted photo ID; date of birth and residential address; proof of address if requested | Directly to provider, not into the website repository or this chat |
| Settlement bank | Bank account holder name, sort code/account number or other required bank identifiers; statement or bank confirmation if requested | Client enters privately in provider dashboard |
| Tax status | Whether VAT registered, VAT number if applicable, client/accountant-approved treatment of prices and tax | Approved setup information to developer; sensitive tax records directly to provider if requested |

This is a preparation list, not a claim that every upload is mandatory. Requirements depend on entity type, automatic verification and the provider's account-specific requests. Stripe separates identity, address, entity, bank and ownership evidence; document details must match the account. Follow the current UK selection and dashboard instructions. [Stripe verification documents](https://docs.stripe.com/acceptable-verification-documents?country=GB). Bank-account naming must also match the appropriate account/entity type. [Stripe bank ownership](https://support.stripe.com/questions/verify-your-bank-account-ownership?locale=en-GB).

## Information the website developer needs

- Final business/trading name and public customer-support email, telephone and address.
- Final domain and access by invitation to the client's hosting/domain accounts when implementation is authorised.
- Approved catalogue: SKU, product name, genuine description, bottle size, variants, actual photos/packaging, stock and **GBP prices**. The current images are concepts.
- VAT status and approved tax-inclusive customer prices where applicable. Do not convert the demo's rupee prices without approval.
- Shipping countries, carrier, charges, dispatch/delivery times, dispatch location, and any perfume/body-spray shipping restrictions confirmed with the chosen carrier.
- Approved delivery, cancellation, returns/refunds, terms and privacy information, including return address and who pays return postage.
- Who receives order notifications, fulfils orders, handles refunds/disputes and reconciles payouts.

UK online sellers need clear business/contact information, product descriptions, prices including taxes, delivery arrangements and cancellation information. Have the client approve policies suitable for their actual products; do not assume all opened perfumes are automatically exempt from cancellation. [GOV.UK distance selling](https://www.gov.uk/online-and-distance-selling-for-businesses). Payment-provider website reviews also look for clear business, product, customer-service and fulfilment information. [Stripe website checklist](https://docs.stripe.com/get-started/checklist/website).

## Accounts and access

The client should own and create the payment-provider account using the actual UK entity. Stripe and PayPal are candidates to assess; no account has been chosen or created. The client completes verification, accepts the merchant agreement and connects the payout bank account. Then invite the developer with the access required for integration rather than sharing the owner's password. Verification uploads belong directly with the provider. PayPal may request ID, address and business evidence when automatic verification is insufficient. [PayPal verification guidance](https://www.paypal.com/uk/cshelp/article/what-documents-can-i-upload-to-confirm-my-business-entity-help493).

For a future implementation, the developer would configure test credentials, secure server-side checkout, order records, verified payment notifications, receipts and refunds; then test success, cancellation, failure and duplicate notifications. The current site is a static showcase with enquiry previews, so accepting payment requires more than adding a button. No live keys or bank documents are needed for this research stage.

## If “payment plan” means instalments

Ask the client whether they want a provider-managed buy-now-pay-later option rather than ordinary card checkout. Klarna through Stripe supports UK businesses/GBP subject to eligibility; displayed options depend on the customer, transaction and applicable rules. Merchant proceeds, less fees, are made available through Stripe while Klarna collects repayments. Obtain provider approval and approved customer messaging before advertising any specific instalment offer. Do not promise that every customer can pay in three, or build a custom lending scheme. [Stripe Klarna documentation](https://docs.stripe.com/payments/klarna).

## Current gaps to resolve before implementation

1. Legal entity type and authorised owner are not confirmed.
2. Demo still says Lahore and uses rupee prices; client must confirm UK-facing business copy and GBP pricing.
3. Public contact details, final catalogue, inventory, delivery and returns terms are missing.
4. Payment method/provider and whether instalments are wanted are not decided.
5. There is no real cart, order database, payment handling or fulfilment integration yet.

Next client handoff: request non-sensitive business/catalogue/policy information first. The client supplies ID and bank evidence privately to the chosen provider when onboarding begins.
