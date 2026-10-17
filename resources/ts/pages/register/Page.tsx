import { useEffect } from "react";
import { HttpError, useRegister } from "@refinedev/core";
import { useTranslation } from 'react-i18next';
import { Input, Button, Divider, message } from "antd"; // , Radio
import { Link, useNavigate } from "react-router";
import { useForm } from "@refinedev/react-hook-form";
// import { Controller } from 'react-hook-form'; // useForm, 
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from '@/components/layout/auth/Layout';
import { Form } from '@/components/forms/Form';
import { Field } from '@/components/forms/Field';
import { socialsProvider } from '@/providers/socialsProvider';
import { useSocialAuth } from '@/utils/hooks/useSocialAuth';

type IFormValues = {
  name: string;
  email: string;
  // username: string;
  password: string;
  password_confirmation: string;
}

export default function Page(){
  // Field keys:
  const passwordConfirmation = "password_confirmation";
  const ns = "register";
  const { t } = useTranslation([ns]);
  const { mutate: register, isPending } = useRegister<any>();
  const navigate = useNavigate();
  const [messageApi, messageHolder] = message.useMessage();
  const { popupOpen, handleAuth } = useSocialAuth({
    onSuccess: () => navigate('/', { replace: true })
  });

  useEffect(() => {
    // console.log('popupOpen:', popupOpen);
    if(popupOpen){
      messageApi.loading({
        key: ns,
        // type: 'loading',
        content: `Register with ${popupOpen} in progress…`,
        duration: 0,
      })
    }else{
      messageApi.destroy(ns);
    }
  }, [popupOpen]);

  const str = z.string();

  const {
    formState: { errors },
    control,
    handleSubmit, 
  } = useForm<IFormValues, HttpError, IFormValues>({
    resolver: zodResolver(
      z.object({
        name: str.trim(),
        email: z.email(),
        password: str.min(6),
        [passwordConfirmation]: str.min(6),
      })
      .refine(
        val => val.password === val[passwordConfirmation],
        {
          message: t('v.notMatch', { ns: "common", v: "Password" }), // "Passwords don't match",
          path: [passwordConfirmation],
        }
      )
    ),
  });

  const doSubmit = (values: any) => {
    // console.log('values: ', values);
    register(values);
  }

  return (
    <Layout
      title={t("title", "Register")}
      form={
        <>
          <Form
            disabled={isPending}
            onSubmit={handleSubmit(doSubmit)}
            fieldsetProps={{ className: "space-y-4" }}
          >
            <Field
              label="Name"
              name="name"
              control={control}
              error={errors}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  className="mt-1"
                  disabled={isPending}
                  status={errors.name ? "error" : ""}
                  autoComplete="name"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
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
                  size="large"
                  className="mt-1"
                  disabled={isPending}
                  status={errors.email ? "error" : ""}
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                />
              )}
            />

            <Field
              label="Password"
              name="password"
              control={control}
              error={errors}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  size="large"
                  className="mt-1"
                  disabled={isPending}
                  status={errors.password ? "error" : ""}
                  autoComplete="new-password"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              )}
            />

            <Field
              label="Confirm password"
              name={passwordConfirmation}
              control={control}
              error={errors}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  size="large"
                  className="mt-1"
                  disabled={isPending}
                  status={errors[passwordConfirmation] ? "error" : ""}
                  autoComplete="new-password"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              )}
            />

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              className="w-full mt-9"
              // No need, `!!popupOpen` because if the user uses the form and is successful, 
              // the popup will close automatically.
              // disabled={!!popupOpen}
              loading={isPending}
            >
              {t("title")}
            </Button>

            <div>
              <Divider style={{ borderColor: '#bbb', fontWeight: 700 }}>
                {t("or", { ns: "common" })}
              </Divider>

              <div className="text-center">Sign in with</div>

              <div className="text-center space-y-2 mt-2">
                {socialsProvider.map((item: any) =>
                  <Button
                    key={item.name}
                    block
                    size="large"
                    icon={item.icon}
                    className="border-gray-400"
                    // No need, because if the user clicks again the popup will focus without reopening 
                    // (request to social auth api)
                    // loading={popupOpen === item.name}
                    onClick={() => handleAuth(item.name)}
                  >
                    {item.label}
                  </Button>
                )}
              </div>
            </div>

            <p className="text-center border-t pt-4">
              {t("desc")}
              {' '}
              <Link 
                to="/login" 
                className="font-bold focus-visible_ring"
              >
                {t("login")}
              </Link>
            </p>
          </Form>

          {messageHolder}
        </>
      }
    />
  );
}
