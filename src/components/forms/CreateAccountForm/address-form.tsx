import { useMemo } from "react";
import {
  Control,
  Controller,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import { UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { City, Country, State } from "country-state-city";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type CreateAccountFormData } from "./createAccountSchema";

const AddressForm = ({
  control,
  watch,
  setValue,
}: {
  control: Control<CreateAccountFormData>;
  watch: UseFormWatch<CreateAccountFormData>;
  setValue: UseFormSetValue<CreateAccountFormData>;
}) => {
  const watchedCountry = watch("country");
  const watchedState = watch("state");

  const countries = Country.getAllCountries();

  const states = useMemo(() => {
    if (!watchedCountry?.isoCode) return [];
    return State.getStatesOfCountry(watchedCountry.isoCode);
  }, [watchedCountry]);

  const cities = useMemo(() => {
    if (!watchedCountry?.isoCode || !watchedState?.isoCode) return [];
    return City.getCitiesOfState(watchedCountry.isoCode, watchedState.isoCode);
  }, [watchedCountry, watchedState]);

  return (
    <>
      <Controller
        control={control}
        name="addressLine1"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Address 1
            </FieldLabel>
            <InputGroup aria-invalid={fieldState.invalid} className="h-12">
              <InputGroupInput
                {...field}
                id="signup-addressLine1"
                placeholder="e.g. 123 Main St"
              />
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="addressLine2"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="text-xs uppercase tracking-[0.15em]">
              Address 2
            </FieldLabel>
            <InputGroup aria-invalid={fieldState.invalid} className="h-12">
              <InputGroupInput
                {...field}
                id="signup-addressLine2"
                placeholder="e.g. Near Post Office"
              />
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="country"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Country
            </FieldLabel>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 justify-between border border-input bg-input/20"
                  >
                    {field.value?.name || "Select Country"}
                    <HugeiconsIcon
                      icon={UnfoldMoreIcon}
                      strokeWidth={2}
                      className="pointer-events-none size-3.5 text-muted-foreground"
                    />
                  </Button>
                }
              />
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {countries.map((country) => (
                        <CommandItem
                          key={country.isoCode}
                          value={country.name} // Command filters on this
                          onSelect={() => {
                            // ✅ You control exactly what gets set
                            field.onChange({
                              name: country.name,
                              isoCode: country.isoCode,
                            });
                            // ✅ Cascade reset
                            setValue("state", { name: "", isoCode: "" });
                            setValue("city", "");
                          }}
                          data-checked={
                            field.value?.isoCode === country.isoCode
                          }
                        >
                          {country.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Field orientation={"horizontal"} className="gap-6">
        <Controller
          control={control}
          name="state"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                required
                className="text-xs uppercase tracking-[0.15em]"
              >
                State
              </FieldLabel>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 justify-between border border-input bg-input/20"
                    >
                      {field.value?.name || "Select State"}
                      <HugeiconsIcon
                        icon={UnfoldMoreIcon}
                        strokeWidth={2}
                        className="pointer-events-none size-3.5 text-muted-foreground"
                      />
                    </Button>
                  }
                />
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search state..." />
                    <CommandList>
                      <CommandEmpty>No state found.</CommandEmpty>
                      <CommandGroup>
                        {states.map((state) => (
                          <CommandItem
                            key={state.isoCode}
                            value={state.name}
                            onSelect={() => {
                              field.onChange({
                                name: state.name,
                                isoCode: state.isoCode,
                              });
                              setValue("city", "");
                            }}
                            data-checked={
                              field.value?.isoCode === state.isoCode
                            }
                          >
                            {state.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="city"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                required
                className="text-xs uppercase tracking-[0.15em]"
              >
                City
              </FieldLabel>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 justify-between border border-input bg-input/20"
                    >
                      {field.value || "Select City"}
                      <HugeiconsIcon
                        icon={UnfoldMoreIcon}
                        strokeWidth={2}
                        className="pointer-events-none size-3.5 text-muted-foreground"
                      />
                    </Button>
                  }
                />
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandList>
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        {cities.map((city) => (
                          <CommandItem
                            key={city.name}
                            value={city.name}
                            onSelect={() => {
                              field.onChange(city.name);
                            }}
                            data-checked={field.value === city.name}
                          >
                            {city.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="pincode"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                required
                className="text-xs uppercase tracking-[0.15em]"
              >
                Pincode
              </FieldLabel>
              <InputGroup aria-invalid={fieldState.invalid} className="h-12">
                <InputGroupInput
                  {...field}
                  id="signup-pincode"
                  placeholder="e.g. 700001"
                />
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </Field>
    </>
  );
};

export default AddressForm;
