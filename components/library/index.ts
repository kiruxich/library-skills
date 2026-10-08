import type { ComponentType } from "react";
import BasketballUpload from "./basketball-upload";
import CardCheckout from "./card-checkout";
import LampLogin from "./lamp-login";
import OtpBurst from "./otp-burst";
import OtpOrbit from "./otp-orbit";
import RunawayLogin from "./runaway-login";
import ScannerTestimonials from "./scanner-testimonials";

export const LIBRARY: Record<string, ComponentType> = {
  "basketball-upload": BasketballUpload,
  "card-checkout": CardCheckout,
  "otp-burst": OtpBurst,
  "otp-orbit": OtpOrbit,
  "runaway-login": RunawayLogin,
  "lamp-login": LampLogin,
  "scanner-testimonials": ScannerTestimonials,
};
