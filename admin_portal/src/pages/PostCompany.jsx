import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, Loader2, Upload, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { editActions } from "@/redux/edit/editSlice";

const CompanyForm = () => {
  const dispatch = useDispatch();
  const cId = useSelector((state) => state.edit.cId);
  console.log(cId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [logoInputType, setLogoInputType] = useState("upload"); // 'upload' or 'url'

  const {
    register,
    handleSubmit: formSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  useEffect(() => {
    if (cId) {
      setValue("name", cId.name);
      setValue("description", cId.description);
      if (cId.logoUrl) {
        setLogoInputType("url");
        setValue("logoUrl", cId.logoUrl);
        setPreviewUrl(cId.logoUrl);
      }
    }
  }, [cId, setValue]);

  const generateCompanyId = () => {
    return "COM" + Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setValue("logoUrl", "");
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      if (cId) {
        formData.append("companyId", cId.companyId);
      } else {
        formData.append("companyId", generateCompanyId());
      }
      formData.append("name", data.name);
      formData.append("description", data.description);

      if (logoInputType === "upload" && selectedImage) {
        formData.append("logo", selectedImage);
      } else if (logoInputType === "url" && data.logoUrl) {
        formData.append("logoUrl", data.logoUrl);
      }
      console.log(formData);
      const response = await fetch(
        `/api/companies${cId ? `/${cId.companyId}` : ""}`,
        {
          method: cId ? "PUT" : "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${cId ? "update" : "add"} company`);
      }

      setSuccess(true);
      // if (!cId) {
      reset();
      clearImage();
      // }
      dispatch(editActions.endEditingCompany());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const logoUrl = watch("logoUrl");

  return (
    <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-900 p-8">
      <div className="w-full max-w-xl mx-auto">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              <CardTitle>Add New Company</CardTitle>
            </div>
            <CardDescription>
              Enter the company details to add them to the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={formSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  {...register("name", {
                    required: "Company name is required",
                  })}
                  placeholder="Enter company name"
                />
                {errors.name && (
                  <span className="text-sm text-red-500">
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Enter company description"
                  className="h-16"
                />
              </div>

              <div className="space-y-4">
                <Label>Logo Input Method</Label>
                <RadioGroup
                  defaultValue="upload"
                  className="flex gap-4"
                  onValueChange={setLogoInputType}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="upload" />
                    <Label htmlFor="upload">Upload Image</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="url" id="url" />
                    <Label htmlFor="url">Enter URL</Label>
                  </div>
                </RadioGroup>

                {logoInputType === "url" ? (
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      {...register("logoUrl")}
                      placeholder="Enter logo URL"
                      type="url"
                    />
                    {logoUrl && (
                      <div className="mt-2">
                        <img
                          src={logoUrl}
                          alt="Logo preview"
                          className="max-h-48 rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            setError("Invalid image URL");
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex flex-col items-center gap-2">
                      {!previewUrl ? (
                        <>
                          <Upload className="h-6 w-6 text-gray-400" />
                          <div className="text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              className="relative"
                              onClick={() =>
                                document.getElementById("logo").click()
                              }
                            >
                              <span>Choose Image</span>
                              <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                              />
                            </Button>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-48 rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="absolute -top-2 -right-2"
                            onClick={clearImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100 border-green-200 dark:border-green-800">
                  <AlertDescription>
                    Company {cId ? "updated" : "added"} successfully!
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    clearImage();
                    dispatch(editActions.endEditingCompany());
                  }}
                  disabled={isSubmitting}
                >
                  {cId ? "Cancel" : "Reset"}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {cId ? "Updating..." : "Adding..."}
                    </>
                  ) : cId ? (
                    "Update Company"
                  ) : (
                    "Add Company"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyForm;
