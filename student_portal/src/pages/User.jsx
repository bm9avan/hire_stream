import { Button } from "@/components/ui/button"; // Assuming ShadCN button component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, XCircle, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import UserCard from "@/components/non-shadcn/UserCard";

const User = ({ user: userMe }) => {
  const { userId } = useParams();
  const isMe = userId === userMe.uid;
  const navigate = useNavigate();
  console.log("isme", isMe, userId, userMe.uid, userMe.profileImageUrl);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (isMe) {
      setUser(userMe);
      setLoading(false);
    } else {
      setLoading(true);
      fetch(`/api/user/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
          setUser(null);
          // navigate("/404");
        });
    }
  }, [userId, isMe, navigate]);

  if (loading) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <p className="text-center text-lg">User not found</p>
      </div>
    );
  }

  return <UserCard user={user} isMe={isMe} />;
};

export default User;
