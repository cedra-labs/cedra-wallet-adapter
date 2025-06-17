import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
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
  truncateAddress,
  useWallet,
} from "@cedra-labs/wallet-adapter-react";
import {
  Button,
  Collapse,
  Divider,
  Flex,
  Modal,
  ModalProps,
  Typography,
} from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "./styles.css";

const { Text } = Typography;

interface WalletSelectorProps extends WalletSortingOptions {
  isModalOpen?: boolean;
  setModalOpen?: Dispatch<SetStateAction<boolean>>;
}

export function WalletSelector({
  isModalOpen,
  setModalOpen,
  ...walletSortingOptions
}: WalletSelectorProps) {
  const [walletSelectorModalOpen, setWalletSelectorModalOpen] = useState(false);

  useEffect(() => {
    // If the component is being used as a controlled component,
    // sync the external and internal modal state.
    if (isModalOpen !== undefined) {
      setWalletSelectorModalOpen(isModalOpen);
    }
  }, [isModalOpen]);

  const {
    account,
    connected,
    disconnect,
    wallets = [],
    notDetectedWallets = [],
  } = useWallet();

  const { cedraConnectWallets, availableWallets, installableWallets } =
    groupAndSortWallets(
      [...wallets, ...notDetectedWallets],
      walletSortingOptions,
    );

  const hasCedraConnectWallets = !!cedraConnectWallets.length;

  const onWalletButtonClick = () => {
    if (connected) {
      disconnect();
    } else {
      setWalletSelectorModalOpen(true);
    }
  };

  const closeModal = () => {
    setWalletSelectorModalOpen(false);
    if (setModalOpen) {
      setModalOpen(false);
    }
  };

  const buttonText =
    account?.ansName ||
    truncateAddress(account?.address?.toString()) ||
    "Unknown";

  const modalProps: ModalProps = {
    centered: true,
    open: walletSelectorModalOpen,
    onCancel: closeModal,
    footer: null,
    zIndex: 9999,
    className: "wallet-selector-modal",
  };

  const renderEducationScreens = (screen: AboutCedraConnectEducationScreen) => (
    <Modal
      {...modalProps}
      afterClose={screen.cancel}
      title={
        <div className="about-cedra-connect-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={screen.cancel}
          />
          <div className="wallet-modal-title">About Cedra Connect</div>
        </div>
      }
    >
      <div className="about-cedra-connect-graphic-wrapper">
        <screen.Graphic />
      </div>
      <div className="about-cedra-connect-text-wrapper">
        <screen.Title className="about-cedra-connect-title" />
        <screen.Description className="about-cedra-connect-description" />
      </div>
      <div className="about-cedra-connect-footer-wrapper">
        <Button
          type="text"
          style={{ justifySelf: "start" }}
          onClick={screen.back}
        >
          Back
        </Button>
        <div className="about-cedra-connect-screen-indicators-wrapper">
          {screen.screenIndicators.map((ScreenIndicator, i) => (
            <ScreenIndicator
              key={i}
              className="about-cedra-connect-screen-indicator"
            >
              <div />
            </ScreenIndicator>
          ))}
        </div>
        <Button
          type="text"
          icon={<ArrowRightOutlined />}
          iconPosition="end"
          style={{ justifySelf: "end" }}
          onClick={screen.next}
        >
          {screen.screenIndex === screen.totalScreens - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </Modal>
  );

  return (
    <>
      <Button className="wallet-button" onClick={onWalletButtonClick}>
        {connected ? buttonText : "Connect Wallet"}
      </Button>
      <AboutCedraConnect renderEducationScreen={renderEducationScreens}>
        <Modal
          {...modalProps}
          title={
            <div className="wallet-modal-title">
              {hasCedraConnectWallets ? (
                <>
                  <span>Log in or sign up</span>
                  <span>with Social + Cedra Connect</span>
                </>
              ) : (
                "Connect Wallet"
              )}
            </div>
          }
        >
          {!connected && (
            <>
              {hasCedraConnectWallets && (
                <Flex vertical gap={12}>
                  {cedraConnectWallets.map((wallet) => (
                    <CedraConnectWalletRow
                      key={wallet.name}
                      wallet={wallet}
                      onConnect={closeModal}
                    />
                  ))}
                  <p className="about-cedra-connect-trigger-wrapper">
                    Learn more about{" "}
                    <AboutCedraConnect.Trigger className="about-cedra-connect-trigger">
                      Cedra Connect
                      <ArrowRightOutlined />
                    </AboutCedraConnect.Trigger>
                  </p>
                  <CedraPrivacyPolicy className="cedra-connect-privacy-policy-wrapper">
                    <p className="cedra-connect-privacy-policy-text">
                      <CedraPrivacyPolicy.Disclaimer />{" "}
                      <CedraPrivacyPolicy.Link className="cedra-connect-privacy-policy-link" />
                      <span>.</span>
                    </p>
                    <CedraPrivacyPolicy.PoweredBy className="cedra-connect-powered-by" />
                  </CedraPrivacyPolicy>
                  <Divider>Or</Divider>
                </Flex>
              )}
              <Flex vertical gap={12}>
                {availableWallets.map((wallet) => (
                  <WalletRow
                    key={wallet.name}
                    wallet={wallet}
                    onConnect={closeModal}
                  />
                ))}
              </Flex>
              {!!installableWallets.length && (
                <Collapse
                  ghost
                  expandIconPosition="end"
                  items={[
                    {
                      key: "more-wallets",
                      label: "More Wallets",
                      children: (
                        <Flex vertical gap={12}>
                          {installableWallets.map((wallet) => (
                            <WalletRow
                              key={wallet.name}
                              wallet={wallet}
                              onConnect={closeModal}
                            />
                          ))}
                        </Flex>
                      ),
                    },
                  ]}
                />
              )}
            </>
          )}
        </Modal>
      </AboutCedraConnect>
    </>
  );
}

interface WalletRowProps {
  wallet: AdapterWallet | AdapterNotDetectedWallet;
  onConnect?: () => void;
}

function WalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <WalletItem wallet={wallet} onConnect={onConnect} asChild>
      <div className="wallet-menu-wrapper">
        <div className="wallet-name-wrapper">
          <WalletItem.Icon className="wallet-selector-icon" />
          <WalletItem.Name asChild>
            <Text className="wallet-selector-text">{wallet.name}</Text>
          </WalletItem.Name>
        </div>
        {isInstallRequired(wallet) ? (
          <WalletItem.InstallLink className="wallet-connect-install" />
        ) : (
          <WalletItem.ConnectButton asChild>
            <Button className="wallet-connect-button">Connect</Button>
          </WalletItem.ConnectButton>
        )}
      </div>
    </WalletItem>
  );
}

function CedraConnectWalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <WalletItem wallet={wallet} onConnect={onConnect} asChild>
      <WalletItem.ConnectButton asChild>
        <Button size="large" className="cedra-connect-button">
          <WalletItem.Icon className="wallet-selector-icon" />
          <WalletItem.Name />
        </Button>
      </WalletItem.ConnectButton>
    </WalletItem>
  );
}
