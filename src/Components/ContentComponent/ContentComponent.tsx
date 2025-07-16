import React, { useState, useEffect, useMemo } from "react";

const ContentComponent: React.FC = () => {
  const [spotifyTaskTitle, setSpotifyTaskTitle] = useState<string>("");
  const [lyrics, setLyrics] = useState<string>("");
  const [prevLyrics, setPrevLyrics] = useState<string>("None");
  const [textColor, setTextColor] = useState<string>("");

  const [transp, setTransp] = useState(0);

  const sanitizedLyrics = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(lyrics, "text/html");
    const links = doc.querySelectorAll("a");

    links.forEach((link) => {
      link.removeAttribute("href");
    });

    return doc.body.innerHTML;
  }, [lyrics]);

  // const getData = () => {
  //   window.electron.onSpotifyTaskTitle((song: string) => {
  //     if (song !== "") {
  //       setSpotifyTaskTitle(song ? `${song}` : "Текст песни не найден"); //Takes song title
  //     }
  //   });
  //   window.electron.onSpotifyTaskLyrics((text: string) => {
  //     if (text !== "") {
  //       setLyrics(text); //Takes song lyrics
  //     }
  //   });
  //   window.electron.onSpotifyTasTextColor((textcolor: string) => {
  //     if (textcolor !== "") {
  //       setTextColor(textcolor); //Takes song text color
  //     }
  //   });
  // };


  useEffect(() => {
    const getDataTaskTitle = (song: string) => {
      if (song !== "") {
        setSpotifyTaskTitle(song ? `${song}` : "Текст песни не найден"); //Takes song title
      }
    }

    const getDataTaskLyrics = (text: string) => {
      if (text !== "") {
        setLyrics(text); //Takes song lyrics
      }
    }

    const getDataTextColor = (textcolor: string) => {
      if (textcolor !== "") {
        setTextColor(textcolor); //Takes song text color
      }
    }

    const removeDataTaskTile = window.electron.onSpotifyTaskTitle(getDataTaskTitle);
    const removeDataTaskLyrics = window.electron.onSpotifyTaskLyrics(getDataTaskLyrics);
    const removeDataTextColor = window.electron.onSpotifyTasTextColor(getDataTextColor);

    setTransp(0);
    if (prevLyrics !== lyrics) {
      setTimeout(() => {
        setTransp(1);
        setPrevLyrics(lyrics);
      }, 500);
    } else {
      setTransp(1);
    }

    return () => {
      removeDataTaskLyrics();
      removeDataTextColor();
      removeDataTaskTile();
    }
  }, [lyrics]);

  return (
    <>
      <h1 className="ProgrammTitle" style={{ color: `${textColor}` }}>
        Let's Find Out
      </h1>
      <p className="SongTitle" style={{ color: `${textColor}` }}>
        {spotifyTaskTitle}
      </p>
      <div className="LyrMain" style={{ opacity: `${transp}` }}>
        <div
          dangerouslySetInnerHTML={{ __html: sanitizedLyrics }}
          className="LyricsDiv roboto-flex-mid"
          style={{ color: textColor }}
        ></div>
      </div>
    </>
  );
};

export default ContentComponent;
