import {
  Control,
  Controller,
  UseFormClearErrors,
  UseFormSetError,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import {
  BankIcon,
  CheckmarkCircle01Icon,
  GlobalSearchIcon,
  Location01Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/trpc/client";
import { type VendorOnboardingFormData } from "@repo/validators";

const BankAccountInfoForm = ({
  control,
  setValue,
  watch,
  clearErrors,
  setError,
}: {
  control: Control<VendorOnboardingFormData>;
  setValue: UseFormSetValue<VendorOnboardingFormData>;
  watch: UseFormWatch<VendorOnboardingFormData>;
  clearErrors: UseFormClearErrors<VendorOnboardingFormData>;
  setError: UseFormSetError<VendorOnboardingFormData>;
}) => {
  const bankBranchAddress = watch("bankBranchAddress");
  const isIFSCVerified = watch("isIFSCVerified");

  const trpc = useTRPC();

  const { mutateAsync: verifyIFSC, isPending } = useMutation(
    trpc.vendor.verifyIFSC.mutationOptions({
      onSuccess: async (data) => {
        if (data) {
          setValue("bankName", data.BANK);
          setValue("bankBranch", data.BRANCH);
          setValue("bankBranchAddress", data.ADDRESS);
          setValue("isIFSCVerified", true);
        }
      },
      onError: (error) => {
        try {
          // TRPC often stringifies Zod errors into an array of issue objects in error.message
          const parsedError = JSON.parse(error.message);
          if (
            Array.isArray(parsedError) &&
            parsedError.length > 0 &&
            parsedError[0].message
          ) {
            setError("bankIfscCode", {
              type: "manual",
              message: parsedError[0].message,
            });
          } else {
            setError("bankIfscCode", {
              type: "manual",
              message: error.message,
            });
          }
        } catch (e) {
          // Fallback to the raw string if it's not JSON
          setError("bankIfscCode", {
            type: "manual",
            message: error.message,
          });
        }
      },
    }),
  );

  return (
    <>
      <Controller
        control={control}
        name="bankAccountHolderName"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Bank Account Holder Name
            </FieldLabel>
            <InputGroup aria-invalid={fieldState.invalid} className="h-12">
              <InputGroupInput
                {...field}
                id="signup-bank-account-holder-name"
                placeholder="Bank Account Holder Name"
              />
              <InputGroupAddon>
                <HugeiconsIcon icon={User02Icon} />
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="bankAccountNumber"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Bank Account Number
            </FieldLabel>
            <InputGroup aria-invalid={fieldState.invalid} className="h-12">
              <InputGroupInput
                {...field}
                id="signup-bank-account-number"
                placeholder="Bank Account Number"
              />
              <InputGroupAddon>
                <HugeiconsIcon icon={BankIcon} />
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="bankIfscCode"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              IFSC Code
            </FieldLabel>
            <InputGroup
              aria-disabled={isPending}
              aria-invalid={fieldState.invalid}
              className="h-12"
            >
              <InputGroupInput
                {...field}
                id="signup-bank-ifsc-code"
                placeholder="IFSC Code"
                disabled={isPending}
                autoCapitalize="characters"
                onChange={(e) => {
                  clearErrors("bankIfscCode");
                  if (isIFSCVerified) {
                    setValue("bankName", "");
                    setValue("bankBranch", "");
                    setValue("bankBranchAddress", "");
                    setValue("isIFSCVerified", false);
                  }
                  field.onChange(e.target.value.toUpperCase());
                }}
              />
              <InputGroupAddon>
                <HugeiconsIcon icon={GlobalSearchIcon} />
              </InputGroupAddon>

              <InputGroupAddon align={"inline-end"}>
                <InputGroupButton
                  variant={"link"}
                  size={"sm"}
                  disabled={isPending || isIFSCVerified}
                  onClick={async () =>
                    await verifyIFSC({ ifsc: field.value.toUpperCase() })
                  }
                >
                  {isPending ? (
                    <Spinner />
                  ) : isIFSCVerified ? (
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      className="text-green-500"
                    />
                  ) : (
                    "Verify"
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {bankBranchAddress && (
              <FieldDescription className="text-[10px] font-medium text-green-500">
                {bankBranchAddress}
              </FieldDescription>
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="bankName"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Bank Name
            </FieldLabel>
            <InputGroup
              aria-disabled={true}
              aria-invalid={fieldState.invalid}
              className="h-12"
            >
              <InputGroupInput
                {...field}
                id="signup-bank-name"
                placeholder="Bank Name"
              />
              <InputGroupAddon>
                <HugeiconsIcon icon={BankIcon} />
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="bankBranch"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Bank Branch
            </FieldLabel>
            <InputGroup
              aria-disabled={true}
              aria-invalid={fieldState.invalid}
              className="h-12"
            >
              <InputGroupInput
                {...field}
                id="signup-bank-branch"
                placeholder="Bank Branch"
              />
              <InputGroupAddon>
                <HugeiconsIcon icon={Location01Icon} />
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="bankAccountType"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Bank Account Type
            </FieldLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <SelectTrigger className="py-6">
                <SelectValue
                  placeholder="Select Bank Account Type"
                  className={"capitalize"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings" className={"min-h-10"}>
                  Savings
                </SelectItem>
                <SelectItem value="current" className={"min-h-10"}>
                  Current
                </SelectItem>
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  );
};

export default BankAccountInfoForm;
