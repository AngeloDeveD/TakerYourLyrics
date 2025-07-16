import React from "react";
import { useDispatch } from "react-redux";
import { toggleSettings } from "../../slices/settingsSlice";

const TitlebarButtons: React.FC = () => {
  const dispatch = useDispatch();

  //const [panelStyle, setPanelStyle] = useState<boolean>(false);
  //const [textColor, setTextColor] = useState<string>('');

  const openSettings = () => {
    dispatch(toggleSettings());
  };

  const minimize = () => {
    window.electron.minimizeWindow();
  };

  const toggleMaximize = () => {
    window.electron.maximizeWindow();
  };

  const close = () => {
    window.electron.closeWindow();
  };

  return (
    <>
      <div className="titlebar">
        <button
          className="window-controls window-controls-button controls-button-settings"
          onClick={openSettings}
        ></button>
        <div className="drag-region"></div>
        <div className="window-controls">
          <button
            className="window-controls window-controls-button controls-button-hide"
            onClick={minimize}
          ></button>
          <button
            className="window-controls window-controls-button controls-button-minimize"
            onClick={toggleMaximize}
          ></button>
          <button
            className="window-controls window-controls-button controls-button-close"
            onClick={close}
          ></button>
        </div>
      </div>
    </>
  );
};

export default TitlebarButtons;
