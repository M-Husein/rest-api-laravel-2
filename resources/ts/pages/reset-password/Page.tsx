import { useEffect } from "react";
import { Input, Button } from "antd";
import { HttpError, useParsed, useTranslate, useNotification } from "@refinedev/core";
import { useNavigate } from "react-router";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import { useSearchParams } from 'react-router-dom'; // Link, Navigate
import { Layout } from '@/components/layout/auth/Layout';
import { Form } from '@/components/forms/Form';
import { Field } from '@/components/forms/Field';

interface IPost {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

const TITLE_PAGE = "Reset Password";

export default function Page(){
  const translate = useTranslate();
  const { params: { token: accessToken, email } } = useParsed<any>();
  const { open: openNotif } = useNotification();
  const navigate = useNavigate();
  // const [searchParams] = useSearchParams(); // , setSearchParams
  // const accessToken = searchParams.get('token');
  // const email = searchParams.get("email");
  // const [ok, setOk] = useState<string>('');

  const str = z.string();

  const {
    refineCore: { onFinish, formLoading },
    // reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IPost, HttpError, IPost>({
    resolver: zodResolver(
      z.object({
        email: z.email(),
        token: str.refine((val) => val === val.trim(), {
          message: translate("error.trim"),
        }),
        password: str.min(6),
        password_confirmation: str.min(6),
      })
      .refine(
        val => val.password === val.password_confirmation,
        {
          message: translate('v.notMatch', { v: 'Password' }), // "Passwords don't match",
          path: ["password_confirmation"],
        }
      )
    ),
    defaultValues: { 
      email, 
      token: accessToken
    },
    refineCoreProps: {
      redirect: false,
      resource: "reset-password",
      onMutationSuccess: (res: any) => {
        // console.log('res:', res);
        if(res?.success){
          navigate('/login', { replace: true });
        }
      },
    },
  });

  // // Set initial form email value from URL param
  // useEffect(() => {
  //   if(email){
  //     reset({ email }); // , token: accessToken
  //   }
  // }, [email]); // , accessToken

  // // Redirect if token or email are missing from the URL (invalid link)
  useEffect(() => {
    if(!accessToken || !email){
      openNotif?.({
        type: "error",
        message: "Invalid or missing password reset link.",
        description: "Please request a new password reset link.",
      });
      // Redirect to forgot password page if link is invalid/incomplete
      navigate("/forgot-password", { replace: true });
    }
  }, [accessToken, email, navigate, openNotif]);

  if(accessToken && email){
    const passwordProps: any = {
      size: "large",
      className: "mt-1",
      disabled: formLoading,
      spellCheck: false,
      autoComplete: "off", // new-password
      autoCorrect: "off",
      autoCapitalize: "off",
    };

    return (
      <Layout
        title={TITLE_PAGE}
        form={
          <Form
            fieldsetProps={{ className: "space-y-6" }}
            disabled={formLoading}
            onSubmit={handleSubmit(onFinish)}
          >
            <Field
              label="Email"
              name="email"
              control={control}
              error={errors}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  className="mt-1"
                  readOnly
                  disabled={formLoading}
                  status={errors.email ? "error" : ""}
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                />
              )}
            />

            <Field
              name="token"
              control={control}
              error={errors}
              render={({ field }) => (
                <input
                  {...field}
                  type="hidden"
                  disabled
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
                  {...passwordProps}
                  status={errors.password ? "error" : ""}
                />
              )}
            />

            <Field
              label="Confirm password"
              name="password_confirmation"
              control={control}
              error={errors}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  {...passwordProps}
                  status={errors.password_confirmation ? "error" : ""}
                />
              )}
            />

            <Button
              block
              size="large"
              type="primary"
              htmlType="submit"
              loading={formLoading}
            >
              Reset
            </Button>
          </Form>
        }
      />
    );
  }

  return null;
};
