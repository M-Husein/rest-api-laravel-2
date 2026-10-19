import type { ComponentPropsWithoutRef, ComponentPropsWithRef, ReactNode } from 'react';

interface FormProps extends ComponentPropsWithRef<'form'> {
  /** Props forwarded specifically to the internal fieldset element */
  fieldsetProps?: ComponentPropsWithoutRef<'fieldset'>;
  /** Custom disabled state that affects both the fieldset and the form's inert state */
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * A reusable Form component that wraps its children inside a `<fieldset>` element.
 * 
 * This component is designed to simplify form handling by automatically applying
 * the `disabled` state to the entire fieldset, and allowing additional customization
 * via standard HTML form and fieldset attributes.
 * 
 * @param {boolean} [props.disabled] - If true, disables all form controls within the fieldset.
 * @param {boolean} [props.inert] - Interactivity within the form.
 * @param {React.FieldsetHTMLAttributes<HTMLFieldSetElement>} [props.fielsetProps] - Additional props for the `<fieldset>` element.
 * @param {React.ReactNode} props.children - Form content to be rendered inside the fieldset.
 * @param {React.FormHTMLAttributes<HTMLFormElement>} [props.rest] - Additional props spread onto the `<form>` element.
 * 
 * @returns {JSX.Element} A form element with a nested fieldset.
 */
export const Form = ({
  disabled,
  inert,
  fieldsetProps,
  children,
  // ref, // Explicitly pull it out
  ...etc
}: FormProps) => (
  <form
    {...etc}
    // ref={ref} // Explicitly pass it down
    inert={inert ?? disabled}
  >
    <fieldset
      {...fieldsetProps}
      disabled={disabled}
    >
      {children}
    </fieldset>
  </form>
);
