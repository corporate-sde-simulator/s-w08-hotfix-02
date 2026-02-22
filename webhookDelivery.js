/**
 * ====================================================================
 *  JIRA: SVC-1972 — Fix Webhook Delivery Reliability
 * ====================================================================
 *  P0 | Points: 2 | Labels: integration, javascript
 *
 *  Webhook delivery drops events silently when endpoint returns 5xx.
 *  No retry, no signature verification, no ordering guarantee.
 *
 *  ACCEPTANCE CRITERIA:
 *  - [ ] Retry 3 times with exponential backoff for 5xx
 *  - [ ] HMAC-SHA256 signature in X-Webhook-Signature header
 *  - [ ] Events delivered in order per subscription
 * ====================================================================
 */

class WebhookDelivery {
    constructor() {
        this.subscriptions = new Map();
        this.deliveryLog = [];
    }

    subscribe(event, url, secret) {
        if (!this.subscriptions.has(event)) {
            this.subscriptions.set(event, []);
        }
        this.subscriptions.get(event).push({ url, secret });
    }

    async deliver(event, payload) {
        const subs = this.subscriptions.get(event) || [];

        for (const sub of subs) {
            try {
                // Should add: headers['X-Webhook-Signature'] = hmacSha256(sub.secret, payload)

                await this.httpPost(sub.url, payload, {});

                this.deliveryLog.push({ event, url: sub.url, status: 'delivered' });
            } catch (error) {
                this.deliveryLog.push({ event, url: sub.url, status: 'failed', error: error.message });
            }
        }
    }

    async httpPost(url, body, headers) {
        // Stub
        return { status: 200 };
    }

    getDeliveryStatus(event) {
        return this.deliveryLog.filter(l => l.event === event);
    }
}

module.exports = { WebhookDelivery };
