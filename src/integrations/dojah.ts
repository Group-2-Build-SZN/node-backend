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

  /**
   * Resolve Corporate Affairs Commission (CAC) Registration
   * Allowed values: "BUSINESS_NAME", "COMPANY", "INCORPORATED_TRUSTEES", etc.
   */
  async lookupCac(
    rcNumber: string,
    companyType:
      "BUSINESS_NAME" | "COMPANY" | "INCORPORATED_TRUSTEES" = "COMPANY",
  ) {
    // Exact param verified against Dojah: "rc_number" and "company_type" are both required
    const url = `${env.DOJAH_BASE_URL}/api/v1/kyc/cac?rc_number=${rcNumber}&company_type=${companyType}`;

    const response = await fetch(url, {
      headers: this.headers,
    });
    return response.json();
  }
}

export default new DojahClient();
