import { isEven } from "@/utils/isEven";
import { Circle } from "@mui/icons-material";
import { Box, Grid } from "@mui/material";
import { DragEventHandler, useState } from "react";

export default function GameBoard() {
    //There are 25 slots on the board. A slot could be vacant (null) or occupied (red or blue).

    const [board, setBoard] = useState([
        'red', 'blue', 'red', 'blue', 'red',
        'blue', 'red', 'blue', 'red', 'blue',
        0, 0, 0, 0, 0,
        'blue', 'red', 'blue', 'red', 'blue',
        'red', 'blue', 'red', 'blue', 'red',
    ])

    const [movingPiece, setMovingPiece] = useState<null | { color: string, index: number }>(null);

    const handleDrop = (ev: any, sourceIndex: number, color: string, dropIndex: number) => {
        ev.preventDefault()

        //The destination of drop must be vacant
        if (!board[dropIndex]) {
            setBoard((state) => {
                const copy = [...state];
                copy[dropIndex] = color;
                copy[sourceIndex] = 0
                return copy
            })
        }

        setMovingPiece(null)
    }

    const allowDrop = (e: any) => {
        e.preventDefault()
    }

    const pieces: { [key: string | number]: { [key: string]: any } } = {
        red: { icon: <Circle sx={{ color: 'red', }} /> },
        blue: { icon: <Circle sx={{ color: 'blue', }} /> }
    };

    return <Box sx={{
        height: { xs: '90vw', sm: '70vw', md: '60vh' }, mx: 'auto',
        width: { xs: '90vw', sm: '70vw', md: '60vh' }
    }}>
        <Grid container>
            {board.map((item, index) => {
                const even = isEven(index + 1);
                return (<Grid key={index} item xs={2.4} sx={{
                    color: even ? 'white' : 'black', display: 'flex', justifyContent: 'center',
                    bgcolor: even ? 'black' : 'yellow', px: 2, py: 2, alignItems: 'center', position: 'relative',
                }}
                    onDrop={(ev: any) => {
                        handleDrop(ev, movingPiece?.index as number,
                            movingPiece?.color as string,
                            index)
                    }}

                    onDragOver={allowDrop}
                >
                    {Boolean(item) && <Box draggable
                        onDragStart={(ev: any) => {
                            setMovingPiece({ color: item as string, index })
                        }}

                        sx={{
                            position: 'absolute',
                            alignItems: 'center', display: 'flex', justifyContent: 'center',
                        }}>
                        {pieces[item].icon}
                    </Box>}
                </Grid>)
            })}
        </Grid>
    </Box>
}