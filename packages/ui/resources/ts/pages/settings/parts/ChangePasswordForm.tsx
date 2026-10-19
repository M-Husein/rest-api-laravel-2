import { useState } from "react";
import { useTranslate, useCustomMutation, useNotification } from "@refinedev/core";
import { Button, Input, Modal } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useForm } from "@refinedev/react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from '@/components/forms/Form';
import { Field } from '@/components/forms/Field';

const strMin6 = z.string().min(6);

export const ChangePasswordForm = () => {
  const translate = useTranslate();
  const { open: openNotif } = useNotification();

  // Two separate hooks — avoids shared state conflict
  const { mutate: revokeSessionsMutate } = useCustomMutation();
  const { mutate: revokeTokensMutate } = useCustomMutation();

  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const changePasswordSchema = z.object({
    current_password: strMin6, // z.string().min(1, 'Current password is required'),
    password: strMin6, // , 'Password must be at least 6 characters'
    password_confirmation: strMin6, // z.string().min(1, 'Please confirm your password')
  }).refine(val => val.password === val.password_confirmation, {
    message: translate('v.notMatch', { v: "Password" }), // 'Passwords do not match',
    path: ['password_confirmation']
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    refineCore: { onFinish, formLoading },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: ''
    },
    refineCoreProps: {
      resource: "me", // api/v1/me/change-password
      id: "change-password",
      action: "edit",
      redirect: false, 
      queryOptions: { enabled: false },
      // successNotification: (res: any) => ({
			// 	type: 'success',
			// 	message: res?.message || 'Password changed successfully.'
			// }),
      successNotification: false,
			errorNotification: (err: any) => ({
				type: 'error',
				message: err?.message || 'Failed to change password.'
			}),
      onMutationSuccess: () => handleReset(),
    }
  });

  const handleReset = () => {
    reset();
    setShowRevokeModal(true);
  };

  const closeModal = () => {
    setRevoking(false);
    setShowRevokeModal(false);
  };

  /**
   * Sequential: revoke sessions first, then tokens.
   * Using sequential callbacks instead of Promise.allSettled
   * because Refine's mutate is callback-based, not promise-based.
   */
  const handleRevoke = () => {
    setRevoking(true);

    revokeSessionsMutate(
      { url: 'sessions/others', method: 'delete', values: {} },
      {
        onSuccess: () => {
          revokeTokensMutate(
            { 
              url: 'tokens/all', 
              method: 'delete', 
              values: {}, 
              successNotification: (res: any) => ({
                type: 'success',
                message: res?.message || 'Password changed and other devices logged out.'
              })
            },
            {
              onSuccess: closeModal,
              onError: closeModal
            }
          );
        },
        onError: closeModal
      }
    );
  };
 
  const handleSkip = () => {
    openNotif?.({ 
      type: 'success', 
      message: 'Password changed successfully.' 
    });
    setShowRevokeModal(false);
  };

  const inputProps = {
    disabled: formLoading,
    spellCheck: false,
    autoCorrect: "off",
    autoCapitalize: "off",
    autoComplete: "new-password",
    className: "mt-1",
  };

  return (
    <>
      <Form 
        disabled={formLoading}
        onSubmit={handleSubmit(onFinish)}
        fieldsetProps={{ className: "space-y-4" }}
      >
        <Field
          label="Current Password"
          name="current_password"
          control={control}
          error={errors}
          render={({ field }) => (
            <Input.Password
              {...field}
              {...inputProps}
              status={errors.current_password ? "error" : ""}
              autoComplete="password"
            />
          )}
        />

        <Field
          label="New Password"
          name="password"
          control={control}
          error={errors}
          render={({ field }) => (
            <Input.Password
              {...field}
              {...inputProps}
              status={errors.password ? "error" : ""}
            />
          )}
        />

        <Field
          label="Confirm New Password"
          name="password_confirmation"
          control={control}
          error={errors}
          render={({ field }) => (
            <Input.Password
              {...field}
              {...inputProps}
              status={errors.password_confirmation ? "error" : ""}
            />
          )}
        />

        <Button
          htmlType="submit"
          type="primary"
          disabled={!isDirty}
          loading={formLoading}
          className="w-full mt-2"
        >
          Update Password
        </Button>
      </Form>

      <Modal
        open={showRevokeModal}
        closable={!revoking}
        keyboard={false}
        mask={{
          closable: false
        }}
        title="Logout Other Devices?"
        onCancel={handleSkip}
        footer={[
          <Button
            key="s"
            onClick={handleSkip}
            disabled={revoking}
          >
            Stay Signed In
          </Button>,
          <Button
            key="r"
            type="primary"
            danger
            icon={<LogoutOutlined />}
            loading={revoking}
            onClick={handleRevoke}
          >
            Logout Other Devices
          </Button>
        ]}
      >
        <p className="mt-2">
          Your password was changed successfully. For your security,
          we recommend logging out from all other devices and sessions.
        </p>
        <p className="text-sm mt-2">
          This will log out all other web sessions and mobile devices
          except your current one.
        </p>
      </Modal>
    </>
  );
}
