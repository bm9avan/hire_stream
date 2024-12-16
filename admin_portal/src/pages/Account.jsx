import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  updateStart,
  updateSuccess,
  updateFailure,
} from "@/redux/user/userSlice";
import useAuth from "@/hooks/useAuth";

export default function Account() {
  const {
    currentUser: { college, branch, ...currentUser },
    loading,
    error,
  } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const filePickerRef = useRef();
  const { handleSignout } = useAuth();

  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    setUploading(true);
    setErrorMessage(null);

    const fakeUpload = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(fakeUpload);
          setUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    const formData = new FormData();
    formData.append("userimg", imageFile);

    try {
      const res = await fetch(`/api/user/upload/profile`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setUploading(false);
        setFormData((prev) => ({
          ...prev,
          profileImageUrl: data.url,
        }));
      }
      dispatch(updateSuccess(data));
    } catch (err) {
      setUploading(false);
      setErrorMessage(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (uploading) {
      setErrorMessage("Please wait for the image upload to complete.");
      return;
    }

    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message);
      }
      const updatedUser = await res.json();
      dispatch(updateSuccess(updatedUser));
      setSuccessMessage("Profile updated successfully.");
    } catch (err) {
      dispatch(updateFailure(err.message));
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="flex-1 flex w-full items-center justify-center px-4">
      <div className="w-full max-w-md lg:max-w-lg">
        <div className="bg-card border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-center mb-6">
            Edit Profile
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-gray-300 cursor-pointer"
              onClick={() => filePickerRef.current.click()}
            >
              {uploading && (
                <CircularProgressbar
                  value={uploadProgress}
                  text={`${uploadProgress}%`}
                  strokeWidth={5}
                />
              )}
              <img
                src={imageFileUrl || currentUser.profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={filePickerRef}
              onChange={handleImageChange}
              hidden
            />

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="uid" className="font-medium">
                  UserName
                </label>
                <Input
                  id="uid"
                  type="text"
                  placeholder="Enter your uid"
                  defaultValue={currentUser.uid}
                  onChange={handleInputChange}
                  className="bg-muted text-muted-foreground"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="email" className="font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  defaultValue={currentUser.email}
                  onChange={handleInputChange}
                  className="bg-muted text-muted-foreground"
                />
              </div>

              {college && branch && (
                <div className="flex justify-between bg-muted p-4 rounded-md">
                  <span className="text-sm font-medium text-muted-foreground">
                    College
                  </span>
                  <span className="text-sm text-accent-foreground">{`${college.name} (${branch.name})`}</span>
                </div>
              )}

              {errorMessage && (
                <div
                  className={`mt-5 ${
                    errorMessage.includes("successfully")
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || uploading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>

          {successMessage && (
            <p className="mt-4 text-green-500 text-center">{successMessage}</p>
          )}
          {errorMessage && (
            <p className="mt-4 text-red-500 text-center">{errorMessage}</p>
          )}

          <div className="mt-6 flex justify-center">
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleSignout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
