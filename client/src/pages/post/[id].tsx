import { Box, Heading } from "@chakra-ui/layout";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import React from "react";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { useMeQuery } from "../../generated/graphql";
import { useGetPostFromUrl } from "../../hooks/useGetPostFromUrl";
import { createUrqlClient } from "../../utils/createUrqlClient";

const Post: NextPage = ({}) => {
  const [{ data, fetching }] = useGetPostFromUrl();
  const [{ data: meData }] = useMeQuery();

  if (fetching) {
    return <Layout>loading...</Layout>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find a post.</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading mb={4}>{data?.post?.title}</Heading>
      <Box mb={4}>{data.post.text}</Box>
      {meData?.me?._id === data.post.creator._id && (
        <EditDeletePostButtons id={data.post._id} />
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Post);
