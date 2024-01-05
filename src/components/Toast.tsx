import { useEffect } from "react";
import { Toaster, toast } from "sonner";

export default function Toast() {
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    if (params["subscribe_success"] && params["subscribe_success"] === "true") {
      toast.success("Successfully subscribed!");
    } else if (
      params["subscribe_success"] &&
      params["subscribe_success"] === "false"
    ) {
      toast.error("Failed to subscribe!");
    }
  }, []);

  return <Toaster richColors />;
}
