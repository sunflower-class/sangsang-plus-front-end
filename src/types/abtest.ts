// Generated manually based on ABtest/openapi.yaml (version 0.2.0)
// 필요한 핵심 타입 & enum. 실제 스펙 확장 시 여기 추가.

export type TestStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'manual_decision'
  | 'winner_selected'
  | 'cycle_completed'
  | 'archived';

export type VariantType = 'A' | 'B' | 'C' | 'D';
export type DistributionMode = 'equal' | 'bandit' | 'contextual';
export type TestMode = 'manual' | 'autopilot';
export type DecisionMode = 'auto' | 'manual' | 'hybrid';

export interface CreateTestRequest {
  test_name: string;
  product_name: string;
  product_image: string;
  product_description: string;
  price: number;
  category: string;
  tags?: string[];
  duration_days?: number; // default 14
  target_metrics?: Record<string, number> | null;
}

export interface ExperimentBriefRequest {
  objective: string;
  primary_metrics: string[];
  secondary_metrics: string[];
  guardrails: Record<string, number>;
  target_categories: string[];
  target_channels: string[];
  target_devices: string[];
  exclude_conditions: string[];
  variant_count: number;
  distribution_mode: DistributionMode | string; // backend currently string
  mde: number;
  min_sample_size: number;
  decision_mode?: DecisionMode | string;
  manual_decision_period_days?: number;
  long_term_monitoring_days?: number;
}

export interface CreateTestWithBriefRequest extends Omit<CreateTestRequest, 'target_metrics'> {
  experiment_brief: ExperimentBriefRequest;
  test_mode?: TestMode | string;
}

export interface PageVariant {
  variant_id: string;
  variant_type: VariantType | string;
  title?: string;
  description?: string;
  layout_type?: string;
  color_scheme?: string;
  cta_text?: string;
  cta_color?: string;
  cta_position?: string;
  additional_features?: string[];
  image_style?: string;
  font_style?: string;
}

export interface ABTestSummary {
  test_id: string;
  test_name: string;
  status: TestStatus | string;
  start_date: string;
  end_date: string | null;
  variants_count: number;
  created_at: string;
  product_name: string;
  test_mode: TestMode | string;
}

export interface ABTestDetail extends ABTestSummary {
  description?: string;
  duration_days?: number | null;
  winner_variant_id?: string | null;
  traffic_split?: Record<string, number>;
}

export interface TestActionRequest { test_id: string; action: 'start' | 'pause' | 'complete'; }
export interface CycleActionRequest { test_id: string; action: 'start_next_cycle' | 'complete_cycle' | 'archive'; }
export interface ManualDecisionRequest { test_id: string; variant_id: string; reason?: string; }
export interface LongTermMetricsRequest { test_id: string; metrics: Record<string, number>; }
export interface TestEventRequest {
  test_id: string;
  variant_id: string;
  event_type: string; // "impression" | "click_detail" | ...
  user_id: string;
  session_id: string;
  revenue?: number;
  session_duration?: number;
}

// Generic responses
export interface StatusResponse { status: string; message?: string; }
export interface ErrorResponse { error: string; }
export interface TestListResponse { status: string; tests: ABTestSummary[]; total_count: number; }
export interface TestDetailResponse { status: string; test: ABTestDetail; }
export interface VariantAssignmentResponse { status: string; variant: PageVariant; }

export interface EventsResponse { status: string; events: Array<{ event_id: string; variant_id: string; user_id: string; event_type: string; timestamp: string; session_id: string; revenue: number; }>; total_count: number; }

// Utility type guard
export function isErrorResponse(r: unknown): r is ErrorResponse {
  return typeof r === 'object' && r !== null && 'error' in r && typeof (r as { error?: unknown }).error === 'string';
}
