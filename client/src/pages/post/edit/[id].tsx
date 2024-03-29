import { Box, Button, Flex } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { BoundingBox } from "../../../components/BoundingBox";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { TextareaField } from "../../../components/TextareaField";
import {
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { useGetIntId } from "../../../hooks/useGetIntId";
import { createUrqlClient } from "../../../utils/createUrqlClient";

const EditPost: React.FC<{}> = ({}) => {
  const intId = useGetIntId();
  const router = useRouter();
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
  const [, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return <Layout>Loading...</Layout>;
  }

  if (!data?.post) return <Layout>Could not find post.</Layout>;

  return (
    <BoundingBox title="Edit post">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          await updatePost({ id: intId, ...values });
          router.push(`/post/${intId}`);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="Title" label="Title" />
            <Box mt={4}>
              <TextareaField name="text" placeholder="text..." label="Body" />
            </Box>
            <Flex mt={4} justifyContent="space-between" width="100%">
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={isSubmitting}
                color="white"
                w="100%"
              >
                Update Post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </BoundingBox>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
