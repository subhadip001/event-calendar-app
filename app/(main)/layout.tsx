import ClientLayout from "../components/common/ClientLayout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
