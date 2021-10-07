import { Box, Flex, Heading } from "@chakra-ui/layout";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import React from "react";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { UpdootSection } from "../../components/UpdootSection";
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
      <Flex w="100%">
        <Flex w="100%" p={5} shadow="sm" borderWidth="1px" bg="white">
          <Box>
            <UpdootSection post={data?.post} />
          </Box>
          <Flex w="100%" flexDir="column">
            <Flex w="100%">
              <Heading mb={4}>{data?.post?.title}</Heading>
              {meData?.me?._id === data.post.creator._id && (
                <EditDeletePostButtons id={data.post._id} />
              )}
            </Flex>
            <Box mb={4}>{data.post.text}</Box>
          </Flex>
        </Flex>
      </Flex>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Post);
