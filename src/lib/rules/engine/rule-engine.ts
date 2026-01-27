/**
 * Rule Engine
 * 
 * Orchestrates execution of business rules with priority-based ordering
 * and configurable failure handling.
 */

import type { Rule, RuleResult } from './rule.interface';

export class RuleEngine<T> {
  private rules: Rule<T>[] = [];

  /**
   * Register a rule in the engine
   */
  registerRule(rule: Rule<T>): void {
    this.rules.push(rule);
    // Sort by priority (lower priority executes first)
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Execute all rules and collect results
   */
  async executeAll(context: T): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    
    for (const rule of this.rules) {
      const result = await rule.validate(context);
      results.push(result);
      
      // Stop on first critical failure
      if (!result.valid && result.errorCode?.startsWith('CRITICAL_')) {
        break;
      }
    }
    
    return results;
  }

  /**
   * Execute rules until first failure
   */
  async executeUntilFailure(context: T): Promise<RuleResult | null> {
    for (const rule of this.rules) {
      const result = await rule.validate(context);
      if (!result.valid) {
        return result;
      }
    }
    return null; // All rules passed
  }

  /**
   * Get failed results from execution
   */
  getFailedResults(results: RuleResult[]): RuleResult[] {
    return results.filter((r) => !r.valid);
  }

  /**
   * Check if any failures exist
   */
  hasFailures(results: RuleResult[]): boolean {
    return results.some((r) => !r.valid);
  }
}
