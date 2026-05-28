import { pdf } from "@react-pdf/renderer";
import { CVDocument } from "src/components/CVDocument";

export async function generateAndOpenCV(): Promise<void> {
  const blob = await pdf(<CVDocument domain={window.location.hostname} />).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}