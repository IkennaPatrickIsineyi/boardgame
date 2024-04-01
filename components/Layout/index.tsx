'use client'

import { Box, ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import { layoutStyle } from "./style";
import { ReactNode } from "react";

type Props = {
    children: ReactNode
}

export default function Layout({ children }: Props) {
    return <ThemeProvider theme={theme()}>
        <Box sx={layoutStyle.container}>
            {children}
        </Box>
    </ThemeProvider>
}