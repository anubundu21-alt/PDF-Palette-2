import "./lib/promise-with-resolvers-polyfill";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const container = document.getElementById("root")!;
// Drop the crawler-only prerendered markup before mounting (see index.html).
if (container.hasAttribute("data-prerendered")) {
  container.replaceChildren();
  container.removeAttribute("data-prerendered");
}
createRoot(container).render(<App />);
