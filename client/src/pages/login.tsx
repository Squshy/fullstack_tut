import React from "react";
import { Formik, Form } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { Box, Flex, Heading } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/dist/client/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { Layout } from "../components/Layout";
import { BoundingBox } from "../components/BoundingBox";

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <BoundingBox title="Login">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            // worked
            if (typeof router.query.next === "string") {
              router.push(router.query.next);
            } else router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="Username or Email"
              label="Username or Email"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex mt={4} justifyContent="space-between" width="100%">
              <Button
                colorScheme="blue"
                color="white"
                type="submit"
                isLoading={isSubmitting}
              >
                Login
              </Button>
              <Flex alignSelf="center">
                <NextLink href="/forgot-password">
                  <Link ml="auto" fontSize="xs">
                    Forgot Password?
                  </Link>
                </NextLink>
              </Flex>
            </Flex>
          </Form>
        )}
      </Formik>
    </BoundingBox>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Login);
