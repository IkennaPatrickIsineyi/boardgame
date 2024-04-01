'use client'

import { Box } from "@mui/material";
import GameBoard from "./GameBoard";


export default function GamePage() {


    return <Box sx={{ maxHeight: '100%' }}>
        <GameBoard />
    </Box>
}