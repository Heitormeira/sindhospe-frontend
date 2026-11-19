import "./globals.css";
import NavClient from "./nav-client";

export const metadata = {
  title: "Portal Saúde PE",
  description: "Portal Saúde PE — projeto acadêmico (Projeto Integrador, UNICAP) com dados públicos do CNES/DATASUS sobre os estabelecimentos de saúde de Pernambuco.",
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
