import { DemoInterpretationProvider } from "./demo-provider";
import { ModelInterpretationProvider } from "./model-provider";
import type { InterpretationProvider } from "./provider";

export function getInterpretationProvider(
  requestedMode: "demo" | "live" = "demo",
): InterpretationProvider {
  if (requestedMode === "demo") {
    return new DemoInterpretationProvider();
  }

  return new ModelInterpretationProvider();
}
