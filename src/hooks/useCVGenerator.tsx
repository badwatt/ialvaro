import { useCallback, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { CVDocument } from "src/components/CVDocument";

type State =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "ready"; url: string }
  | { status: "error" };

export function useCVGenerator() {
  const [state, setState] = useState<State>({ status: "idle" });

  const generate = useCallback(async () => {
    setState({ status: "generating" });
    try {
      const blob = await pdf(<CVDocument domain={window.location.hostname} />).toBlob();
      const url = URL.createObjectURL(blob);
      setState({ status: "ready", url });
      return url;
    } catch (err) {
      console.error("CV generation failed:", err);
      setState({ status: "error" });
      return null;
    }
  }, []);

  const download = useCallback(() => {
    if (state.status !== "ready") return;
    const link = document.createElement("a");
    link.href = state.url;
    link.download = `Alvaro_Garcia_Macias_CV_${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [state]);

  const reset = useCallback(() => {
    if (state.status === "ready") URL.revokeObjectURL(state.url);
    setState({ status: "idle" });
  }, [state]);

  return { state, generate, download, reset };
}