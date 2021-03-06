import React, { useState } from "react"
import { Token } from "../Main"
import { Box, Tab } from "@mui/material"
import { makeStyles } from "@material-ui/core"
import { TabContext, TabList, TabPanel } from "@mui/lab"
import { WalletBalance } from "./WalletBalance"
import { StakeForm } from "./StakeForm"

const useStyles = makeStyles((theme) => ({
  tabContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(4)
  },
  box: {
    backgroundColor: "white",
    borderRadius: "25px"
  },
  header: {
    display: "flex",
    color: "white",
    flexDirection: "column",
    alignItems: "center"
  }
}))

interface YourWalletProps {
  supportedTokens: Array<Token>
}

export const YourWallet = ({ supportedTokens }: YourWalletProps) => {
  const classes = useStyles()

  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0)

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setSelectedTokenIndex(parseInt(newValue))
  }

  return (
    <Box>
      <h2 className={classes.header}>Your Wallet!</h2>
      <Box className={classes.box}>
        <TabContext value={selectedTokenIndex.toString()}>
          <TabList onChange={handleChange} aria-label="stake from tabs">
            {supportedTokens.map((token, index) => {
              return (
                <Tab label={token.name}
                  value={index.toString()}
                  key={index} />
              )
            })}
          </TabList>
          {supportedTokens.map((token, index) => {
            return (
              <TabPanel value={index.toString()} key={index}>
                <div className={classes.tabContent}>
                  <WalletBalance token={supportedTokens[selectedTokenIndex]} />
                  <StakeForm token={supportedTokens[selectedTokenIndex]} />
                </div>
              </TabPanel>
            )
          })}
        </TabContext>
      </Box>
    </Box>
  )
}