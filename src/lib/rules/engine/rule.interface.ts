/**
 * Rule Interface
 * 
 * Contract for business rules in the rule engine.
 */

export interface RuleResult {
  valid: boolean;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface Rule<T> {
  name: string;
  priority: number; // Lower executes first
  validate(context: T): Promise<RuleResult>;
}
