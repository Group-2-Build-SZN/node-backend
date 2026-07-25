import { db } from "@/config/database.config";
import { contactMessages } from "@/db/schema/contact-messages.schema";
import emailService from "@/services/email.service";
import type { SubmitContactMessageInput } from "@/validations/contact.validation";

class ContactService {
  async submitMessage(payload: SubmitContactMessageInput) {
    const [message] = await db
      .insert(contactMessages)
      .values(payload)
      .returning();

    await emailService.sendContactNotification(payload);

    return message;
  }
}

export default new ContactService();
