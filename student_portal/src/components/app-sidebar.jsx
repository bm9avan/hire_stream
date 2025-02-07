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
      {
        name: "Public Openings",
        logo: "https://icon-library.com/images/jobs-icon-png/jobs-icon-png-5.jpg",
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Job Openings",
        url: "/jobs",
        icon: Briefcase,
        isActive: true,
        items: [
          {
            title: "Browse Jobs",
            url: "/jobs",
          },
          // {
          //   title: "Saved Jobs",
          //   url: "/jobs/saved",
          // },
        ],
      },
      {
        title: "Applications",
        url: "/applications",
        icon: FileText,
        items: [
          {
            title: "View Applications",
            url: "/applications",
          },
          // {
          //   title: "Application Status",
          //   url: "/applications/status",
          // },
        ],
      },
      {
        title: "Assessments",
        url: "/assessments",
        icon: FormInput,
        items: [
          {
            title: "Scheduled Tests",
            url: "/assessments",
          },
          // {
          //   title: "Practice Tests",
          //   url: "/assessments/practice",
          // },
        ],
      },
      {
        title: "Interviews",
        url: "/interviews",
        icon: Users,
        items: [
          {
            title: "Scheduled Interviews",
            url: "/interviews",
          },
          {
            title: "Mock Interviews",
            url: "/interviews/mock",
          },
        ],
      },
      {
        title: "Companies",
        url: "/comapanies",
        icon: Building,
        isActive: true,
        items: [
          {
            title: "Companies List",
            url: "/companies",
          },
        ],
      },
      {
        title: "Offers",
        url: "/selected",
        icon: Gift,
        items: [
          {
            title: "Rejected Offers",
            url: "/rejected",
          },
          {
            title: "Accepted Offers",
            url: "/selected",
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
