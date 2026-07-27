import { vi } from "vitest";

vi.mock("@/services/email.service", () => ({
  default: {
    sendLoginCode: vi.fn().mockResolvedValue(undefined),
    sendContactNotification: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/lib/dojah", () => ({
  default: {
    lookupNin: vi.fn().mockResolvedValue({
      entity: { first_name: "John", last_name: "Adamu" },
    }),
    lookupCac: vi.fn().mockResolvedValue({
      entity: { company_name: "A, B and C ESSENTIAL VENTURES" },
    }),
  },
}));

vi.mock("@/lib/cloudinary", () => ({
  default: {
    uploadBuffer: vi
      .fn()
      .mockResolvedValue("https://fake-cloudinary-url.com/image.jpg"),
  },
}));
