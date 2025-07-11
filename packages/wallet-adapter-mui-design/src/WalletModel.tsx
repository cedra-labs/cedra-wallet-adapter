import {
  AboutCedraConnect,
  AboutCedraConnectEducationScreen,
  AdapterNotDetectedWallet,
  AdapterWallet,
  CedraPrivacyPolicy,
  WalletItem,
  WalletSortingOptions,
  groupAndSortWallets,
  isInstallRequired,
  useWallet,
} from "@cedra-labs/wallet-adapter-react";
import {
  Box,
  Button,
  Collapse,
  Dialog,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { grey } from "./cedraColorPalette";
// reported bug with loading mui icons with esm, therefore need to import like this https://github.com/mui/material-ui/issues/35233
import {
  ArrowBack,
  ArrowForward,
  Close as CloseIcon,
  ExpandMore,
  LanOutlined as LanOutlinedIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { WalletConnectorProps } from "./WalletConnector";

interface WalletsModalProps
  extends Pick<WalletConnectorProps, "networkSupport" | "modalMaxWidth">,
    WalletSortingOptions {
  handleClose: () => void;
  modalOpen: boolean;
}

export default function WalletsModal({
  handleClose,
  modalOpen,
  networkSupport,
  modalMaxWidth,
  ...walletSortingOptions
}: WalletsModalProps): JSX.Element {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const { wallets = [], notDetectedWallets = [] } = useWallet();

  const { cedraConnectWallets, availableWallets, installableWallets } =
    groupAndSortWallets(
      [...wallets, ...notDetectedWallets],
      walletSortingOptions,
    );

  const hasCedraConnectWallets = !!cedraConnectWallets.length;

  return (
    <Dialog
      open={modalOpen}
      onClose={handleClose}
      aria-label="wallet selector modal"
      sx={{ borderRadius: `${theme.shape.borderRadius}px` }}
      maxWidth={modalMaxWidth ?? "xs"}
      fullWidth
    >
      <Stack
        sx={{
          top: "50%",
          left: "50%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          gap: 2,
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: grey[450],
          }}
        >
          <CloseIcon />
        </IconButton>
        <AboutCedraConnect renderEducationScreen={renderEducationScreen}>
          <Typography
            align="center"
            variant="h5"
            component="h2"
            pt={2}
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {hasCedraConnectWallets ? (
              <>
                <span>Log in or sign up</span>
                <span>with Social + Cedra Connect</span>
              </>
            ) : (
              "Connect Wallet"
            )}
          </Typography>
          {networkSupport && (
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LanOutlinedIcon
                sx={{
                  fontSize: "0.9rem",
                  color: grey[400],
                }}
              />
              <Typography
                sx={{
                  display: "inline-flex",
                  fontSize: "0.9rem",
                  color: grey[400],
                }}
                align="center"
              >
                {networkSupport} only
              </Typography>
            </Box>
          )}
          {hasCedraConnectWallets && (
            <Stack gap={1}>
              {cedraConnectWallets.map((wallet) => (
                <CedraConnectWalletRow
                  key={wallet.name}
                  wallet={wallet}
                  onConnect={handleClose}
                />
              ))}
              <Typography
                component="p"
                fontSize="14px"
                sx={{
                  display: "flex",
                  gap: 0.5,
                  justifyContent: "center",
                  alignItems: "center",
                  color: grey[400],
                }}
              >
                Learn more about{" "}
                <Box
                  component={AboutCedraConnect.Trigger}
                  sx={{
                    background: "none",
                    border: "none",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    cursor: "pointer",
                    display: "flex",
                    gap: 0.5,
                    px: 0,
                    py: 1.5,
                    alignItems: "center",
                    color: theme.palette.text.primary,
                    appearance: "none",
                  }}
                >
                  Cedra Connect <ArrowForward sx={{ height: 16, width: 16 }} />
                </Box>
              </Typography>

              <Stack
                component={CedraPrivacyPolicy}
                alignItems="center"
                py={0.5}
              >
                <Typography component="p" fontSize="12px" lineHeight="20px">
                  <CedraPrivacyPolicy.Disclaimer />{" "}
                  <Box
                    component={CedraPrivacyPolicy.Link}
                    sx={{
                      color: grey[400],
                      textDecoration: "underline",
                      textUnderlineOffset: "4px",
                    }}
                  />
                  <span>.</span>
                </Typography>
                <Box
                  component={CedraPrivacyPolicy.PoweredBy}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    fontSize: "12px",
                    lineHeight: "20px",
                    color: grey[400],
                  }}
                />
              </Stack>
              <Divider sx={{ color: grey[400], pt: 2 }}>Or</Divider>
            </Stack>
          )}
          <Stack sx={{ gap: 1 }}>
            {availableWallets.map((wallet) => (
              <WalletRow
                key={wallet.name}
                wallet={wallet}
                onConnect={handleClose}
              />
            ))}
            {!!installableWallets.length && (
              <>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setExpanded((prev) => !prev)}
                  endIcon={
                    <ExpandMore sx={{ height: "20px", width: "20px" }} />
                  }
                >
                  More Wallets
                </Button>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                  <Stack sx={{ gap: 1 }}>
                    {installableWallets.map((wallet) => (
                      <WalletRow
                        key={wallet.name}
                        wallet={wallet}
                        onConnect={handleClose}
                      />
                    ))}
                  </Stack>
                </Collapse>
              </>
            )}
          </Stack>
        </AboutCedraConnect>
      </Stack>
    </Dialog>
  );
}

interface WalletRowProps {
  wallet: AdapterWallet | AdapterNotDetectedWallet;
  onConnect?: () => void;
}

function WalletRow({ wallet, onConnect }: WalletRowProps) {
  const theme = useTheme();
  return (
    <WalletItem wallet={wallet} onConnect={onConnect} asChild>
      <ListItem disablePadding>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            px: 2,
            py: 1.5,
            gap: 2,
            border: "solid 1px",
            borderColor: theme.palette.mode === "dark" ? grey[700] : grey[200],
            borderRadius: `${theme.shape.borderRadius}px`,
          }}
        >
          <Box component={WalletItem.Icon} sx={{ width: 32, height: 32 }} />
          <ListItemText
            primary={wallet.name}
            primaryTypographyProps={{ fontSize: "1.125rem" }}
          />
          {isInstallRequired(wallet) ? (
            <WalletItem.InstallLink asChild>
              <Button
                LinkComponent={"a"}
                size="small"
                className="wallet-connect-install"
              >
                Install
              </Button>
            </WalletItem.InstallLink>
          ) : (
            <WalletItem.ConnectButton asChild>
              <Button
                variant="contained"
                size="small"
                className="wallet-connect-button"
              >
                Connect
              </Button>
            </WalletItem.ConnectButton>
          )}
        </Box>
      </ListItem>
    </WalletItem>
  );
}

function CedraConnectWalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <WalletItem wallet={wallet} onConnect={onConnect} asChild>
      <WalletItem.ConnectButton asChild>
        <Button
          size="large"
          variant="outlined"
          sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <Box component={WalletItem.Icon} sx={{ width: 20, height: 20 }} />
          <WalletItem.Name />
        </Button>
      </WalletItem.ConnectButton>
    </WalletItem>
  );
}

function renderEducationScreen(screen: AboutCedraConnectEducationScreen) {
  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 4fr 1fr",
          alignItems: "center",
          justifyItems: "start",
        }}
      >
        <IconButton onClick={screen.cancel}>
          <ArrowBack />
        </IconButton>
        <Typography variant="body1" component="h2" width="100%" align="center">
          About Cedra Connect
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          pb: 1.5,
          alignItems: "end",
          justifyContent: "center",
          height: "162px",
        }}
      >
        <screen.Graphic />
      </Box>
      <Stack sx={{ gap: 1, textAlign: "center", pb: 2 }}>
        <Typography component={screen.Title} variant="h6" />
        <Typography
          component={screen.Description}
          variant="body2"
          color={(theme) => theme.palette.text.secondary}
          sx={{
            "&>a": {
              color: (theme) => theme.palette.text.primary,
              textDecoration: "underline",
              textUnderlineOffset: "4px",
            },
          }}
        />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          alignItems: "center",
        }}
      >
        <Button
          size="small"
          variant="text"
          onClick={screen.back}
          sx={{ justifySelf: "start" }}
        >
          Back
        </Button>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            placeSelf: "center",
          }}
        >
          {screen.screenIndicators.map((ScreenIndicator, i) => (
            <Box
              key={i}
              component={ScreenIndicator}
              sx={{
                px: 0,
                py: 2,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Box
                sx={{
                  height: "2px",
                  width: "24px",
                  bgcolor: (theme) => theme.palette.text.disabled,
                  "[data-active]>&": {
                    bgcolor: (theme) => theme.palette.text.primary,
                  },
                }}
              />
            </Box>
          ))}
        </Box>
        <Button
          size="small"
          variant="text"
          onClick={screen.next}
          sx={{ justifySelf: "end" }}
          endIcon={<ArrowForward sx={{ height: 16, width: 16 }} />}
        >
          {screen.screenIndex === screen.totalScreens - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </>
  );
}
