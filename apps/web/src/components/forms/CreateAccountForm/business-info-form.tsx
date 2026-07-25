import { Activity, useCallback, useEffect, useState } from "react";
import {
  Control,
  Controller,
  UseFormClearErrors,
  UseFormSetError,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import {
  Briefcase06Icon,
  Cancel01Icon,
  Globe02Icon,
  ImageAdd01Icon,
  ImageAdd02Icon,
  PassportIcon,
  Store01Icon,
  TaxesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";

import { businessTypes } from "@repo/types";
import { VendorOnboardingFormData } from "@repo/validators";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { env } from "@/env";
import { useTRPC } from "@/trpc/client";
import { formatSlug } from "@/utilities/formatSlug";

const BusinessInfoForm = ({
  control,
  setValue,
  watch,
  setError,
  clearErrors,
}: {
  control: Control<VendorOnboardingFormData>;
  setValue: UseFormSetValue<VendorOnboardingFormData>;
  watch: UseFormWatch<VendorOnboardingFormData>;
  setError: UseFormSetError<VendorOnboardingFormData>;
  clearErrors: UseFormClearErrors<VendorOnboardingFormData>;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const watchedIsGST = watch("isGST");
  const watchedStoreSlug = watch("storeSlug");

  const trpc = useTRPC();

  const handleFile = (
    file: File,
    onChange: (...events: any[]) => void,
    size: number,
  ) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    if (file.size > size * 1024 * 1024) {
      alert(`File must be less than ${size}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onChange(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    onChange: (...events: any[]) => void,
    size: number,
  ) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file, onChange, size);
  };

  const { mutate: checkExistingSlug } = useMutation(
    trpc.vendor.checkExistingSlug.mutationOptions({
      onSuccess: (data) => {
        if (data.exists) {
          setError("storeSlug", {
            type: "manual",
            message: "Store slug already exists",
          });
        } else {
          clearErrors("storeSlug");
        }
      },
    }),
  );

  const slugTransform = useCallback((value?: string) => {
    if (value && typeof value === "string") return formatSlug(value);

    return "";
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "storeName") {
        setValue("storeSlug", slugTransform(value?.storeName), {
          shouldValidate: true,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  useEffect(() => {
    if (!watchedStoreSlug) return;

    const handler = setTimeout(() => {
      checkExistingSlug({ storeSlug: watchedStoreSlug });
    }, 500);

    return () => clearTimeout(handler);
  }, [watchedStoreSlug, checkExistingSlug]);

  return (
    <>
      <div className="flex items-center gap-6">
        <Controller
          control={control}
          name="storeLogo"
          render={({ field: { value, onChange, ...rest }, fieldState }) => {
            return (
              <Field data-invalid={fieldState.invalid} className="size-36">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => handleDrop(e, onChange, 2)}
                  className={`relative flex h-full w-36 shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl border border-primary bg-primary/5 transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/10"
                      : fieldState.invalid
                        ? "border-destructive bg-destructive/5"
                        : "border-muted-foreground/20 hover:border-primary/50 hover:bg-accent/50"
                  }`}
                >
                  <input
                    {...rest}
                    id="signup-storeLogo"
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFile(file, onChange, 2);
                      } else {
                        onChange(undefined);
                      }
                      e.target.value = ""; // Reset input so the same file can be selected again
                    }}
                  />

                  {value ? (
                    <div className="relative h-full w-full p-2">
                      <img
                        src={value}
                        alt="Store Logo Preview"
                        className="h-full w-full rounded-lg object-contain"
                      />
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onChange(undefined);
                        }}
                        variant={"secondary"}
                        size={"icon"}
                        className="absolute right-2 top-2 z-20 rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-colors"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground p-3">
                      <div className="p-3 text-primary">
                        <HugeiconsIcon
                          icon={ImageAdd01Icon}
                          className="size-7"
                        />
                      </div>
                    </div>
                  )}
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
        />

        <div>
          <p className="font-semibold text-sm">Store Logo</p>
          <p className="text-xs text-muted-foreground">
            Used as your artisan avatar. Recommend a square image, at least
            400x400px.
          </p>
        </div>
      </div>

      <Controller
        control={control}
        name="storeBanner"
        render={({ field: { value, onChange, ...rest }, fieldState }) => {
          return (
            <Field data-invalid={fieldState.invalid} className="col-span-2">
              <FieldLabel className="text-xs uppercase tracking-[0.15em]">
                Store Banner
              </FieldLabel>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => handleDrop(e, onChange, 4)}
                className={`relative flex h-40 w-full shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/10"
                    : fieldState.invalid
                      ? "border-destructive bg-destructive/5"
                      : "border-muted-foreground/20 hover:border-primary/50 hover:bg-accent/50"
                }`}
              >
                <input
                  {...rest}
                  id="signup-storeBanner"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFile(file, onChange, 4);
                    } else {
                      onChange(undefined);
                    }
                    e.target.value = ""; // Reset input so the same file can be selected again
                  }}
                />

                {value ? (
                  <div className="relative h-full w-full p-2">
                    <img
                      src={value}
                      alt="Store Banner Preview"
                      className="h-full w-full rounded-lg object-contain"
                    />
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChange(undefined);
                      }}
                      variant={"secondary"}
                      size={"icon"}
                      className="absolute right-2 top-2 z-20 rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-colors"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground p-3">
                    <div className="flex flex-col items-center justify-center gap-2 p-3 text-primary">
                      <HugeiconsIcon icon={ImageAdd02Icon} className="size-7" />
                      <p className="text-sm text-primary">
                        Click to upload banner image
                      </p>
                      <p className="text-xs text-secondary">
                        1200px x 400px recommended
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          );
        }}
      />

      <Controller
        control={control}
        name="businessName"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Business Name
            </FieldLabel>
            <InputGroup aria-invalid={fieldState.invalid} className="h-12">
              <InputGroupInput
                {...field}
                id="signup-businessName"
                placeholder="Acme Inc."
              />
              <InputGroupAddon align={"inline-start"}>
                <HugeiconsIcon icon={Briefcase06Icon} />
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="businessType"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Business Type
            </FieldLabel>
            <Select
              items={businessTypes}
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="py-6" aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Select Business Type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((businessType) => (
                  <SelectItem
                    key={businessType.value}
                    value={businessType.value}
                  >
                    {businessType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="storeName"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Store Name
            </FieldLabel>
            <InputGroup aria-invalid={fieldState.invalid} className="h-12">
              <InputGroupInput
                {...field}
                id="signup-storeName"
                placeholder="Acme"
              />
              <InputGroupAddon align={"inline-start"}>
                <HugeiconsIcon icon={Store01Icon} />
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="storeSlug"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Store Slug
            </FieldLabel>
            <InputGroup aria-invalid={fieldState.invalid} className="h-12">
              <InputGroupInput
                {...field}
                id="signup-storeSlug"
                placeholder="Acme"
                onInput={(e) => {
                  setValue("storeSlug", slugTransform(e.currentTarget.value), {
                    shouldValidate: true,
                  });
                }}
              />
              <InputGroupAddon align={"inline-start"}>
                <HugeiconsIcon icon={Globe02Icon} />
              </InputGroupAddon>
            </InputGroup>
            <Activity
              mode={
                watchedStoreSlug && !fieldState.invalid ? "visible" : "hidden"
              }
            >
              <FieldDescription>
                Your store will be available at{" "}
                <span className="font-bold">{watchedStoreSlug}</span>.
                {env.NEXT_PUBLIC_SERVER_URL.split("//")[1]}
              </FieldDescription>
            </Activity>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="panNumber"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Permanent Account Number (PAN)
            </FieldLabel>
            <InputGroup aria-invalid={fieldState.invalid} className="h-12">
              <InputGroupInput
                {...field}
                id="signup-panNumber"
                placeholder="Personal or Business PAN"
                onChange={(e) => {
                  field.onChange(e.target.value.toUpperCase());
                }}
              />
              <InputGroupAddon>
                <HugeiconsIcon icon={PassportIcon} />
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="isGST"
        render={({ field, fieldState }) => (
          <FieldSet data-invalid={fieldState.invalid}>
            <FieldLegend variant="label">Do you have GST?</FieldLegend>
            <FieldGroup data-slot="checkbox-group">
              <Field orientation="horizontal">
                <Checkbox
                  id="form-rhf-checkbox-responses"
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (!checked) {
                      setValue("gst", "");
                    }
                  }}
                />
                <FieldLabel
                  htmlFor="form-rhf-checkbox-responses"
                  className="font-normal"
                >
                  Yes
                </FieldLabel>
              </Field>
            </FieldGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldSet>
        )}
      />

      <Activity mode={watchedIsGST ? "visible" : "hidden"}>
        <Controller
          control={control}
          name="gst"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs uppercase tracking-[0.15em]">
                GSTIN
              </FieldLabel>
              <InputGroup aria-invalid={fieldState.invalid} className="h-12">
                <InputGroupInput
                  {...field}
                  id="signup-gst"
                  placeholder="Goods & Services Tax Identification Number"
                  autoCapitalize="characters"
                  onChange={(e) => {
                    field.onChange(e.target.value.toUpperCase());
                  }}
                />
                <InputGroupAddon>
                  <HugeiconsIcon icon={TaxesIcon} />
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </Activity>
    </>
  );
};

export default BusinessInfoForm;
