import inspectionService from "@/services/inspection.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class InspectionController {
  static async scheduleInspection(req: Request, res: Response) {
    const tenantId = req.user!.id;
    const propertyId = req.params.id as string;
    const data = await inspectionService.scheduleInspection(
      propertyId,
      tenantId,
      req.body,
    );
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }

  static async getMyInspections(req: Request, res: Response) {
    const tenantId = req.user!.id;
    const data = await inspectionService.getMyInspections(tenantId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async getInspectionsForAgent(req: Request, res: Response) {
    const agentId = req.user!.id;
    const data = await inspectionService.getInspectionsForAgent(agentId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async updateStatus(req: Request, res: Response) {
    const userId = req.user!.id;
    const inspectionId = req.params.id as string;
    const data = await inspectionService.updateStatus(
      userId,
      inspectionId,
      req.body,
    );
    return res.status(StatusCodes.OK).json({ success: true, data });
  }
}

export default InspectionController;
