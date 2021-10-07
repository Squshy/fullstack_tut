import { Box, Flex, Heading } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { BoundingBox } from "../components/BoundingBox";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { TextareaField } from "../components/TextareaField";
import { Wrapper } from "../components/Wrapper";
import { useCreatePostMutation } from "../generated/graphql";
import { useIsAuth } from "../hooks/useIsAuth";
import { createUrqlClient } from "../utils/createUrqlClient";

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, createPost] = useCreatePostMutation();
  useIsAuth();

  return (
    <BoundingBox title="Create a new post">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          const { error } = await createPost({ input: values });
          if (!error) router.push("/");
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="Title" label="Title" />
            <Box mt={4}>
              <TextareaField name="text" placeholder="text..." label="Body" />
            </Box>
            <Flex
              mt={4}
              justifyContent="space-between"
              width="100%"
              align="center"
            >
              <Button
                colorScheme="blue"
                color="white"
                type="submit"
                isLoading={isSubmitting}
                w="100%"
              >
                Create Post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </BoundingBox>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
