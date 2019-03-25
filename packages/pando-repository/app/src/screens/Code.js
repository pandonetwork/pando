import { EmptyStateCard } from "@aragon/ui";
import React from "react";
import Box from "../components/Box";
import Browser from "../components/Browser";

export default ({ name, branches }) => {
  if (!branches || !branches.length) {
    return (
      <Box
        display="flex"
        height="80vh"
        justifyContent="center"
        alignItems="center"
      >
        <EmptyStateCard
          title="Repository is empty"
          text="Create a commit into this repository to get started."
        />
      </Box>
    );
  } else {
    return <Browser name={name} branches={branches} />;
  }
};
