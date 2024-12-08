import { Toaster } from "react-hot-toast";
import ClientLayout from "../components/common/ClientLayout";
import { EventProvider } from "@/contexts/EventContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EventProvider>
      <ClientLayout>
        {children}
        <Toaster position="top-center" />
      </ClientLayout>
    </EventProvider>
  );
}
