import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";
import { ChevronDownIcon } from "@chakra-ui/icons";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    // if window is defined then we are in browser and not in server
    pause: isServer(), // not run on server
  });
  const router = useRouter();
  let body = null;

  // data loading
  if (fetching) {
    body = null;
    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Button as={Link} mr={2}>
            Login
          </Button>
        </NextLink>
        <NextLink href="/register">
          <Button as={Link}>Register</Button>
        </NextLink>
      </>
    );
    // user logged in
  } else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button aria-label="create post">create post</Button>
        </NextLink>
        <Menu colorScheme="teal">
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {data?.me?.username}
          </MenuButton>
          <MenuList bg="white" p={0}>
            <MenuItem
              onClick={async () => {
                await logout();
                router.reload();
              }}
              isLoading={logoutFetching}
              fontWeight="semibold"
              _focus={{ bg: "gray.50" }}
              p={4}
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    );
  }
  return (
    <Flex
      position="sticky"
      top={0}
      zIndex={25}
      borderBottom="1px"
      bg="white"
      shadow="sm"
      borderColor="gray.200"
      p={4}
      align="center"
    >
      <Flex align="center" flex={1} m="auto" maxW={800}>
        <NextLink href="/">
          <Button>
            <Heading>LiReddit</Heading>
          </Button>
        </NextLink>
        <Box ml="auto">{body}</Box>
      </Flex>
    </Flex>
  );
};
