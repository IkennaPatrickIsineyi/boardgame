import { Theme } from "@emotion/react"
import { createTheme } from "@mui/material"
import { useMemo } from "react"

export const theme = (): Theme => useMemo(() => {
    return createTheme({
        typography: {
            button: {
                textTransform: 'none',
            },
            fontFamily: 'Inter'
        },
        palette: {
            primary: { main: '#D6A217' },
            secondary: { main: '#E1ECEB' }
        },
        components: {
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        background: '#C99C33',
                        color: '#F8F3EB',
                        fontSize: 10,
                        borderRadius: '20px'
                    },
                    arrow: {
                        color: '#C99C33',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    contained: {
                        backgroundColor: '#D6A217',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#D6A21750',
                            color: 'white'
                        }
                    },
                    text: {
                        color: '#607573',
                        '&:hover': {
                            backgroundColor: '#D6A21750',
                            color: 'white'
                        }

                    }
                }
            },
            MuiAvatarGroup: {
                styleOverrides: {
                    root: ({ ownerState: { max } }) => ({
                        ...[...Array(max)].reduce(
                            (result, curr, index) => ({
                                ...result,
                                [`& > .MuiAvatar-root:nth-of-type(${index + 1})`]: {
                                    zIndex: (max || 0) - index
                                }
                            }),
                            {}
                        )
                    })
                }
            }
        }
    })
}, [])