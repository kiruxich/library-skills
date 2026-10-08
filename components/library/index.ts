import type { ComponentType } from "react";
import BasketballUpload from "./basketball-upload";
import CardCheckout from "./card-checkout";
import OtpBurst from "./otp-burst";
import OtpOrbit from "./otp-orbit";

export const LIBRARY: Record<string, ComponentType> = {
  "basketball-upload": BasketballUpload,
  "card-checkout": CardCheckout,
  "otp-burst": OtpBurst,
  "otp-orbit": OtpOrbit,
};
