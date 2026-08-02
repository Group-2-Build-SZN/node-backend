import { env } from "@/config/env.config";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

class PaystackClient {
  private headers = {
    Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  async initializeSubscriptionTransaction(email: string) {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          email,
          amount: 750000, //7500 naira in kobo
          plan: env.PAYSTACK_PLAN_CODE,
          callback_url: `${env.FRONTEND_URL}/subscription/success`,
        }),
      },
    );

    const data = await response.json();

    if (!data.status) {
      throw new Error(
        data.message ?? "Failed to initialize Paystack transaction",
      );
    }

    return data.data as {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  }

  async disableSubscription(code: string, token: string) {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/disable`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ code, token }),
    });
    return response.json();
  }
}

export default new PaystackClient();
