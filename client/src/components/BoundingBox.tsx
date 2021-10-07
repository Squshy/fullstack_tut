import { Box, Heading } from "@chakra-ui/layout";
import React from "react";
import { Layout } from "./Layout";
import { Wrapper } from "./Wrapper";

interface BoundingBoxProps {
  title?: string;
}

export const BoundingBox: React.FC<BoundingBoxProps> = ({
  title,
  children,
}) => {
  return (
    <Layout>
      <Box p={5} bg="white" shadow="sm" borderWidth="1px">
        {title && <Heading textAlign="center">{title}</Heading>}
        <Wrapper variant="small">{children}</Wrapper>
      </Box>
    </Layout>
  );
};
