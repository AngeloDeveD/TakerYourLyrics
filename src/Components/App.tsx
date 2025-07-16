import React, { useState, useEffect, lazy, Suspense } from "react";
import TitlebarButtons from "./TitleBarButtons/titlebarButtons";
import SettingsComponent from "./SettingsComponent/SettingsComponent";
import "../App.scss";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const ContentComponent = lazy(
  () => import("./ContentComponent/ContentComponent")
);

const App: React.FC = () => {
  const [color, setColor] = useState<string>("");
  const [secondColor, setSecondColor] = useState<string>("");
  const [otherColors, setOtherColors] = useState<string[]>([]);

  const settings = useSelector((state: RootState) => state.settings.settings);

  const [sendSettings, setSendSettings] = useState<boolean>(false);

  function hexToRgb(hex: string): [number, number, number] {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  function rgbToHex(r: number, g: number, b: number): string {
    return (
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    );
  }

  function lightenColor(
    color: [number, number, number],
    factor: number
  ): [number, number, number] {
    return color.map((channel) =>
      Math.min(255, Math.round(channel + (255 - channel) * factor))
    ) as [number, number, number];
  }

  function darkenColor(
    color: [number, number, number],
    factor: number
  ): [number, number, number] {
    return color.map((channel) =>
      Math.max(0, Math.round(channel * (1 - factor)))
    ) as [number, number, number];
  }

  function interpolateColor(
    color1: [number, number, number],
    color2: [number, number, number],
    factor: number = 0.5
  ): [number, number, number] {
    const result: [number, number, number] = color1.slice() as [
      number,
      number,
      number
    ];
    for (let i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
    }
    return result;
  }

  function generateIntermediateColors(hex1: string, hex2: string): string[] {
    const color1 = hexToRgb(hex1);
    const color2 = hexToRgb(hex2);
    const colors: string[] = [];

    // Первый цвет - чуть светлее первого HEX цвета
    const lighterColor1 = lightenColor(color1, 0.2);
    colors.push(rgbToHex(...lighterColor1));

    // Второй цвет - середина между первым и вторым цветами
    const middleColor = interpolateColor(color1, color2);
    colors.push(rgbToHex(...middleColor));

    // Третий цвет - чуть темнее второго HEX цвета
    const darkerColor2 = darkenColor(color2, 0.2);
    colors.push(rgbToHex(...darkerColor2));

    return colors;
  }

  const getData = () => {
    window.electron.onSpotifyTaskColor((color: string) => {
      setColor(color); //Takes song main color
    });
    window.electron.onSpotifyTaskSecondColor((second_color: string) => {
      setSecondColor(second_color); //Takes song secondory color
    });
  };

  useEffect(() => {
    getData();
    setOtherColors(generateIntermediateColors(color, secondColor));
    setSendSettings(settings);
    console.log("Settings:", settings);
  }, [color, secondColor, settings]);

  return (
    <>
      <div
        className="MainDivComponent"
        style={{
          backgroundImage: `linear-gradient(-45deg, ${otherColors[0]}, ${color}, ${otherColors[1]}, ${secondColor}, ${otherColors[2]})`,
        }}
      >
        <TitlebarButtons />
        <div className="centerDiv">
          <Suspense
            fallback={
              <>
                <h1 className="ProgrammTitle">Please Wait!!</h1>
              </>
            }
          >
            <ContentComponent />
          </Suspense>
        </div>
        <SettingsComponent settings={sendSettings} />
      </div>
    </>
  );
};

export default App;
