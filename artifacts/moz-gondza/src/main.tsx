import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// When VITE_API_URL is set (e.g. in production on Render where frontend and
// backend are deployed as separate services), point the API client at the
// correct origin. In local development, relative paths (/api/…) are used.
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
