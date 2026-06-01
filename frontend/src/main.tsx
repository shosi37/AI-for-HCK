/**
 * @fileoverview Application entry point.
 * Bootstraps the React application and mounts it to the DOM.
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Find the root element and render the main App component
createRoot(document.getElementById("root")!).render(<App />);