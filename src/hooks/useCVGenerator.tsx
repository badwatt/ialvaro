import { useCallback, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { CVDocument } from "src/components/CVDocument";

interface FileSystemWritableFileStream {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: Array<{ description?: string; accept: Record<string, string[]> }>;
}

declare global {
  interface Window {
    showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
  }
}

type State =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "ready"; url: string; blob: Blob }
  | { status: "error" };

export function useCVGenerator() {
  const [state, setState] = useState<State>({ status: "idle" });

  const generate = useCallback(async () => {
    setState({ status: "generating" });
    try {
      const blob = await pdf(<CVDocument domain={window.location.hostname} />).toBlob();
      const url = URL.createObjectURL(blob);
      setState({ status: "ready", url, blob });
      return url;
    } catch (err) {
      console.error("CV generation failed:", err);
      setState({ status: "error" });
      return null;
    }
  }, []);

  const download = useCallback(async () => {
    if (state.status !== "ready") return;

    try {
      if (typeof window.showSaveFilePicker === "function") {
        const handle = await window.showSaveFilePicker({
          suggestedName: `Alvaro_Garcia_Macias_CV_${new Date().toISOString().split("T")[0]}.pdf`,
          types: [
            {
              description: "PDF",
              accept: { "application/pdf": [".pdf"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(state.blob);
        await writable.close();
        return;
      }
    } catch {
      /* User cancelled or API failed — fall through to fallback */
    }

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