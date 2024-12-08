"use client";

import React from "react";
import Sidebar from "./Sidebar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <div className="dashboard-layout bg-white w-full flex flex-col h-screen">
      <main className="flex flex-grow w-full border-t">
        <Sidebar />
        <section className="flex-grow">{children}</section>
      </main>
    </div>
  );
};

export default ClientLayout;
