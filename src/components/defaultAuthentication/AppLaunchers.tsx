import React, { useState, useEffect, FunctionComponent } from "react";
import {
    AdvancedAppLauncherMenu,
    AppLauncherMenu,
} from "@finsemble/finsemble-ui/react/components/toolbar";

/* #region Customisation for dynamically configurable menus */
type MenuConfig = {
    label?: string;
    menuType: string;
    align: string;
    customData: {
        list?: any[];
        mode?: string;
    };
    icon?: string;
    fontIcon?: string;
};
type AppLaunchersProps = {
    align: string;
    //dynamicMenus: MenuConfig[];
    //components: any;
};
export const AppLaunchers: FunctionComponent<AppLaunchersProps> = ({ align }) => {
    //const { dynamicMenus, components, align } = props;
    /* #endregion */
    /* #region retrieve Finsemble config for dynamically configured menus */
    const [dynamicMenus, setDynamicMenus] = useState([] as any[]);
    const [components, setComponents] = useState<Record<string,any>>({});
    useEffect(() => {
        FSBL.Clients.ConfigClient.getValue("finsemble", (err: any, config: any) => {
            const menuConfig = config.menus;
            const components: Record<string,{}> = config.components;
            if (Array.isArray(menuConfig)) {
                setDynamicMenus(
                    menuConfig.filter((menu) => menu.menuType === "App Launcher" || menu.menuType === "Advanced App Launcher"),
                );
                setComponents(
                    components
                );
            }
        });
    }, []);
    /* endregion */


    if (dynamicMenus.length === 0) {
        return (
            <>
                <AppLauncherMenu enableQuickComponents={true} />
            </>
        );
    } else {
        return (
            <>
                {dynamicMenus.map((config, i) => {
                    if (align == config.align) {
                        let theTitle: JSX.Element | string = "Apps";
                        if (config.icon) {
                            theTitle = <span>
                                <img src={config.icon} style={{ verticalAlign: "middle", marginRight: "5px" }} />
                                {config.label ? config.label : ""}
                            </span>
                        } else if (config.fontIcon) {
                            theTitle = <span>
                                <i className={config.fontIcon} style={{ verticalAlign: "middle", marginRight: "5px" }} />
                                {config.label ? config.label : ""}
                            </span>
                        } else if (config.label) {
                            theTitle = config.label;
                        }

                        if (config.menuType === "Advanced App Launcher") {
                            return (
                                <AdvancedAppLauncherMenu
                                    title={theTitle}
                                    id={`menu-${i}`}
                                    enableQuickComponents={true}
                                />
                            );
                        } else {
                            if (config.customData.mode) {
                                let allComps = Object.keys(components);
                                let list: string[] = [];
                                allComps.forEach(key => {
                                    if (components[key].component && components[key].component.mode == config.customData.mode) {
                                        list.push(key);
                                    }
                                });

                                return (
                                    <AppLauncherMenu
                                        title={theTitle}
                                        id={`menu-${i}`}
                                        componentFilter={list}
                                        enableQuickComponents={false}
                                    />
                                );
                            } else {
                                return (
                                    <AppLauncherMenu
                                        title={theTitle}
                                        id={`menu-${i}`}
                                        componentFilter={config.customData.list}
                                        enableQuickComponents={false}
                                    />
                                );
                            }
                        }
                    }
                })}
            </>
        );
    }
};

