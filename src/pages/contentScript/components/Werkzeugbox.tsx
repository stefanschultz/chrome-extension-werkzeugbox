import ExtPay from "extpay";
import {
    Keyboard,
    Monitor,
    Mouse,
    SettingsOption,
    TextAlignLeft,
    Tree,
} from "grommet-icons";
import React, { useEffect, useState } from "react";
import { Configuration } from "../constants/Config";
import { SubscriptionStatus } from "../constants/ExtensionPayConstants";
import { useExtensionStore } from "../stores/ExtensionStore";
import { PrimaryButton } from "../styles/Common.styled";
import {
    ButtonContainer,
    WerkzeugboxClose,
    WerkzeugboxContainer,
    WerkzeugboxHeader,
    WerkzeugboxTitle,
} from "../styles/Werkzeugbox.styled";
import Accordion from "./Accordion";
import HtmlMetaTagAnalyzerTool from "./HtmlMetaTagAnalyzerTool";
import HtmlTagTreeTool from "./HtmlTagTreeTool";
import KeyboardTool from "./KeyboardTool";
import MouseTool from "./MouseTool";
import ScreenTool from "./ScreenTool";
import Settings from "./Settings";

const Werkzeugbox = () => {
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [left, setLeft] = useState("2rem");
    const [top, setTop] = useState("2rem");
    const extensionStore = useExtensionStore();
    const extpay = ExtPay("chrome-extension-werkzeugbox");

    useEffect(() => {
        extpay
            .getUser()
            .then((user) => {
                extensionStore.setHasUserPaid(user.paid);
                extensionStore.setSubscriptionStatus(user.subscriptionStatus);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        setDragOffset({
            x: event.clientX - event.currentTarget.offsetLeft,
            y: event.clientY - event.currentTarget.offsetTop,
        });
    };

    const handleMouseMove = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        if (event.buttons === 1) {
            setLeft(`${event.clientX - dragOffset.x}px`);
            setTop(`${event.clientY - dragOffset.y}px`);
        }
    };

    const handleCloseExtension = () => {
        const rootElement = document.getElementById(Configuration.EXTENSION_ID);
        if (rootElement) rootElement.style.display = "none";
    };

    const handleRemoveExtension = () => {
        const rootElement = document.getElementById(Configuration.EXTENSION_ID);
        if (rootElement) rootElement.remove();
    };

    const handleOpenPaymentPage = () => {
        extpay.openPaymentPage();
        handleRemoveExtension();
    };

    const handleOpenLoginPage = () => {
        extpay.openLoginPage();
        handleRemoveExtension();
    };

    return (
        <WerkzeugboxContainer
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            left={left}
            top={top}
        >
            <WerkzeugboxHeader>
                <WerkzeugboxTitle>Werkzeugbox</WerkzeugboxTitle>
                <WerkzeugboxClose onClick={handleCloseExtension}>
                    X
                </WerkzeugboxClose>
            </WerkzeugboxHeader>
            {!extensionStore.hasUserPaid && (
                <ButtonContainer>
                    <PrimaryButton
                        onClick={handleOpenPaymentPage}
                        title="Subscribe Now"
                        type="button"
                    >
                        Subscribe Now
                    </PrimaryButton>
                </ButtonContainer>
            )}
            {extensionStore.hasUserPaid &&
                extensionStore.subscriptionStatus &&
                extensionStore.subscriptionStatus !==
                    SubscriptionStatus.active && (
                    <ButtonContainer>
                        <PrimaryButton
                            onClick={handleOpenLoginPage}
                            title="Login"
                            type="button"
                        >
                            Subscribe Now
                        </PrimaryButton>
                    </ButtonContainer>
                )}
            <Accordion
                isFeatureEnabled={
                    extensionStore.hasUserPaid &&
                    extensionStore.subscriptionStatus ===
                        SubscriptionStatus.active
                }
                accordionItems={[
                    {
                        icon: <Monitor size="small" />,
                        headerTitle: "Screen",
                        content: <ScreenTool />,
                        premiumFeature: false,
                    },
                    {
                        icon: <Mouse size="small" />,
                        headerTitle: "Mouse",
                        content: <MouseTool />,
                        premiumFeature: false,
                    },
                    {
                        icon: <Keyboard size="small" />,
                        headerTitle: "Keyboard",
                        content: <KeyboardTool />,
                        premiumFeature: false,
                    },
                    {
                        icon: <TextAlignLeft size="small" />,
                        headerTitle: "HTML Meta Tag Analyzer",
                        content: <HtmlMetaTagAnalyzerTool url={document.URL} />,
                        premiumFeature: true,
                    },
                    {
                        icon: <Tree size="small" />,
                        headerTitle: "HTML Tag Tree",
                        content: <HtmlTagTreeTool />,
                        premiumFeature: true,
                    },
                    {
                        icon: <SettingsOption size="small" />,
                        headerTitle: "Settings",
                        content: <Settings />,
                        premiumFeature: false,
                    },
                ]}
                activeIndexes={[]}
            />
        </WerkzeugboxContainer>
    );
};

export default Werkzeugbox;
