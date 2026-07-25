import contactService from "@/services/contact.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class ContactController {
  static async submitMessage(req: Request, res: Response) {
    await contactService.submitMessage(req.body);
    return res
      .status(StatusCodes.CREATED)
      .json({ success: true, message: "Message sent successfully" });
  }
}

export default ContactController;
