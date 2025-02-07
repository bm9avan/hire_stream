import {
  Briefcase,
  Building,
  FileText,
  FormInput,
  Frame,
  Gift,
  Map,
  PieChart,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ user, ...props }) {
  console.log(user.profileImageUrl);
  const data = {
    user: {
      uid: user.uid,
      name: user.name,
      email: user.email,
      avatar: user.profileImageUrl,
    },
    teams: [
      {
        name: user.college.name,
        logo: user.college.logoUrl,
        plan: user.college.collegeId,
      },
    ],
    navMain: [
      {
        title: "Companies",
        url: "/companies",
        icon: Building,
        isActive: true,
        items: [
          {
            title: "Companies List",
            url: "/companies",
          },
          {
            title: "Add Company",
            url: "/forms/company",
          },
        ],
      },
      {
        title: "Jobs",
        url: "/jobs",
        icon: Briefcase,
        isActive: true,
        items: [
          {
            title: "Jobs List",
            url: "/jobs",
          },
          {
            title: "Webinar Requested",
            url: "/jobs?tab=webinar",
          },
          {
            title: "Post Job",
            url: "/forms/job",
          },
        ],
      },
      {
        title: "Users",
        url: "/team",
        icon: Users,
        items: [
          {
            title: "User Verification",
            url: "/verify",
          },
          {
            title: "Manage Users",
            url: "/team",
          },
        ],
      },
    ],

    projects: [
      {
        name: "Privacy Policy",
        url: "#",
        icon: Frame,
      },
      {
        name: "Terms & Conditions",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Cookie Policy",
        url: "#",
        icon: Map,
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
