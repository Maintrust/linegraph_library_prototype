import { Diagram } from "./diagram.js";

const canvasTag = document.querySelector("canvas");

const ctx = canvasTag.getContext("2d");

canvasTag.width = 700;
canvasTag.height = 600;

const diagram = new Diagram(ctx, {
  type: "line",
  scale: {
    xScaleLabel: "Countries",
    yScaleLabel: "People",
    scaleStyle: {
      font: "14px Helvetica",
      scaleColor: "#444",
      scaleWidth: 2,
      subScaleColor: "#bbb",
      subScaleWidth: 1,
    },
  },
  data: {
    dataLines: [
      {
        name: "customers",
        dataArr: [
          ["Russia", 434],
          ["England", 566],
          ["Luxemburg", 999],
          ["Monaco", 456],
          ["Canada", 235],
          ["Ethiopia", 979],
        ],
      },

      {
        dataArr: [
          ["Russia", 250],
          ["England", 320],
          ["Luxemburg", 110],
          ["Monaco", 678],
          ["Canada", 432],
          ["Ethiopia", 143],
        ],
      },

      {
        name: "bubbles",
        dataArr: [
          ["Russia", 900],
          ["England", 432.26],
          ["Luxemburg", 800],
          ["Monaco", 686],
          ["Canada", 233],
          ["Ethiopia", 323],
        ],
      },
      {
        dataArr: [
          ["Russia", 140],
          ["England", 530],
          ["Luxemburg", 250],
          ["Monaco", 888],
          ["Canada", 552],
          ["Ethiopia", 332],
        ],
      },
      {
        name: "customers",
        dataArr: [
          ["Russia", 325],
          ["England", 864],
          ["Luxemburg", 436],
          ["Monaco", 111],
          ["Canada", 534],
          ["Ethiopia", 575],
        ],
      },
    ],
    dataStyle: {
      strokeWidth: 2,
      points: "circle",
      pointsRadius: 4,
    },
  },
}).createDiagram();

diagram.changeStyles({
  scale: {
    font: "14px Arial",
    scaleColor: "#242424",
    scaleWidth: 2,
    subScaleColor: "#bbb",
    subScaleWidth: 1,
  },
});
diagram.changeStyles({
  data: { pointsRadius: 4, strokeWidth: 2, points: "circle" },
});
