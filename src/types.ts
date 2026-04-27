/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum EmergencyCategory {
  MEDICAL = "Medical",
  FIRE_HAZARD = "Fire/Hazard",
  SECURITY_THREAT = "Security/Threat",
  OTHER_UNCLEAR = "Other/Unclear",
}

export enum UrgencyLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export enum NextStep {
  CALL_STAFF = "Call staff",
  MOVE_TO_SAFE_AREA = "Move to safe area",
  STAY_NEAR_EXIT = "Stay near exit",
  WAIT_FOR_ASSISTANCE = "Wait for assistance",
}

export interface EmergencyAnalysis {
  category: EmergencyCategory;
  urgency: UrgencyLevel;
  confidence: number;
  reason: string;
  immediate_action: string;
  recommended_next_step: NextStep;
}
