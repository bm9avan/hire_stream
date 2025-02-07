import { Button } from "@/components/ui/button"; // Assuming ShadCN button component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Edit } from "lucide-react";
import useAuth from "@/hooks/useAuth";

const UserCard = ({ user, isMe = false }) => {
  const navigate = useNavigate();
  const { handleSignout } = useAuth();

  return (
    <div className="flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md lg:max-w-lg">
        <Card className="shadow-lg rounded-lg relative">
          {/* Edit Icon for the Current User */}
          {isMe && (
            <div
              className="absolute top-2 right-2 cursor-pointer text-primary hover:text-primary/80"
              onClick={() => navigate("/account")}
            >
              <Edit className="w-5 h-5" />
            </div>
          )}

          <CardHeader className="flex flex-col items-center">
            {/* <img
              src={user.profileImageUrl}
              alt="User"
              className="w-24 h-24 rounded-full border-2 border-primary mb-4"
            /> */}
            <Avatar className="h-24 w-24 rounded-lg">
              <AvatarImage src={user.profileImageUrl} alt={user.name} />
              <AvatarFallback className="rounded-lg">
                {user.name.split(" ").join("").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-semibold">
                {user.name}
              </CardTitle>
              {user.verified ? (
                <CheckCircle className="text-green-500 w-5 h-5" />
              ) : (
                <XCircle className="text-red-500 w-5 h-5" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* User Details */}
              {user.college && user.branch && (
                <div className="flex justify-center flex-row items-center gap-4 bg-muted p-4 rounded-md">
                  <img
                    src={user.college.logoUrl}
                    alt={user.college.name}
                    className="w-8 h-8"
                  />
                  <span className="text-sm text-accent-foreground">
                    {`${user.college.name} (${user.branch.name})`}
                  </span>
                </div>
              )}

              {user.email && (
                <div className="flex justify-between flex-row items-start sm:items-center gap-2 bg-muted p-4 rounded-md">
                  <span className="font-medium capitalize text-sm text-muted-foreground">
                    EMAIL
                  </span>
                  <a
                    target="_blank"
                    href={`mailto:${user.email}`}
                    className="text-sm text-accent-foreground break-words"
                  >
                    {user.email}
                  </a>
                </div>
              )}

              {user.phoneNo && (
                <div className="flex justify-between flex-row items-start sm:items-center gap-2 bg-muted p-4 rounded-md">
                  <span className="font-medium capitalize text-sm text-muted-foreground">
                    PHONE NUMBER
                  </span>
                  <a
                    target="_blank"
                    href={`https://wa.me/${user.phoneNo}`}
                    className="text-sm text-accent-foreground break-words"
                  >
                    {user.phoneNo}
                  </a>
                </div>
              )}

              {user.dob && (
                <div className="flex justify-between flex-row items-start sm:items-center gap-2 bg-muted p-4 rounded-md">
                  <span className="font-medium capitalize text-sm text-muted-foreground">
                    DATE OF BIRTH
                  </span>
                  <span className="text-sm text-accent-foreground break-words">
                    {user.dob}
                  </span>
                </div>
              )}
            </div>

            {/* Sign Out Button for the Current User */}
            {isMe && (
              <div className="mt-6 flex justify-center">
                <Button
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleSignout}
                >
                  Sign Out
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserCard;
