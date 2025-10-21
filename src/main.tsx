import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";
import "./index.css";

console.log('🚀 Starting VidyaSetu with PostgreSQL...');

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('✅ App rendered successfully!');
} else {
  console.error('❌ Root element not found!');
}
