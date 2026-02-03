"use client";
import { ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import Link from "next/link";
import { useState } from "react";
import { useSidebar } from "../ui/sidebar";

const items = [
  {
    title: "Product management",
    subContent: [
      {
        title: "View & edit all products",
        url: "/admin/dashboard/product-management/view-products",
      },
      {
        title: "Add category",
        url: "/admin/dashboard/product-management/add-category",
      },
      {
        title: "Add product",
        url: "/admin/dashboard/product-management/add-product",
      },
      {
        title: "Add variant",
        url: "/admin/dashboard/product-management/add-variants",
      },
    ],
  },

  {
    title: "Inbox",
    subContent: [
      { title: "Overview", url: "#" },
      { title: "Overview", url: "#" },
    ],
  },

  {
    title: "Inventory management",
    subContent: [
      {
        title: "Update inventory",
        url: "/admin/dashboard/inventory-management/update-inventory",
      },
      { title: "Overview", url: "#" },
    ],
  },

  {
    title: "Search",
    subContent: [
      { title: "Overview", url: "#" },
      { title: "Overview", url: "#" },
    ],
  },

  {
    title: "Settings",
    subContent: [
      { title: "Overview", url: "#" },
      { title: "Overview", url: "#" },
    ],
  },
];

export default function AdminPanelSections() {
  const [openItem, setOpenItem] = useState<number | null>(null);
  const { setOpenMobile } = useSidebar();

  function handleclick() {
    const isMobile = window.innerWidth < 600;
    if (isMobile) {
      setOpenMobile(false);
    }
  }

  return (
    <div className="w-full h-full bg-white border-r">
      <Sidebar className="w-64 min-h-screen border-r bg-gray-50">
        <SidebarContent className="p-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Sections
            </SidebarGroupLabel>

            {items.map((item, index) => (
              <Collapsible
                key={index}
                open={openItem === index}
                onOpenChange={(isOpen) => setOpenItem(isOpen ? index : null)}
                className="mb-2 border rounded-md overflow-hidden bg-white shadow-sm"
              >
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-800 hover:bg-gray-100 transition-colors ">
                          {item.title}
                          <ChevronRight
                            className={`ml-2 h-4 w-4 transition-transform ${
                              openItem === index ? "rotate-90" : ""
                            }`}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="bg-gray-50">
                        <SidebarMenuSub className="ml-4 py-2 space-y-1">
                          {item.subContent?.map((subItem, subIndex) => (
                            <SidebarMenuSubItem key={subIndex}>
                              <Link
                                href={subItem.url}
                                onClick={handleclick}
                                className="block text-sm text-gray-700 px-3 py-1 rounded hover:bg-blue-100"
                              >
                                {subItem.title}
                              </Link>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </Collapsible>
            ))}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
