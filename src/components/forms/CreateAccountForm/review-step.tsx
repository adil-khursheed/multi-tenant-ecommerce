import type { UseFormGetValues } from "react-hook-form";

import {
  BankIcon,
  Location01Icon,
  Store01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utilities/cn";
import type { VendorOnboardingFormData } from "./vendor-onboarding-schema";

interface ReviewStepProps {
  getValues: UseFormGetValues<VendorOnboardingFormData>;
  onEditStep: (stepIndex: number) => void;
}

const ReviewStep = ({ getValues, onEditStep }: ReviewStepProps) => {
  const values = getValues();

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      {/* Business Profile */}
      <ReviewSection
        title="Business Profile"
        icon={Store01Icon}
        onEdit={() => onEditStep(0)}
      >
        <ReviewField label="Business Name" value={values.businessName} />
        <ReviewField label="Business Type" value={values.businessType} />
        <ReviewField label="Store Name" value={values.storeName} />
        <ReviewField label="Store Slug" value={values.storeSlug} />
        {values.storeLogo && (
          <ReviewField label="Store Logo" value="Uploaded" />
        )}
        <ReviewField label="PAN Number" value={values.panNumber} />
        {values.isGST && <ReviewField label="GSTIN" value={values.gst} />}
      </ReviewSection>

      <Separator />

      {/* Store Address */}
      <ReviewSection
        title="Store Address"
        icon={Location01Icon}
        onEdit={() => onEditStep(1)}
      >
        <ReviewField label="Address Line 1" value={values.addressLine1} />
        {values.addressLine2 && (
          <ReviewField label="Address Line 2" value={values.addressLine2} />
        )}
        <ReviewField label="Country" value={values.country?.name} />
        <ReviewField label="State" value={values.state?.name} />
        <ReviewField label="City" value={values.city} />
        <ReviewField label="Pincode" value={values.pincode} />
      </ReviewSection>

      <Separator />

      {/* Payment Info */}
      <ReviewSection
        title="Payment Information"
        icon={BankIcon}
        onEdit={() => onEditStep(2)}
      >
        <ReviewField
          label="Account Holder"
          value={values.bankAccountHolderName}
        />
        <ReviewField label="Account Number" value={values.bankAccountNumber} />
        <ReviewField label="IFSC Code" value={values.bankIfscCode} />
        <ReviewField label="Bank Name" value={values.bankName} />
        <ReviewField label="Branch" value={values.bankBranch} />
        <ReviewField
          label="Account Type"
          value={values.bankAccountType}
          className="capitalize"
        />
      </ReviewSection>
    </div>
  );
};

/* ---------- Sub-components ---------- */

function ReviewSection({
  title,
  icon,
  onEdit,
  children,
}: {
  title: string;
  icon: IconSvgElement;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon icon={icon} className="size-4" />
          </div>
          <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-foreground">
            {title}
          </h3>
        </div>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="text-xs uppercase tracking-widest text-primary"
          onClick={onEdit}
        >
          Edit
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function ReviewField({
  label,
  value,
  className,
}: {
  label: string;
  value?: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("text-sm font-medium text-foreground", className)}>
        {value || "—"}
      </dd>
    </div>
  );
}

export default ReviewStep;
