import { toast } from "sonner";

/**
 * Copy text to clipboard and show a toast notification.
 */
export async function copyToClipboard(
  text: string,
  label = "Copied",
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} to clipboard`, {
      duration: 2500,
      description: text.length > 40 ? `${text.slice(0, 40)}...` : text,
    });
  } catch {
    // Fallback for environments without clipboard API
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      toast.success(`${label} to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
    document.body.removeChild(textarea);
  }
}
