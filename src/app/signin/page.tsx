"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Formik } from "formik";
import * as yup from "yup";
import { Form } from "@/components/atoms/Form";
import { Button } from "@/components/atoms/Button";
import { TextField } from "@/components/atoms/TextField";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/atoms/Spinner";

export default function SignIn() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onSignIn = useCallback(
    async ({ username, password }: { username: string; password: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await signIn("credentials", {
          username,
          password,
          redirect: false,
          callbackUrl: "/",
        });

        if (res?.error) {
          setError("Username or password is incorrect");
        } else {
          console.log(res?.url ?? "/");
          router.push(res?.url ?? "/");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const schema = yup.object().shape({
    username: yup.string().required("Is required"),
    password: yup.string().required("Is required"),
  });

  return (
    <div className="flex grow items-center justify-center">
      <div className="flex grow flex-col items-center justify-center p-4">
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
            <div className="flex w-fit items-center justify-center md:space-x-4">
              <Image
                src="/images/logo.svg"
                width={64}
                height={64}
                className="h-6 -rotate-16 md:h-16"
                alt="Kippenstummel"
              />
            </div>
            <div className="flex flex-col items-center text-xl font-semibold">
              <span className="block">Kippenstummel</span>
              <span className="block">Management Console</span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Formik<{
              username: string;
              password: string;
            }>
              initialValues={{
                username: "",
                password: "",
              }}
              onSubmit={(values) => onSignIn(values)}
              validationSchema={schema}
            >
              {(formikProps) => (
                <Form
                  onSubmit={formikProps.handleSubmit}
                  validationBehavior="aria"
                >
                  {error && <p className="text-center text-red-500">{error}</p>}
                  <div className="flex flex-col gap-4">
                    <div>
                      <TextField
                        label="Username"
                        name="username"
                        type="text"
                        value={formikProps.values.username}
                        onBlur={formikProps.handleBlur}
                        isDisabled={isLoading}
                        onChange={(value) =>
                          formikProps.setFieldValue("username", value)
                        }
                        isInvalid={
                          !!formikProps.touched.username &&
                          !!formikProps.errors.username
                        }
                        errorMessage={formikProps.errors.username}
                      />
                    </div>
                    <div>
                      <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={formikProps.values.password}
                        onBlur={formikProps.handleBlur}
                        isDisabled={isLoading}
                        onChange={(value) =>
                          formikProps.setFieldValue("password", value)
                        }
                        isInvalid={
                          !!formikProps.touched.password &&
                          !!formikProps.errors.password
                        }
                        errorMessage={formikProps.errors.password}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="flex w-full justify-center"
                      isDisabled={
                        !(formikProps.isValid && formikProps.dirty) || isLoading
                      }
                    >
                      {!isLoading && <span>Sign In</span>}
                      {isLoading && <Spinner />}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
