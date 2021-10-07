import React from "react";
import NextLink from "next/link";
import { IconButton } from "@chakra-ui/button";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Flex, Link } from "@chakra-ui/layout";
import { useDeletePostMutation } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
}) => {
  const [, deletePost] = useDeletePostMutation();
  return (
    <Flex ml="auto">
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          aria-label="edit post"
          variant="outline"
          colorScheme="blue"
          icon={<EditIcon transition="0.1s" />}
          mr={2}
        />
      </NextLink>
      <IconButton
        aria-label="delete post"
        colorScheme="red"
        variant="outline"
        icon={<DeleteIcon />}
        onClick={() => deletePost({ id: id })}
      />
    </Flex>
  );
};
