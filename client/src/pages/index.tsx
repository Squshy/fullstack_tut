import { Box, Flex, Heading, Link, Stack, Text } from "@chakra-ui/layout";
import { withUrqlClient } from "next-urql";
import { Layout } from "../components/Layout";
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import React, { useState } from "react";
import { Button, IconButton } from "@chakra-ui/react";
import { UpdootSection } from "../components/UpdootSection";
import { DeleteIcon } from "@chakra-ui/icons";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });
  const [, deletePost] = useDeletePostMutation();

  if (!fetching && !data) {
    return <div>you got no posts for some reason dude, query</div>;
  }

  return (
    <Layout>
      {fetching && !data ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data &&
            data.posts.posts.map((p) => !p ? null : (
              <Flex p={5} shadow="md" borderWidth="1px" key={p._id}>
                <UpdootSection post={p} />
                <Box w="100%">
                  <Flex w="100%">
                    <NextLink href="/post/[id]" as={`/post/${p._id}`}>
                      <Link>
                        <Heading fontSize="xl">{p.title}</Heading>
                      </Link>
                    </NextLink>
                    <Flex ml="auto">
                      <IconButton
                        aria-label="delete post"
                        icon={<DeleteIcon color="gray" />}
                        onClick={() => deletePost({ id: p._id })}
                      />
                    </Flex>
                  </Flex>
                  <Text fontSize="xs">posted by {p.creator.username}</Text>
                  <Text mt={4}>{p.textSnippet}</Text>
                </Box>
              </Flex>
            ))}
        </Stack>
      )}
      {data && data.posts.hasMore && (
        <Flex>
          <Button
            isLoading={fetching}
            m="auto"
            my={8}
            onClick={() =>
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
          >
            Load more
          </Button>
        </Flex>
      )}
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
