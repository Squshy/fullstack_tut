import { Box, Flex, Heading, Link, Stack, Text } from "@chakra-ui/layout";
import { withUrqlClient } from "next-urql";
import { Layout } from "../components/Layout";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import React, { useState } from "react";
import { Button } from "@chakra-ui/react";
import { UpdootSection } from "../components/UpdootSection";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, error, fetching }] = usePostsQuery({
    variables,
  });
  const [{ data: meData }] = useMeQuery();

  if (!fetching && !data) {
    return <div>error: {error?.message}</div>;
  }

  return (
    <Layout>
      {fetching && !data ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8} px={{ base: 4, md: 0 }}>
          {data &&
            data.posts.posts.map(
              (p) =>
                p && (
                  <Flex
                    p={5}
                    shadow="md"
                    borderWidth="1px"
                    bg="white"
                    key={p._id}
                  >
                    <UpdootSection post={p} />
                    <Box w="100%">
                      <Flex w="100%">
                        <Flex flexDir="column">
                          <NextLink href="/post/[id]" as={`/post/${p._id}`}>
                            <Link>
                              <Heading fontSize="xl" as="h2">
                                {p.title}
                              </Heading>
                            </Link>
                          </NextLink>

                          <Text fontSize="xs">
                            posted by {p.creator.username}
                          </Text>
                        </Flex>
                        {meData?.me?._id === p.creator._id && (
                          <EditDeletePostButtons id={p._id} />
                        )}
                      </Flex>
                      <Text mt={4}>{p.textSnippet}</Text>
                    </Box>
                  </Flex>
                )
            )}
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
