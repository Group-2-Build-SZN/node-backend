import { Router } from "express";
import kycRoutes from "@/routes/kyc.routes";
import propertyRoutes from "@/routes/property.routes";
import reviewRoutes from "@/routes/review.routes";
import amenityRoutes from "@/routes/amenity.routes";
import paymentRoutes from "@/routes/payment.routes";
const router = Router();

router.use("/kyc", kycRoutes);
router.use("/properties/:propertyId/reviews", reviewRoutes);
router.use("/properties", propertyRoutes);
router.use("/amenities", amenityRoutes);
router.use("/payments", paymentRoutes);

export default router;
