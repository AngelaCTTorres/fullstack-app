import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

// Hacer disponibles las variables de entorno en el cliente
declare global {
  interface Window {
    ENV: {
      API_URL: string;
    };
  }
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});



