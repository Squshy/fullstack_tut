import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import {  SingularPostFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: SingularPostFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  return (
    <Flex
      flexDirection="column"
      justifyContent="space-between"
      align="center"
      mr={4}
    >
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) return;
          setLoadingState("updoot-loading");
          await vote({ postId: post._id, value: 1 });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "updoot-loading"}
        aria-label="updoot"
        icon={
          <ChevronUpIcon
            w={6}
            h={6}
            color={post.voteStatus === 1 ? `green` : undefined}
            _hover={{color: 'green.500'}}
            transition="0.3s"
          />
        }
      />
      {post.points}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) return;
          setLoadingState("downdoot-loading");
          await vote({ postId: post._id, value: -1 });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "downdoot-loading"}
        aria-label="updoot"
        icon={
          <ChevronDownIcon
            w={6}
            h={6}
            color={post.voteStatus === -1 ? `red` : undefined}
            _hover={{color: 'red.500'}}
            transition="0.3s"
          />
        }
      />
    </Flex>
  );
};
