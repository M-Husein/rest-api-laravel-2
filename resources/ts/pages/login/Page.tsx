import { useEffect } from "react";
import { useLogin } from "@refinedev/core"; // type HttpError,
import { useTranslation } from 'react-i18next';
import { Input, Button, Divider, message } from "antd"; // Checkbox
import { Link, useNavigate } from "react-router";
// import { useForm } from "@refinedev/react-hook-form";
import { useForm } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout } from '@/components/layout/auth/Layout';
import { Form } from '@/components/forms/Form';
import { Field } from '@/components/forms/Field';
import { socialsProvider } from '@/providers/socialsProvider';
import { useSocialAuth } from '@/hooks/useSocialAuth';

type IFormValues = {
  identifier: string;
  password: string;
  // uad?: string;
  // remember?: boolean;
}

const ns = "login";
const nsCommon = { ns: "common" };

export default function Page(){
  const { t } = useTranslation([ns]);
  const { mutate: login, isPending } = useLogin<any>(); // mutateAsync: login
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
        content: `Login with ${popupOpen} in progress…`,
        duration: 0,
      })
    }else{
      messageApi.destroy(ns);
    }
  }, [popupOpen]);

  // const instanceId = useRef(crypto.randomUUID());
  // console.log("Login instance:", instanceId.current);

  // console.log("LoginPage render");

  // useEffect(() => {
  //   console.log("mounted");
  //   return () => {
  //     console.log("unmounted");
  //   };
  // }, []);

  const {
    formState: { errors },
    control,
    // watch,
    handleSubmit, 
  } = useForm<IFormValues>({ // <IFormValues, HttpError, IFormValues>
    resolver: zodResolver(
      z.object({
        identifier: z.string().trim().min(2, t("error.required", nsCommon)),
        password: z.string().min(6), // translate("error.minLength", { v: 6 })
        // remember: z.boolean().optional(),
      })
    ),
    // defaultValues: {
    //   identifier: "",
    //   password: "",
    // },
  });

  // console.log("watch:", watch());

  const inputProps: any = {
    size: "large",
    // No need, `!!popupOpen` because if the user uses the form and is successful, 
    // the popup will close automatically.
    disabled: isPending, //  || !!popupOpen
    className: "mt-1",
    spellCheck: false,
    autoCorrect: "off",
    autoCapitalize: "off",
  };

  const doSubmit = (values: IFormValues) => {
    login(values);
  };

  // const doSubmit = async (values: IFormValues) => {
  //   const result = await login(values);
  //   console.log('result:', result);
  // };

  return (
    <Layout
      title="Login"
      form={
        <>
          <Form
            disabled={isPending}
            onSubmit={handleSubmit(doSubmit)}
            fieldsetProps={{ className: "space-y-4" }}
          >
            <Field
              label={t("identifierLabel", nsCommon)}
              name="identifier"
              control={control}
              error={errors}
              render={({ field }) => (
                <Input
                  {...field}
                  {...inputProps}
                  status={errors.identifier ? "error" : ""}
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
                  {...inputProps}
                  status={errors.password ? "error" : ""}
                  autoComplete="off"
                />
              )}
            />

            <p className="text-right">
              <Link 
                to="/forgot-password" 
                className="focus-visible_ring"
              >
                ℹ️ {t("forgotPassword")}
              </Link>
            </p>

            {/* <div className="flex flex-wrap">
              <Controller
                name="remember"
                control={control}
                render={({ field }) => (
                  <Checkbox 
                    {...field} 
                    checked={field.value}
                    disabled={isPending}
                    className="mr-2"
                  >
                    {translate("pages.login.buttons.rememberMe")}
                  </Checkbox>
                )}
              />

              <Link 
                to="/forgot-password" 
                className="focus-visible_ring"
              >
                ℹ️ {t("forgotPassword")}
              </Link>
            </div> */}

            <Button
              block
              type="primary"
              size="large"
              htmlType="submit"
              // No need, because if the user uses the form and is successful, 
              // the popup will close automatically.
              // disabled={!!popupOpen}
              loading={isPending}
            >
              {t("title")}
            </Button>

            <div>
              <Divider style={{ borderColor: '#bbb', fontWeight: 700 }}>
                {t("or", nsCommon)} 
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
            
            <p className="text-center border-t pt-4 whitespace-pre">
              {t('desc')}
              {' '}
              <Link 
                to="/register" 
                className="font-bold focus-visible_ring"
              >
                {t("register")}
              </Link>
            </p>
          </Form>
          
          {messageHolder}
        </>
      }
    />
  );
}
