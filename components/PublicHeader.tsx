import { Header } from "@/components/Header";

export function PublicHeader() {
  return (
    <Header
      kind="public"
      navItems={[
        { href: "/", label: "Home" },
        { href: "/bulletin", label: "Public Bulletin" }
      ]}
    />
  );
}
