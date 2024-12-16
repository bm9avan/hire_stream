import { Button } from "@/components/ui/button";
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../../redux/user/userSlice";
// import { use//navigate } from "react-router-dom";

export default function OAuth() {
  const dispatch = useDispatch();
  //   const //navigate = use//navigate();
  const auth = getAuth(app);
  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      //console.log(resultsFromGoogle.user.photoURL)
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(data);
        dispatch(signInSuccess(data));
        //navigate("/");
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <Button
      type="button"
      //   gradientDuoTone="pinkToOrange"
      className="w-full text-xl text-center flex items-center justify-center"
      onClick={handleGoogleClick}
    >
      <AiFillGoogleCircle className="w-12 h-12 mr-2" />
      Continue with Google
    </Button>
  );
}
