import React from "react";
import {
  signInFailure,
  signInStart,
  signInSuccess,
  signoutSuccess,
} from "@/redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  console.log("outer", user);

  async function handelSignUp(formData) {
    try {
      // setLoading(true);
      // setErrorMessage(null);
      dispatch(signInStart());
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const response = await res.json();
      // setErrorMessage(response.message);
      // if (response.success === false) {
      //     dispatch(signInFailure(response.message))
      // }
      //setLoading(false);
      if (res.ok) {
        dispatch(signInSuccess(response));
        navigate("/account");
      } else {
        dispatch(
          signInFailure(
            response.message || "An error occurred. Please try again."
          )
        );
      }
    } catch (err) {
      // setErrorMessage(err.message);
      // setLoading(false);
      dispatch(signInFailure(err.message));
    }
  }

  async function handelSignIn(formData) {
    try {
      // setLoading(true);
      // setErrorMessage(null);
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      console.log(res, res.error, res.message);
      const response = await res.json();
      console.log(response);
      // setErrorMessage(response.message);

      // if (response.success === false) {
      //     dispatch(signInFailure(response.message))
      // }
      //setLoading(false);
      if (res.ok) {
        dispatch(signInSuccess(response));
        navigate("/");
      } else {
        dispatch(
          signInFailure(
            response.message || "An error occurred. Please try again."
          )
        );
      }
    } catch (err) {
      // setErrorMessage(err.message);
      // setLoading(false);
      dispatch(signInFailure(err.message));
    }
  }

  async function fetchUser() {
    console.log("inside fetchUser");
    try {
      dispatch(signInStart());
      const res = await fetch("/api/user/isVerified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const response = await res.json();
      if (res.ok) {
        console.log(response);
        dispatch(signInSuccess(response));
        // navigate("/");
      } else {
        dispatch(
          signInFailure(
            response.message || "An error occurred. Please try again."
          )
        );
      }
    } catch (err) {
      console.log(err);
      dispatch(signInFailure(err.message));
    }
  }

  async function handleSignout() {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
        navigate("/sign-in");
        // window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  }

  return {
    fetchUser,
    handelSignUp,
    handelSignIn,
    handleSignout,
  };
};

export default useAuth;
