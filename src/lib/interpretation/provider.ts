import type { InterpretationInput, SupportResult } from "../schemas";

export interface InterpretationProvider {
  interpret(input: InterpretationInput): Promise<SupportResult>;
}
