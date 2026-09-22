import "./globals.css";
import NavClient from "./nav-client";

export const metadata = {
  title: "Portal SINDHOSPE",
  description: "Portal de Inteligência de Dados — SINDHOSPE",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ background: "#e6f5ee", margin: 0 }}>
        <div style={{ maxWidth: 672, margin: "0 auto", padding: "1.25rem 1rem 3rem" }}>
          <NavClient />
          {children}
        </div>
      </body>
    </html>
  );
}
