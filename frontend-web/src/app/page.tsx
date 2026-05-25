import { redirect } from "next/navigation";

// Temporário: redireciona para o login até o Go Live, quando será substituído pela landing page.
export default function RootPage() {
  redirect("/login");
}
