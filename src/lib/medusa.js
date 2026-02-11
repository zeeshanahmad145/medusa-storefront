import Medusa from "@medusajs/medusa-js";

const MEDUSA_BASE_URL = import.meta.env.VITE_MEDUSA_BASE_URL || "http://localhost:9000";
const MEDUSA_API_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_API_KEY || "";

const medusa = new Medusa({
  baseUrl: MEDUSA_BASE_URL,
  maxRetries: 3,
  ...(MEDUSA_API_KEY && { publishableApiKey: MEDUSA_API_KEY }),
});

export default medusa;
