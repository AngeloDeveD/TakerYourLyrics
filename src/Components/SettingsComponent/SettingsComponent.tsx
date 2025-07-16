import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toggleSettings } from "../../slices/settingsSlice";

import "./SettingsComponent.scss";

type Props = { settings: boolean };

interface Settings {
    panelStyle: boolean;
    fullscreen: boolean;
    hide: boolean;
}

const SettingsComponent: React.FC<Props> = (props) => {
    const [animationClass, setAnimationClass] = useState<string>("");
    const [allSettings, setAllSettings] = useState<Settings>({ panelStyle: true, fullscreen: false, hide: false });
    const [panelStyle, setPanelStyle] = useState<boolean>(true);
    const [fullscreen, setFullscreen] = useState<boolean>(false);
    const [hide, setHide] = useState<boolean>(false);

    const [color, setColor] = useState<string>("");
    const [textColor, setTextColor] = useState<string>("");

    const [confirmationMenu, setConfirmationMenu] = useState<boolean>(false);
    const [confirm, setConfirm] = useState<boolean>(false);

    const dispatch = useDispatch();

    const closeSettings = () => {
        setConfirm(false);
        dispatch(toggleSettings());
    };

    const SaveSettings = (): void => {
        if (allSettings.panelStyle !== panelStyle || allSettings.fullscreen !== fullscreen) {
            setConfirmationMenu(true);
        } else {
            setConfirmationMenu(false);
            setConfirm(true);
        }
        const settings = {
            panelStyle,
            fullscreen,
            hide,
        };
        if (confirm) {
            window.ipcRenderer.send("save-settings", settings);
            closeSettings();
        }
    };

    const ConfirmSettings = () => {
        setConfirm(true);
        SaveSettings();
    };

    const getData = () => {
        window.electron.onSpotifyTaskColor((color: string) => {
            setColor(color); //Takes song main color
        });
        window.electron.onSpotifyTasTextColor((textcolor: string) => {
            setTextColor(textcolor);
        });
    }

    useEffect(() => {
        const handleSettings = (settings: Settings): void => {
            if (settings) {
                setAllSettings(settings);
                setPanelStyle(settings.panelStyle);
                setFullscreen(settings.fullscreen);
                setHide(settings.hide);
            }
        };

        const removeListener = window.electron.onSpotifyTaskSettings(handleSettings);

        return () => {
            removeListener();
        };
    }, []);

    useEffect(() => {
        getData();
        console.log(color);
        if (props.settings) {
            setAnimationClass("fade-in");
        } else {
            setAnimationClass("fade-out");
        }
    }, [props.settings]);

    return (
        <>
            <div className={`SettingsMainContainer ${animationClass}`}>
                <div className="SettingsContentContainer">
                    <div className="SettingsPanelContainer">
                        <input
                            type="checkbox"
                            onChange={() => setHide(!hide)}
                            checked={hide}
                            className="SettingsPanelCheckbox"
                            id="hideCheckbox"
                        />
                        <label htmlFor="hideCheckbox" className="SettingsPanelTitle noselect">
                            Не закрывать, а скрывать программу
                        </label>
                    </div>
                    <div className="SettingsPanelContainer">
                        <input
                            type="checkbox"
                            onChange={() => setFullscreen(!fullscreen)}
                            checked={fullscreen}
                            className="SettingsPanelCheckbox"
                            id="hideCheckboxFl"
                        />
                        <label htmlFor="hideCheckboxFl" className="SettingsPanelTitle noselect">
                            Включить развёрнутый режим
                        </label>
                    </div>
                </div>
                <button className="SettingsPanelSaveButton" onClick={SaveSettings} style={{ backgroundColor: `${color}`, color: `${textColor}` }}>Сохранить</button>
                {confirmationMenu &&
                    <>
                        <div className="ConfirmBackground">
                            <div className="ConfirmComponent">
                                <div className="ConfirmWarning">
                                    <h2 className="ConfirmWarning__text" style={{ color: textColor }}>Для применения настроек требуется перезагрузка</h2>
                                </div>
                                <div className="ConfirmButtons__component">
                                    <button className="ConfirmButtons__button Confirm" onClick={ConfirmSettings} style={{ color: textColor, backgroundColor: color }}>Перезагрузить</button>
                                    <button className="ConfirmButtons__button Cancel" onClick={() => setConfirmationMenu(false)} style={{ color: color, backgroundColor: textColor }}>Отмена</button>
                                </div>
                            </div>
                        </div>
                    </>
                }
            </div>
            <style>
                {`
                    input[type="checkbox"]:checked+label:before {
                        background: ${color};
                        border-color: ${color};
                        border-radius: 5px;
                        border: 2px solid #0000004a;
                    }
                    
                    .SettingsPanelTitle {
                        margin: 0;
                        padding: 0;
                        font-size: 18px;
                        line-height: 30px;
                        color: ${textColor};
                    }

                    input[type="checkbox"]:checked+label:after {
                        content: "";
                        position: absolute;
                        left: 0;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 18px;
                        height: 18px;
                        border: 2px solid #0000003d;
                        border-radius: 5px;
                        background: ${color};
                `}
            </style>
        </>
    );
};

export default SettingsComponent;
