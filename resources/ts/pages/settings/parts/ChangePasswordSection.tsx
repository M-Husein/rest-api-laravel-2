import { Alert } from "antd";
import { SetPasswordForm } from './SetPasswordForm';
import { ChangePasswordForm } from './ChangePasswordForm';

export const ChangePasswordSection = ({ identity, refetch }: any) => {
  const hasPassword = identity?.hasPassword ?? true;

  return (
    <>
      <Alert
        showIcon
        type="info"
        className="mb-6"
        title={hasPassword ? 'Change Password' : 'Set Password'}
        description={hasPassword
          ? 'Update your current password. You will be prompted to logout other devices after.'
          : 'Set a password so you can also sign in with your email or username.'
        }
      />

      {hasPassword
        ? <ChangePasswordForm />
        : <SetPasswordForm refetch={refetch} />
      }
    </>
  );
};
