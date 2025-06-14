import { adminApi } from "@/lib/api/admin";

export interface VoucherCodeConfig {
  prefix?: string;
  suffix?: string;
  length?: number;
  includeNumbers?: boolean;
  includeLetters?: boolean;
  uppercaseOnly?: boolean;
  excludeSimilar?: boolean; // Exclude similar looking characters like 0, O, I, 1
}

const DEFAULT_CONFIG: VoucherCodeConfig = {
  length: 8,
  includeNumbers: true,
  includeLetters: true,
  uppercaseOnly: true,
  excludeSimilar: true,
};

/**
 * Generate a random voucher code based on configuration
 */
export function generateVoucherCode(config: VoucherCodeConfig = {}): string {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  let characters = "";

  if (finalConfig.includeNumbers) {
    characters += finalConfig.excludeSimilar ? "23456789" : "0123456789";
  }

  if (finalConfig.includeLetters) {
    const letters = finalConfig.excludeSimilar
      ? "ABCDEFGHJKLMNPQRSTUVWXYZ"
      : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    characters += finalConfig.uppercaseOnly
      ? letters
      : letters + letters.toLowerCase();
  }

  if (!characters) {
    throw new Error("Must include at least numbers or letters");
  }

  let code = "";
  const codeLength =
    (finalConfig.length || 8) -
    (finalConfig.prefix?.length || 0) -
    (finalConfig.suffix?.length || 0);

  for (let i = 0; i < codeLength; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return `${finalConfig.prefix || ""}${code}${finalConfig.suffix || ""}`;
}

/**
 * Generate multiple unique voucher codes
 */
export async function generateUniqueVoucherCodes(
  count: number,
  config: VoucherCodeConfig = {},
  maxAttempts: number = 100
): Promise<string[]> {
  const codes: Set<string> = new Set();
  let attempts = 0;

  while (codes.size < count && attempts < maxAttempts) {
    const code = generateVoucherCode(config);

    try {
      // Check if code already exists
      await adminApi.vouchers.validateCode(code);
      codes.add(code);
    } catch (error) {
      // Code already exists, try again
      attempts++;
      continue;
    }
  }

  if (codes.size < count) {
    throw new Error(
      `Could only generate ${codes.size} unique codes out of ${count} requested`
    );
  }

  return Array.from(codes);
}

/**
 * Validate voucher code format
 */
export function validateVoucherCodeFormat(code: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!code || code.trim().length === 0) {
    errors.push("Voucher code is required");
  } else {
    if (code.length < 3) {
      errors.push("Voucher code must be at least 3 characters long");
    }

    if (code.length > 50) {
      errors.push("Voucher code must not exceed 50 characters");
    }

    if (!/^[A-Z0-9-_]+$/i.test(code)) {
      errors.push(
        "Voucher code can only contain letters, numbers, hyphens, and underscores"
      );
    }

    if (/\s/.test(code)) {
      errors.push("Voucher code cannot contain spaces");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if voucher code is available (not already used)
 */
export async function checkVoucherCodeAvailability(code: string): Promise<{
  isAvailable: boolean;
  message?: string;
}> {
  try {
    await adminApi.vouchers.validateCode(code);
    return { isAvailable: true };
  } catch (error: any) {
    if (error.response?.status === 409) {
      return {
        isAvailable: false,
        message: "This voucher code is already in use",
      };
    }
    return {
      isAvailable: false,
      message: "Error checking voucher code availability",
    };
  }
}

/**
 * Generate voucher codes based on different strategies
 */
export const voucherCodeStrategies = {
  // Simple random code
  random: (length: number = 8) => generateVoucherCode({ length }),

  // Seasonal codes
  seasonal: (season: string, year?: number) => {
    const currentYear = year || new Date().getFullYear();
    const suffix = currentYear.toString().slice(-2);
    return generateVoucherCode({
      prefix: season.toUpperCase(),
      suffix: suffix,
      length: 6,
    });
  },

  // Percentage-based codes
  percentage: (percentage: number) => {
    return generateVoucherCode({
      prefix: `${percentage}OFF`,
      length: 4,
    });
  },

  // Event-based codes
  event: (eventName: string) => {
    const cleanName = eventName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    return generateVoucherCode({
      prefix: cleanName,
      length: 4,
    });
  },

  // Tier-based codes
  tier: (tier: string) => {
    const tiers: Record<string, string> = {
      bronze: "BRZ",
      silver: "SLV",
      gold: "GLD",
      platinum: "PLT",
      diamond: "DMD",
    };

    return generateVoucherCode({
      prefix: tiers[tier.toLowerCase()] || tier.slice(0, 3).toUpperCase(),
      length: 6,
    });
  },
};

/**
 * Voucher business logic validation
 */
export function validateVoucherBusinessLogic(voucherData: {
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom: Date;
  validTo: Date;
  usageLimit?: number;
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Value validation
  if (voucherData.value <= 0) {
    errors.push("Discount value must be greater than 0");
  }

  if (voucherData.type === "PERCENTAGE" && voucherData.value > 100) {
    errors.push("Percentage discount cannot exceed 100%");
  }

  // Date validation
  const now = new Date();
  if (voucherData.validFrom < now) {
    errors.push("Start date cannot be in the past");
  }

  if (voucherData.validTo <= voucherData.validFrom) {
    errors.push("End date must be after start date");
  }

  // Duration validation (not more than 2 years)
  const maxDuration = 2 * 365 * 24 * 60 * 60 * 1000; // 2 years in milliseconds
  if (
    voucherData.validTo.getTime() - voucherData.validFrom.getTime() >
    maxDuration
  ) {
    errors.push("Voucher validity period cannot exceed 2 years");
  }

  // Min order value validation
  if (voucherData.minOrderValue && voucherData.minOrderValue < 0) {
    errors.push("Minimum order value cannot be negative");
  }

  // Max discount validation for percentage vouchers
  if (voucherData.type === "PERCENTAGE" && voucherData.maxDiscount) {
    if (voucherData.maxDiscount <= 0) {
      errors.push("Maximum discount must be greater than 0");
    }
  }

  // Usage limit validation
  if (voucherData.usageLimit && voucherData.usageLimit < 1) {
    errors.push("Usage limit must be at least 1");
  }

  // Business logic validation
  if (voucherData.type === "FIXED_AMOUNT" && voucherData.minOrderValue) {
    if (voucherData.value >= voucherData.minOrderValue) {
      errors.push(
        "Fixed discount cannot be equal to or greater than minimum order value"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate voucher effectiveness score
 */
export function calculateVoucherEffectiveness(voucher: {
  usedCount: number;
  usageLimit?: number;
  validFrom: string;
  validTo: string;
  createdAt: string;
}): {
  score: number;
  rating: "Poor" | "Fair" | "Good" | "Excellent";
  insights: string[];
} {
  const insights: string[] = [];
  let score = 0;

  // Usage rate score (40% of total)
  const usageRate = voucher.usageLimit
    ? (voucher.usedCount / voucher.usageLimit) * 100
    : voucher.usedCount > 0
    ? 100
    : 0;

  if (usageRate >= 80) {
    score += 40;
    insights.push("High usage rate indicates strong customer appeal");
  } else if (usageRate >= 50) {
    score += 30;
    insights.push("Good usage rate shows moderate customer interest");
  } else if (usageRate >= 20) {
    score += 20;
    insights.push("Low usage rate suggests limited appeal");
  } else {
    score += 10;
    insights.push("Very low usage rate indicates poor performance");
  }

  // Time utilization score (30% of total)
  const validFrom = new Date(voucher.validFrom);
  const validTo = new Date(voucher.validTo);
  const now = new Date();
  const totalDuration = validTo.getTime() - validFrom.getTime();
  const elapsed = Math.min(now.getTime() - validFrom.getTime(), totalDuration);
  const timeUtilization = (elapsed / totalDuration) * 100;

  if (timeUtilization >= 80) {
    score += 30;
    insights.push("Well-utilized over time period");
  } else if (timeUtilization >= 50) {
    score += 25;
  } else {
    score += 15;
    insights.push("Limited time utilization");
  }

  // Adoption speed score (30% of total)
  const createdAt = new Date(voucher.createdAt);
  const adoptionPeriod = Math.min(
    now.getTime() - createdAt.getTime(),
    validTo.getTime() - createdAt.getTime()
  );
  const daysToFirstUse = adoptionPeriod / (24 * 60 * 60 * 1000);

  if (voucher.usedCount > 0) {
    if (daysToFirstUse <= 1) {
      score += 30;
      insights.push("Quick adoption within first day");
    } else if (daysToFirstUse <= 7) {
      score += 25;
      insights.push("Good adoption within first week");
    } else {
      score += 15;
      insights.push("Slow adoption rate");
    }
  }

  // Determine rating
  let rating: "Poor" | "Fair" | "Good" | "Excellent";
  if (score >= 80) {
    rating = "Excellent";
  } else if (score >= 60) {
    rating = "Good";
  } else if (score >= 40) {
    rating = "Fair";
  } else {
    rating = "Poor";
  }

  return { score, rating, insights };
}
