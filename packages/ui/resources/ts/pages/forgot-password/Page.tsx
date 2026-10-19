import { type ForgotPasswordFormTypes, type HttpError, useForgotPassword } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Button, Alert } from "antd";
import { Link } from "react-router";
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/auth/Layout';
import { Form } from '@/components/forms/Form';
import { Field } from '@/components/forms/Field';

type IFormValues = {
  email: string;
}

export default function Page(){
  const ns = "forgot-password";
  const { t } = useTranslation([ns]);
  const { mutate: forgotPassword, isPending } = useForgotPassword<ForgotPasswordFormTypes>();

  const {
    formState: { errors },
    control,
    handleSubmit, 
  } = useForm<IFormValues, HttpError, IFormValues>({
    resolver: zodResolver(
      z.object({
        // name: stringRequired.trim(),
        email: z.email(),
      })
    ),
  });

  const doSubmit = (values: any) => {
    // console.log('values: ', values);
    forgotPassword(values);
  }

  return (
    <Layout
      title={t("title")} // "Forgot Password"
      form={
        <Form
          disabled={isPending}
          onSubmit={handleSubmit(doSubmit)}
          fieldsetProps={{ className: "space-y-6" }}
        >
          <Alert
            showIcon
            title={t("title")}
            description={t('desc')}
          />

          <Field
            label={t("fieldLabel", "Email")}
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
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                inputMode="email"
              />
            )}
          />

          <Button
            block
            type="primary"
            size="large"
            htmlType="submit"
            loading={isPending}
          >
            {t("submit")}
          </Button>

          <div className="text-center">
            ℹ️ {t('haveAccount', { ns: "common" })}
            {" "}
            <Link
              to="/login"
              className="focus_ring font-medium"
              // className={"focus_ring font-medium" + (isPending ? " pe-none opacity-60" : "")}
              // tabIndex={isPending ? -1 : 0}
            >
              {t("login")}
            </Link>
          </div>
        </Form>
      }
    />
  );
};
