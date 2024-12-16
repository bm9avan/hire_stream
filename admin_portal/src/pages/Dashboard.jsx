import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/useAuth";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";

export default function Dashboard({ user }) {
  const { fetchUser } = useAuth();
  const navigate = useNavigate();

  const { loading, error: errorMessage } = useSelector((state) => state.user);
  useEffect(() => {
    console.log("inside useEffect");

    if (user.verified === false) {
      console.log("user not verified");
      fetchUser();
    }
  }, []);

  const pathArray = location.pathname.split("/").filter((x) => x.length > 0);
  console.log(pathArray.slice(0, pathArray.length - 1).join("/"), pathArray);

  return (
    <SidebarProvider className="h-screen">
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  {pathArray.length === 0 ? (
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink onClick={() => navigate("/")}>
                      Dashboard
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {pathArray.slice(0, pathArray.length - 1).map((x, i) => {
                  console.log("each", x, i);
                  return (
                    <>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          onClick={() =>
                            navigate(pathArray.slice(0, i + 1).join("/"))
                          }
                        >
                          {x.charAt(0).toUpperCase() + x.slice(1)}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </>
                  );
                })}
                {pathArray.length > 0 && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {pathArray[pathArray.length - 1]
                          .charAt(0)
                          .toUpperCase() +
                          pathArray[pathArray.length - 1].slice(1)}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex justify-end items-center space-x-4 p-2">
            <ModeToggle />
          </div>
        </header>
        {/* {loading ? (
          <div className="flex flex-1 justify-center items-center">
            <Loader className="animate-spin" />
          </div>
        ) : ( */}
        <Outlet />
        {/* )} */}
      </SidebarInset>
    </SidebarProvider>
  );
}
