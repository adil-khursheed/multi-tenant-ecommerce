import { Activity, useCallback, useEffect } from "react";
import {
  Control,
  Controller,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import {
  Briefcase06Icon,
  Globe02Icon,
  PassportIcon,
  Store01Icon,
  TaxesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
import { VendorOnboardingFormData } from "./vendor-onboarding-schema";

const businessTypes = [
  { value: "individual", label: "Individual" },
  { value: "partnership", label: "Partnership" },
  { value: "proprietorship", label: "Proprietorship" },
  { value: "llp", label: "LLP" },
  { value: "private_limited", label: "Private Limited" },
  { value: "public_limited", label: "Public Limited" },
  { value: "ngo", label: "NGO" },
  { value: "trust", label: "Trust" },
  { value: "society", label: "Society" },
  { value: "educational_institutes", label: "Educational Institutes" },
  { value: "not_yet_registered", label: "Not Yet Registered" },
  { value: "other", label: "Other" },
];

const BusinessInfoForm = ({
  control,
  setValue,
  watch,
}: {
  control: Control<VendorOnboardingFormData>;
  setValue: UseFormSetValue<VendorOnboardingFormData>;
  watch: UseFormWatch<VendorOnboardingFormData>;
}) => {
  const watchedIsGST = watch("isGST");
  const watchedStoreSlug = watch("storeSlug");

  const slugTransform = useCallback((value?: string) => {
    if (value && typeof value === "string")
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-");

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

  return (
    <>
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
              onValueChange={field.onChange}
              value={field.value}
              aria-invalid={fieldState.invalid}
            >
              <SelectTrigger className="py-6">
                <SelectValue
                  placeholder="Select Business Type"
                  className={"capitalize"}
                />
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
        name="storeLogo"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="text-xs uppercase tracking-[0.15em]">
              Store Logo
            </FieldLabel>
            <InputGroup aria-invalid={fieldState.invalid} className="h-12">
              <InputGroupInput {...field} id="signup-storeLogo" type="file" />
            </InputGroup>
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
