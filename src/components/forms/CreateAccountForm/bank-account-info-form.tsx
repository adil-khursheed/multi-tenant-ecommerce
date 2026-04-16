import { Control, Controller } from "react-hook-form";

import {
  BankIcon,
  GlobalSearchIcon,
  Location01Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
import { type CreateAccountFormData } from "./createAccountSchema";

const BankAccountInfoForm = ({
  control,
}: {
  control: Control<CreateAccountFormData>;
}) => {
  return (
    <>
      <Controller
        control={control}
        name="bankAccountHolderName"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="text-xs uppercase tracking-[0.15em]">
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
            <FieldLabel className="text-xs uppercase tracking-[0.15em]">
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
            <FieldLabel className="text-xs uppercase tracking-[0.15em]">
              IFSC Code
            </FieldLabel>
            <InputGroup aria-invalid={fieldState.invalid} className="h-12">
              <InputGroupInput
                {...field}
                id="signup-bank-ifsc-code"
                placeholder="IFSC Code"
              />
              <InputGroupAddon>
                <HugeiconsIcon icon={GlobalSearchIcon} />
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="bankName"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="text-xs uppercase tracking-[0.15em]">
              Bank Name
            </FieldLabel>
            <InputGroup aria-invalid={fieldState.invalid} className="h-12">
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
            <FieldLabel className="text-xs uppercase tracking-[0.15em]">
              Bank Branch
            </FieldLabel>
            <InputGroup aria-invalid={fieldState.invalid} className="h-12">
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
            <FieldLabel className="text-xs uppercase tracking-[0.15em]">
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
