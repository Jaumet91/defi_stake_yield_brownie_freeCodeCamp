import { Button, Input, CircularProgress, Snackbar } from "@mui/material"
import Alert from "@mui/lab/Alert"
import { useEthers, useTokenBalance, useNotifications } from "@usedapp/core"
import { formatUnits } from "ethers/lib/utils"
import React, { useState, useEffect } from "react"
import { Token } from "../Main"
import { useStakeTokens } from "../../hooks"
import { utils } from "ethers"

export interface StakeFromProps {
  token: Token
}

export const StakeForm = ({ token }: StakeFromProps) => {
  const { address: tokenAddress, name } = token
  const { account } = useEthers()
  const tokenBalance = useTokenBalance(tokenAddress, account)
  const formattedTokenBalance: number = tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)) : 0
  const { notifications } = useNotifications()

  const [amount, setAmount] = useState<number | string | Array<number | string>>(0)
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = event.target.value === "" ? "" : Number(event.target.value)
    setAmount(newAmount)
    // console.log(newAmount)
  }

  const { approveAndStake, state: approveAndStakeERC20State } = useStakeTokens(tokenAddress)
  const handleStakeSubmit = () => {
    const amountAsWei = utils.parseEther(amount.toString())
    return approveAndStake(amountAsWei.toString())
  }

  const isMining = approveAndStakeERC20State.status === "Mining"
  const [showErc20ApprovalSuccess, setErc20ApprovalSuccess] = useState(false)
  const [showStakeTokenSuccess, setStakeTokenSuccess] = useState(false)
  const handleCloseSnack = () => {
    setErc20ApprovalSuccess(false)
    setStakeTokenSuccess(false)
  }

  useEffect(() => {
    if (notifications.filter(
      (notification) =>
        notification.type === "transactionSucceed" &&
        notification.transactionName === "Approve ERC20 transfer").length > 0) {
      // console.log("Approved!")
      setErc20ApprovalSuccess(true)
      setStakeTokenSuccess(false)
    }
    if (notifications.filter(
      (notification) =>
        notification.type === "transactionSucceed" &&
        notification.transactionName === "Stake Tokens").length > 0) {
      // console.log("Tokens Staked!")
      setErc20ApprovalSuccess(false)
      setStakeTokenSuccess(true)
    }
  }, [notifications, showErc20ApprovalSuccess, showStakeTokenSuccess])

  return (
    <>
      <div className="form-container">
        <Input
          onChange={handleInputChange} />
        <Button
          onClick={handleStakeSubmit}
          color="primary"
          size="large"
          disabled={isMining}>
          {isMining ? <CircularProgress size={26} /> : "Stake"}
        </Button>
      </div>
      <Snackbar
        open={showErc20ApprovalSuccess}
        autoHideDuration={5000}
        onClose={handleCloseSnack}>
        <Alert onClose={handleCloseSnack} severity="success">
          ERC-20 token transfer approved! Now approve the 2nd transaction.
        </Alert>
      </Snackbar>
      <Snackbar
        open={showStakeTokenSuccess}
        autoHideDuration={5000}
        onClose={handleCloseSnack}>
        <Alert onClose={handleCloseSnack} severity="success">
          Tokens Staked!
        </Alert>
      </Snackbar>
    </>
  )
}