import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import AdminPanelSections from "./sidebar-menu";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <AdminPanelSections />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
