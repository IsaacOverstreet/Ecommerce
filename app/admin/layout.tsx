import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin-component/app-sidebar";
import { AdminNavbar } from "@/components/admin-component/admin-navbar";
import "../globals.css";
import { ToastContainer } from "react-toastify";
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className=" border border-amber-400 w-full">
        <AdminNavbar />
        <SidebarTrigger />
        <ToastContainer
          autoClose={500}
          toastClassName=" border  border-amber-400 text-sm "
          hideProgressBar
        />
        {children}
      </main>
    </SidebarProvider>
  );
}
