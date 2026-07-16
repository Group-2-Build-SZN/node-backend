import { env } from "@/config/env.config";

const METAMAP_AUTH_URL = "http://api.getmati.com/oauth";
const METAMAP_API_BASE = "https://api.getmati.com";

class MetaMapClient {
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  private async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const credentials = Buffer.from(
      `${env.METAMAP_CLIENT_ID}:${env.METAMAP_CLIENT_SECRET}`,
    ).toString("base64");

    const response = await fetch(METAMAP_AUTH_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    return this.accessToken;
  }

  async submitNinCheck(payload: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    documentNumber: string;
    metadata: Record<string, string>;
  }) {
    const token = await this.getAccessToken();

    const response = await fetch(`${METAMAP_API_BASE}/govchecks/v1/ng/nin`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: payload.firstName,
        lastName: payload.lastName,
        dateOfBirth: payload.dateOfBirth,
        documentNumber: payload.documentNumber,
        callbackUrl: env.METAMAP_WEBHOOK_URL,
        metadata: payload.metadata,
      }),
    });

    return response.json();
  }

  async submitCacCheck(payload: {
    companyName: string;
    registrationNumber: string;
    metadata: Record<string, string>;
  }) {
    const token = await this.getAccessToken();

    const response = await fetch(`${METAMAP_API_BASE}/govchecks/v1/ng/cac`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        registrationNumber: payload.registrationNumber, //CAC API only uses the registrationNumber
        callbackUrl: env.METAMAP_WEBHOOK_URL,
        metadata: payload.metadata,
      }),
    });

    return response.json();
  }

  async getVerificationDetails(resourceUrl: string) {
    const token = await this.getAccessToken();
    const response = await fetch(resourceUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  }
}

export default new MetaMapClient();
