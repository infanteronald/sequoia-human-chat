// Fraud detection scoring system
const TEMP_EMAIL_DOMAINS = [
  "tempmail.com", "throwaway.email", "guerrillamail.com", "mailinator.com",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "10minutemail.com", "temp-mail.org", "fakeinbox.com", "trashmail.com",
  "maildrop.cc", "dispostable.com", "mailnesia.com",
];

interface FraudInput {
  email: string;
  orderTotal: number;
  avgTicket: number;
  isNewCustomer: boolean;
  orderCount: number;
  ipAddress?: string | null;
  shippingCity?: string | null;
  sameAddressOrders?: number;
}

export function calculateFraudScore(input: FraudInput): { score: number; flags: string[] } {
  let score = 0;
  const flags: string[] = [];

  // High value + new customer
  if (input.isNewCustomer && input.orderTotal > 500000) {
    score += 25;
    flags.push("high_value_new_customer");
  }

  // Email from temp domain
  const emailDomain = input.email.split("@")[1]?.toLowerCase();
  if (emailDomain && TEMP_EMAIL_DOMAINS.includes(emailDomain)) {
    score += 20;
    flags.push("temp_email");
  }

  // Order > 2x avg ticket
  if (input.avgTicket > 0 && input.orderTotal > input.avgTicket * 2) {
    score += 15;
    flags.push("high_value_vs_avg");
  }

  // Multiple orders same address different accounts
  if (input.sameAddressOrders && input.sameAddressOrders > 2) {
    score += 20;
    flags.push("repeated_address");
  }

  // Suspicious email patterns (lots of numbers)
  const localPart = input.email.split("@")[0] || "";
  const digitRatio = (localPart.match(/\d/g) || []).length / localPart.length;
  if (digitRatio > 0.5 && localPart.length > 8) {
    score += 10;
    flags.push("suspicious_email_pattern");
  }

  // New customer with high number of items (often fraud)
  if (input.isNewCustomer && input.orderTotal > 1000000) {
    score += 15;
    flags.push("very_high_value_first_order");
  }

  return { score: Math.min(score, 100), flags };
}

export function getFraudLevel(score: number): "low" | "medium" | "high" {
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}
