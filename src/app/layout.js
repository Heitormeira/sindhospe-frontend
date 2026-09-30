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
        <NavClient>{children}</NavClient>
      </body>
    </html>
  );
}
