import { useEffect, useState } from "react";
import { type HttpError, useInvalidate, useCustomMutation, useOne, useNotification } from "@refinedev/core"; // useGetIdentity, 
import { Button, Input, Select, Modal, Alert } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useForm } from "@refinedev/react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router";
import { Form } from '@/components/forms/Form';
import { Field } from '@/components/forms/Field';
import { updateUser, isUserSystem } from '@/utils/user';

const COUNTRIES = [
  { value: 'ID', label: 'Indonesia' }, // 🇮🇩
  { value: 'US', label: 'United States' }, // 🇺🇸 
  { value: 'GB', label: 'United Kingdom' }, // 🇬🇧 
  { value: 'AU', label: 'Australia' }, // 🇦🇺 
  { value: 'CA', label: 'Canada' }, // 🇨🇦 
  { value: 'SG', label: 'Singapore' }, // 🇸🇬 
  { value: 'MY', label: 'Malaysia' }, // 🇲🇾 
  { value: 'JP', label: 'Japan' }, // 🇯🇵 
  { value: 'KR', label: 'South Korea' }, // 🇰🇷 
  { value: 'DE', label: 'Germany' }, // 🇩🇪 
  { value: 'FR', label: 'France' }, // 🇫🇷 
  { value: 'NL', label: 'Netherlands' }, // 🇳🇱 
  { value: 'IN', label: 'India' }, // 🇮🇳 
  { value: 'BR', label: 'Brazil' }, // 🇧🇷 
  { value: 'AE', label: 'UAE' } // 🇦🇪 
];

const verifyTokenKey = "verify_email_token";

export const ProfileInfoSection = ({ identity, refetch }: any) => {
  // const { data: identity, refetch } = useGetIdentity<any>();
  const invalidate = useInvalidate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { open: openNotif } = useNotification();
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const { mutate: revokeSessionsMutate } = useCustomMutation();
  const { mutate: revokeTokensMutate } = useCustomMutation();
  const { mutate: cancelEmailMutate, mutation: { isPending: isPendingCancelEmail } } = useCustomMutation();

  const profileSchema = z.object({
    name: z.string()
      .trim()
      .min(1) // , 'Name is required'
      .max(150),
    username: z.string()
      .min(3) // , 'At least 3 characters'
      .max(32) // , 'At most 32 characters'
      .regex(/^[a-zA-Z0-9._]+$/, 'Only letters, numbers, dots and underscores'),
    email: z.email().max(255), 
    phone: z.string()
      .trim() // Added trim to prevent accidental space-only inputs
      .max(16)
      .regex(/^\+?[0-9\s\-()\\.]*$/, 'Invalid phone number')
      .nullish(), // Automatically accepts "", null, and undefined
    bio: z.string()
      .trim()
      .max(250)
      .nullish(),
    country: z.string()
      .length(2)
      .or(z.literal(''))
      .nullish(), // We keep the union here ONLY because length(2) strictly rejects "" (length 0)
    city: z.string()
      .trim()
      .max(100)
      .nullish()
  });

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
    refineCore: { onFinish, formLoading }
  } = useForm<any, HttpError>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: { // values
      name: '',
      username: '',
      email: '',
      phone: '',
      bio: '',
      country: null,
      city: ''
    },
    refineCoreProps: {
      resource: 'me',
      id: '', // Add "update" if Refine problem and also change "me/update" to Laravel route
      action: 'edit',
      redirect: false,
      queryOptions: { enabled: false },
      successNotification: false,
      errorNotification: (err: any) => ({
        type: 'error',
        message: err?.message || 'Failed to update profile.'
      }),
      onMutationSuccess: (res, newValues) => handleSuccess(res, newValues)
    }
  });

  const verifyToken = searchParams.get(verifyTokenKey);

  const { query: verifyRequest } = useOne({
    resource: "me/email/verify", // api/v1/me/email/verify/{token}
    id: verifyToken ?? '',
    queryOptions: {
      enabled: !!verifyToken, // only runs when token in URL
      retry: false,           // don't retry on failure — token is either valid or not
      staleTime: Infinity,    // don't re-fetch once resolved
      gcTime: Infinity        // ← prevents React Query from re-running after cache cleared
    },
    // ✅ Remove successNotification and errorNotification from here
    errorNotification: false,
    successNotification: false
  });

  const handleSuccess = (res: any, newValues: any) => {
    invalidate({ resource: 'me', invalidates: ['detail'] });

    /**
     * For check email and username is change.
     * If use here maybe can remove checking in backend
     */
    const emailChanged = newValues.email !== identity?.email; // res?.data?.email

    // let fixNewValues = res?.data ?? emailChanged ? { ...newValues, pending_email: newValues.email } : newValues;
    // let fixNewValues = emailChanged
    //   ? { ...newValues, pending_email: newValues.email }
    //   : (res?.data ?? newValues);
    const fixNewValues = res?.data ?? newValues;

    reset(fixNewValues);
    updateUser(fixNewValues);
    refetch();

    if(emailChanged){
      openNotif?.({
        type: 'info',
        message: 'Verification email sent to your new address. Check your inbox.'
      } as any);
    }

    if(newValues.username !== identity?.username){ // res?.data?.username !== identity?.username
      setShowRevokeModal(true); // Show revoke modal instead of plain success toast
    }
    else if(!emailChanged){
      openNotif?.({
        type: 'success',
        message: res?.message || 'Profile updated.'
      });
    }
  };

  // Populate form when identity loads
  useEffect(() => {
    if(identity){
      reset(identity);
      /**
       * @OR
       */
      // reset({
      //   name: identity.name ?? '',
      //   username: identity.username ?? '',
      //   email: identity.email ?? '',
      //   phone: identity.phone ?? '',
      //   bio: identity.bio ?? '',
      //   country: identity.country ?? null,
      //   city: identity.city ?? ''
      // });
    }
  }, [identity]);

  const closeModal = () => {
    setRevoking(false);
    setShowRevokeModal(false);
  };

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
                message: res?.message || 'Profile updated and other devices logged out.'
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
    openNotif?.({ type: 'success', message: 'Profile updated successfully.' });
    setShowRevokeModal(false);
  };

  const clearPendingEmail = () => {
    invalidate({ resource: 'me', invalidates: ['detail'] });
    updateUser({ pending_email: null });
    refetch();
  };

  const cancelPendingEmail = () => {
    cancelEmailMutate(
      {
        url: 'me/email/pending',
        method: 'delete',
        values: {},
        successNotification: (res: any) => ({
          type: 'success',
          message: res?.message || 'Email change cancelled.'
        }),
        errorNotification: (err: any) => ({
          type: 'error',
          message: err?.message || 'Failed to cancel email change.'
        })
      },
      {
        onSuccess: clearPendingEmail
      }
    );
  };

  const handleModalClose = () => {
    // ✅ Show notification exactly once — when user dismisses the modal
    if(verifyRequest.isSuccess){
      openNotif?.({ type: 'success', message: 'Email verified successfully.' });
    }
    else if(verifyRequest.isError){
      openNotif?.({ type: 'error', message: 'Verification link is invalid or expired.' });
    }

    // ✅ Removing token from URL stops future re-fetches (enabled becomes false)
    setSearchParams(prev => {
      prev.delete(verifyTokenKey);
      return prev;
    });
    clearPendingEmail();
  };

  const doSubmit = (newValues: any) => {
    onFinish({
      ...newValues,
      country: newValues.country ?? null
    });
  };

  const inputProps = {
    disabled: formLoading,
    spellCheck: false,
    autoCorrect: "off",
    autoCapitalize: "off",
    className: "mt-1"
  };

  const isSystem = isUserSystem(identity);

  return (
    <>
      <Form
        disabled={formLoading}
        onSubmit={handleSubmit(doSubmit)}
        fieldsetProps={{ className: 'space-y-4' }}
      >
        <Field
          label="Full Name"
          name="name"
          control={control}
          error={errors}
          render={({ field }) => (
            <Input
              {...field}
              {...inputProps}
              disabled={isSystem}
              status={errors.name ? 'error' : ''}
            />
          )}
        />

        <Field
          label="Username"
          name="username"
          control={control}
          error={errors}
          render={({ field }) => (
            <Input
              {...field}
              {...inputProps}
              disabled={isSystem}
              status={errors.username ? 'error' : ''}
              placeholder="e.g. johndoe"
              prefix={<div className="text-gray-500">@</div>}
            />
          )}
        />

        <Field
          label="Email"
          name="email"
          control={control}
          error={errors}
          render={({ field }) => (
            <Input
              {...field}
              {...inputProps}
              type="email"
              status={errors.email ? 'error' : ''}
            />
          )}
          end={
            identity?.pending_email && (
              <Alert
                showIcon
                type="warning"
                className="mt-2"
                title={<>Pending verification: <b>{identity.pending_email}</b></>}
                action={
                  <Button
                    size="small"
                    danger
                    loading={isPendingCancelEmail}
                    onClick={cancelPendingEmail}
                  >
                    Cancel
                  </Button>
                }
              />
            )
          }
        />

        <Field
          label="Phone Number"
          name="phone"
          control={control}
          error={errors}
          render={({ field }) => (
            <Input
              {...field}
              {...inputProps}
              status={errors.phone ? 'error' : ''}
              // placeholder="e.g. +628123456789"
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Country"
            name="country"
            control={control}
            error={errors}
            render={({ field }) => (
              <Select
                {...field}
                disabled={formLoading}
                status={errors.country ? 'error' : ''}
                placeholder="Select country"
                showSearch={{
                  optionFilterProp: "label",
                }}
                className="w-full mt-1"
                options={COUNTRIES}
                allowClear
                // Not work, antd not give access to set input search
                // autoComplete="none"

                // The Escape Hatch 😅
                onFocus={(e) => {
                  // e.target points directly to the hidden antd search <input>
                  e.target.setAttribute('autocomplete', 'none');
                }}
              />
            )}
          />

          <Field
            label="City"
            name="city"
            control={control}
            error={errors}
            render={({ field }) => (
              <Input
                {...field}
                {...inputProps}
                status={errors.city ? 'error' : ''}
              />
            )}
          />
        </div>

        <Field
          label="Bio"
          name="bio"
          control={control}
          error={errors}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              disabled={formLoading}
              status={errors.bio ? 'error' : ''}
              placeholder="Tell something about yourself..."
              maxLength={250}
              autoSize={{
                minRows: 3,
              }}
              showCount
              className="mt-1"
            />
          )}
        />

        <br />

        <Button
          htmlType="submit"
          type="primary"
          loading={formLoading}
          disabled={!isDirty}
          className="w-full"
        >
          Save Changes
        </Button>
      </Form>

      <Modal
        open={showRevokeModal}
        title="Logout Other Devices?"
        onCancel={handleSkip}
        closable={!revoking}
        keyboard={false}
        mask={{
          closable: false
        }}
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
        {/* <p className="mt-2">
          Your {res?.data?.email_changed ? 'email' : 'username'} was changed.
          For your security, we recommend logging out
          from all other devices and sessions.
        </p>
        <p className="text-sm mt-2 text-gray-500">
          Other devices using your old credentials
          will need to sign in again.
        </p> */}

        <p className="mt-2">
          Your email or username was changed. For your security,
          we recommend logging out from all other devices and sessions.
        </p>
        <p className="text-sm mt-2">
          Other devices using your old email or username to sign in
          will need to log in again with the updated credentials.
        </p>
      </Modal>

      <Modal
        keyboard={false}
        closable={false}
        mask={{
          closable: false
        }}
        open={!!verifyToken && (verifyRequest.isSuccess || verifyRequest.isError)}
        title={verifyRequest.isSuccess ? 'Email Verified' : 'Verification Failed'}
        footer={(_x, { OkBtn }) => <OkBtn />}
        onOk={handleModalClose}
      >
        {verifyRequest.isSuccess ? (
          <div className="flex items-center gap-3 py-2">
            <b className="text-2xl">✅</b>
            <p>Your email has been updated successfully.</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 py-2">
            <b className="text-2xl">❌</b>
            <p>
              The verification link is invalid or has expired.
              Please request a new one from your profile settings.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
};

/**
 * The Logic
 *  Submit profile update
      ↓
    Did email or username change?
      ├── No  → just save, no modal
      └── Yes → save, then show modal
                "Your email/username changed. Logout other devices?"
  
    - If email or username changes, any other device using the old credential to re-authenticate would fail
    - Same logic as password change — the user should be aware other sessions might be using the old identifier
 */
