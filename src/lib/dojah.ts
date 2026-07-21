import { env } from "@/config/env.config";

class DojahClient {
  private headers = {
    AppId: env.DOJAH_APP_ID,
    Authorization: env.DOJAH_SECRET_KEY,
  };

  /**
   * Resolve National Identity Number (NIN)
   */
  async lookupNin(nin: string) {
    const response = await fetch(
      `${env.DOJAH_BASE_URL}/api/v1/kyc/nin?nin=${nin}`,
      {
        headers: this.headers,
      },
    );
    return response.json();
  }

  async lookupCac(rcNumber: string) {
    const response = await fetch(
      `${env.DOJAH_BASE_URL}/api/v1/kyc/cac/basic?rc_number=${rcNumber}`,
      {
        headers: this.headers,
      },
    );
    return response.json();
  }
}

export default new DojahClient();
