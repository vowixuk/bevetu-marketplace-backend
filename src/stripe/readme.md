webhook session return :

# checkout.session
'''
{
    "id": "evt_1S1NmRJW66piU6wAhqKPVpER",
    "object": "event",
    "api_version": "2025-07-30.basil",
    "created": 1756456531,
    "data": {
        "object": {
            "id": "cs_test_b1YCxlIyviWm6to3pBdtatFiVL3B1dIGcg8Deb0AMuMry4tp3VYoHzEYFn",
            "object": "checkout.session",
            "adaptive_pricing": {
                "enabled": false
            },
            "after_expiration": null,
            "allow_promotion_codes": true,
            "amount_subtotal": 500,
            "amount_total": 500,
            "automatic_tax": {
                "enabled": false,
                "liability": null,
                "provider": null,
                "status": null
            },
            "billing_address_collection": null,
            "cancel_url": "http://localhost:3006/subscription",
            "client_reference_id": null,
            "client_secret": null,
            "collected_information": {
                "shipping_details": null
            },
            "consent": null,
            "consent_collection": null,
            "created": 1756456512,
            "currency": "gbp",
            "currency_conversion": null,
            "custom_fields": [],
            "custom_text": {
                "after_submit": null,
                "shipping_address": null,
                "submit": null,
                "terms_of_service_acceptance": null
            },
            "customer": "cus_Swzkuhmf9jXR6X",
            "customer_creation": null,
            "customer_details": {
                "address": {
                    "city": null,
                    "country": "GB",
                    "line1": null,
                    "line2": null,
                    "postal_code": "BL7 J78",
                    "state": null
                },
                "email": "wilsonwong111@gmail.com",
                "name": "123",
                "phone": null,
                "tax_exempt": "none",
                "tax_ids": []
            },
            "customer_email": null,
            "discounts": [],
            "expires_at": 1756542912,
            "invoice": "in_1S1NmPJW66piU6wAEdFHdECl",
            "invoice_creation": null,
            "livemode": false,
            "locale": null,
            "metadata": {
                "bevetuSellerId": "cmevfmvfl0006qa9mow1yybbj",
                "quantity": "1",
                "userId": "cmevfmraw0000qa9m3ajqj5pb",
                "email": "wilsonwong111@gmail.com",
                "productCode": "BRONZE_MONTHLY_GBP",
                "platform": "MARKETPLACE",
                "action": "SELLER_LISTENING_SUBSCRIPTION_ENROLLMENT"
            },
            "mode": "subscription",
            "origin_context": null,
            "payment_intent": null,
            "payment_link": null,
            "payment_method_collection": "always",
            "payment_method_configuration_details": null,
            "payment_method_options": {
                "card": {
                    "request_three_d_secure": "automatic"
                }
            },
            "payment_method_types": [
                "card"
            ],
            "payment_status": "paid",
            "permissions": null,
            "phone_number_collection": {
                "enabled": false
            },
            "recovered_from": null,
            "saved_payment_method_options": {
                "allow_redisplay_filters": [
                    "always"
                ],
                "payment_method_remove": "disabled",
                "payment_method_save": null
            },
            "setup_intent": null,
            "shipping_address_collection": null,
            "shipping_cost": null,
            "shipping_options": [],
            "status": "complete",
            "submit_type": null,
            "subscription": "sub_1S1NmRJW66piU6wAdpkAb0Id",
            "success_url": "http://localhost:3006/subscription",
            "total_details": {
                "amount_discount": 0,
                "amount_shipping": 0,
                "amount_tax": 0
            },
            "ui_mode": "hosted",
            "url": null,
            "wallet_options": null
        }
    },
    "livemode": false,
    "pending_webhooks": 3,
    "request": {
        "id": null,
        "idempotency_key": null
    },
    "type": "checkout.session.completed"
}
'''