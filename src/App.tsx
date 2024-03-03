import "./App.css";
import * as PIXI from "PIXI.js";

const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
const [viewportWidth, viewportHeight] =
  windowWidth / windowHeight < 16 / 9
    ? [windowWidth, (windowWidth * 9) / 16]
    : [(windowHeight * 16) / 9, windowHeight];

const app = new PIXI.Application({
  width: viewportWidth,
  height: viewportHeight,
  backgroundColor: 0xffffff,
  // resolution: window.devicePixelRatio || 1,
  // antialias: true,
  // autoDensity: true,
});

const isVertical = window.innerHeight > window.innerWidth;

if (isVertical) {
  document.body.style.transform = "rotate(-90deg)";
  document.body.style.transformOrigin = "left top";
  document.body.style.width = "100vh";
  document.body.style.height = "100vw";
  if (app.view.style)
    (app.view.style as { transform: string }).transform = "rotate(90deg)";
  app.stage.x = app.screen.height;
  app.stage.y = 0;
}

const manifest: PIXI.AssetsManifest = {
  bundles: [
    {
      name: "gui-screen",
      assets: {
        dialog: "/gui/dialog.png",
      },
    },
    {
      name: "channel-screen",
      assets: {
        character: "/images/character/c1.png",
        background: "/images/bg.png",
      },
    },
  ],
};

PIXI.Assets.init({ manifest });
PIXI.Assets.loadBundle(["gui-screen", "channel-screen"]).then((textures) => {
  const dialog = new PIXI.Sprite(textures["gui-screen"].dialog);
  const character = new PIXI.Sprite(textures["channel-screen"].character);
  const background = new PIXI.Sprite(textures["channel-screen"].background);

  /*   if (window.innerHeight > window.innerWidth && app.renderer.view.style) {
    app.renderer.view.style.width = "100%";
    app.renderer.view.style.height = "auto";
  } */

  const channelHeight = app.screen.height / 16;
  character.position.set(
    app.screen.width / 3,
    (app.screen.height - channelHeight) / 20
  );
  dialog.position.set(
    (app.screen.width * 2) / 3,
    (app.screen.height - channelHeight) / 2
  );

  app.stage.addChild(dialog, background, character);
});

document.body.appendChild(app.view as unknown as Node);

function App() {
  return <></>;
}

export default App;
