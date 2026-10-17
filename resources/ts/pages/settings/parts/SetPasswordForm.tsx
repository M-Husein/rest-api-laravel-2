import { useTranslate, useNotification, useInvalidate } from "@refinedev/core";
import { Button, Input } from "antd";
import { useForm } from "@refinedev/react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from '@/components/forms/Form';
import { Field } from '@/components/forms/Field';
import { updateUser } from '@/utils/user';

const passwordConfirmKey = "password_confirmation";
const strMin6 = z.string().min(6);

export const SetPasswordForm = ({ refetch }: { refetch: () => void }) => {
  const translate = useTranslate();
  const { open: openNotif } = useNotification();
  const invalidate = useInvalidate();

  const setPasswordSchema = z.object({
    password: strMin6,
    [passwordConfirmKey]: strMin6
  }).refine(val => val.password === val[passwordConfirmKey], {
    message: translate('v.notMatch', { v: "Password" }), // 'Passwords do not match',
    path: [passwordConfirmKey]
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    refineCore: { onFinish, formLoading }
  } = useForm({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: '',
      [passwordConfirmKey]: ''
    },
    refineCoreProps: {
      resource: 'me/password', // api/v1/me/password
      redirect: false,
      successNotification: false,
      errorNotification: (err: any) => ({
        type: 'error',
        message: err?.message || 'Failed to set password.'
      }),
      onMutationSuccess: (res: any) => {
        openNotif?.({ 
          type: 'success', 
          message: res?.message || 'Password set successfully.' 
        });
        
        reset();
        invalidate({ resource: 'me', invalidates: ['detail'] });
        updateUser({ hasPassword: true });
        refetch();
      }
    }
  });

  const inputProps = {
    disabled: formLoading,
    spellCheck: false,
    autoCorrect: "off",
    autoCapitalize: "off",
    autoComplete: "new-password",
    className: "mt-1",
  };

  return (
    <Form
      disabled={formLoading}
      onSubmit={handleSubmit(onFinish)}
      fieldsetProps={{ className: 'space-y-4' }}
    >
      <Field
        label="New Password"
        name="password"
        control={control}
        error={errors}
        render={({ field }) => (
          <Input.Password
            {...field}
            {...inputProps}
            status={errors.password ? 'error' : ''}
          />
        )}
      />

      <Field
        label="Confirm Password"
        name={passwordConfirmKey}
        control={control}
        error={errors}
        render={({ field }) => (
          <Input.Password
            {...field}
            {...inputProps}
            status={errors[passwordConfirmKey] ? 'error' : ''}
          />
        )}
      />

      <Button
        htmlType="submit"
        type="primary"
        loading={formLoading}
        className="w-full"
      >
        Set Password
      </Button>
    </Form>
  );
};
