export class Diagram {
  constructor(ctx, { type, scale = {}, data = {} }) {
    this.createDiagram = function () {
      let diagram;

      if (!ctx || !type) {
        throw new ValidationError(
          "Ошибка в инициализации графика: ctx или type не определны"
        );
      }

      // определяем тип графика
      if (type === "line") {
        diagram = new LineDiagram(ctx, scale, data);
        diagram.initEventListeners();
        diagram.update();
      }
      return diagram;
    };
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

class LineDiagram {
  constructor(ctx, scale, data) {
    this.ctx = ctx;
    this.scale = scale || null;
    this.data = data || null;

    // Создаем дополнительные элементы
    this.tip = document.createElement("div");
    this.scaleXSlider = document.createElement("input");
    this.scaleYSlider = document.createElement("input");
    this.paramsWrapper = document.createElement("div");

    // параметры слайдеров для зума
    this.scaleXSlider.type = this.scaleYSlider.type = "range";
    this.scaleXSlider.min = this.scaleYSlider.min = "1";
    this.scaleXSlider.max = this.scaleYSlider.max = "6";
    this.scaleXSlider.step = this.scaleYSlider.step = "0.1";
    this.scaleXSlider.value = this.scaleYSlider.value = "1";

    // добавляем к канвасу свойства для отслеживания позиции
    this.ctx.canvas.moveX = 0;
    this.ctx.canvas.moveY = 0;
    this.ctx.canvas.lastMoveX = 0;
    this.ctx.canvas.lastMoveY = 0;
    this.ctx.canvas.update = this.update;
  }

  initEventListeners() {
    // байндим контекст для реализация перемещения графика
    this.update = this.update.bind(this);
    this.ctx.canvas.update = this.ctx.canvas.update.bind(this);
    // this.update();

    // добавляем обрабтчики событий
    window.addEventListener("resize", this.update);
    this.scaleXSlider.addEventListener("input", this.update);
    this.scaleYSlider.addEventListener("input", this.update);
    this.ctx.canvas.addEventListener("mousedown", move);

    // добавляем дополнительные элементы к документу
    document.body.appendChild(this.scaleXSlider);
    document.body.appendChild(this.scaleYSlider);
    document.body.appendChild(this.tip);
    document.body.appendChild(this.paramsWrapper);

    function move(e) {
      // находим координату клика
      const downX = e.pageX - e.target.offsetLeft,
        downY = e.pageY - e.target.offsetTop;

      this.addEventListener("mousemove", mouseMove);

      function mouseMove(e) {
        // находим перемещение из координаты клика
        const moveX = e.pageX - e.target.offsetLeft - downX,
          moveY = e.pageY - e.target.offsetTop - downY;

        // берем предыдущее перемещение
        this.moveX = this.lastMoveX;
        this.moveY = this.lastMoveY;
        // прибавляем к нему текущее перемещение
        this.moveX += moveX;
        this.moveY += moveY;

        // обновляем график с перемещением
        this.update(moveX, moveY);
      }

      this.addEventListener("mouseup", turnOff);

      function turnOff() {
        this.removeEventListener("mousemove", mouseMove);
        // записываем проделанное перемещение
        this.lastMoveX = this.moveX;
        this.lastMoveY = this.moveY;
      }
    }
  }

  update() {
    // переопределям размеры канваса до минимальных, если размеры были меньше допустимых
    if (this.ctx.canvas.height < 350) {
      this.ctx.canvas.height = 350;
    }
    if (this.ctx.canvas.width < 400) {
      this.ctx.canvas.width = 400;
    }

    // если нет всех данных, добавляем пустые свойства. Далее буду назначены значения по умолчанию
    if (!this.scale) {
      this.scale = {};
    }

    if (!this.scale.scaleStyle) {
      this.scale.scaleStyle = {};
    }

    if (!this.data.dataStyle) {
      this.data.dataStyle = {};
    }

    // переменная поля
    const field = {
      canvasWidth: this.ctx.canvas.width,
      canvasHeight: this.ctx.canvas.height,
      xBlock: [
        0,
        this.ctx.canvas.height - 100,
        this.ctx.canvas.width,
        this.ctx.canvas.height,
      ],
      yBlock: [0, 0, 100, this.ctx.canvas.height],
      topBlock: [0, 0, this.ctx.canvas.width, 80],
      zeroPoint: [100, this.ctx.canvas.height - 100],
    };

    // переменная осей
    const currentScales = {
      xScaleLabel: this.scale.xScaleLabel || null,
      yScaleLabel: this.scale.yScaleLabel || null,
      scaleStyle: {
        font: this.scale.scaleStyle.font || "14px Helvetica",
        scaleColor: this.scale.scaleStyle.scaleColor || "#444",
        scaleWidth: this.scale.scaleStyle.scaleWidth || 2,
        subScaleColor: this.scale.scaleStyle.subScaleColor || "#ccc",
        subScaleWidth: this.scale.scaleStyle.subScaleWidth || 1,
      },
    };

    // переменная данных
    const currentData = {
      dataLines: this.data.dataLines || null,
      dataStyle: {
        strokeWidth: this.data.dataStyle.strokeWidth || 2,
        points: this.data.dataStyle.points || "circle",
        pointsRadius: this.data.dataStyle.pointsRadius || 4,
        colors: [
          "red",
          "green",
          "blue",
          "yellow",
          "coral",
          "pink",
          "orange",
          "brown",
          "purple",
          "red",
          "green",
          "blue",
          "yellow",
          "coral",
          "pink",
          "orange",
          "brown",
          "purple",
          "red",
          "green",
          "blue",
          "yellow",
          "coral",
          "pink",
          "orange",
          "brown",
          "purple",
        ], // цвета по умолчанию
      },
    };

    this.draw(
      this.ctx,
      field,
      currentScales,
      currentData,
      this.tip,
      this.paramsWrapper,
      this.scaleXSlider,
      this.scaleYSlider,
      this.ctx.canvas.moveX,
      this.ctx.canvas.moveY
    );
  }

  draw(
    ctx,
    field,
    currentScales,
    currentData,
    tip,
    paramsWrapper,
    scaleXSlider,
    scaleYSlider,
    moveX,
    moveY
  ) {
    if (!currentData.dataLines) {
      throw new Error(
        "Ошибка при отрисовке графика: нет данных. Добавьте данные с помощью метода addData()"
      );
    }

    /*
    Данные могут поступать двух видов: числовые (диапазон) и строчные (НЕ-диапазон)
    Если по одной из осей (x или y) находим строку, значит считаем данные этой оси строчными
    Иначе - считаем диапазоном
    
        Y                       Y 
     50 |                    As |
     40 |                    Be |
     30 |                    Cu |
     20 |                    Do |
     10 |                    En |
        |_______________ X      |_______________ X
          As Be Cu Do En          10 20 30 40 50

    На первом графике: по оси X данные строчные (НЕ-диапазон), а данные по оси Y - числовые (диапазон)
    На втором графике: наоборот
    Также могут быть графики с только числовыми или только строчными данными
    */
    ctx.clearRect(0, 0, 2000, 2000);
    paramsWrapper.innerHTML = "";
    ///// ПЕРЕМЕННЫЕ /////
    /// данные шкал - диапазон?
    let xIsDiapazon2;
    let yIsDiapazon2;

    let diapazonX;
    let diapazonY;
    let scaleX = Number.parseFloat(scaleXSlider.value);
    let scaleY = Number.parseFloat(scaleYSlider.value);
    let stepX = moveX;
    let stepY = moveY;

    // стили всплывающей подсказки
    tip.style.left = "-9999px";
    tip.style.backgroundColor = "#444";
    tip.style.color = "white";
    tip.style.borderRadius = "2px";
    tip.style.position = "absolute";
    tip.style.padding = "5px 10px";

    // стили верхнего блока
    paramsWrapper.style.width = ctx.canvas.width - field.zeroPoint[0] + "px";
    paramsWrapper.style.height = field.topBlock[3] + "px";
    paramsWrapper.style.position = "absolute";
    paramsWrapper.style.display = "flex";
    paramsWrapper.style.flexWrap = "wrap";
    paramsWrapper.style.justifyContent = "space-around";
    paramsWrapper.style.left =
      ctx.canvas.offsetLeft + field.zeroPoint[0] + "px";
    paramsWrapper.style.top = ctx.canvas.offsetTop + "px";

    // стили слайдеров
    scaleXSlider.style.top =
      ctx.canvas.offsetTop + ctx.canvas.height - 50 + "px";
    scaleXSlider.style.left =
      ctx.canvas.offsetLeft + ctx.canvas.width / 2 + "px";
    scaleYSlider.style.transform = "rotate(-90deg)";
    scaleYSlider.style.top =
      ctx.canvas.offsetTop + ctx.canvas.height / 2 + "px";
    scaleYSlider.style.left = ctx.canvas.offsetLeft - 50 + "px";

    scaleXSlider.style.position = scaleYSlider.style.position = "absolute";

    let allXCoords = [],
      allYCoords = [],
      allXTitles = [],
      allYTitles = [];
    /// Определяем длину осей в пикселях
    const scaleXLength = (field.canvasWidth - field.zeroPoint[0]) * scaleX;
    const scaleYLength = field.zeroPoint[1] * scaleY - field.topBlock[3];

    /// Создаем двумерный массив из всех данных для дальнейшей работы
    const scaleParameters = [];
    for (let dataObj of currentData.dataLines) {
      for (let dataString of dataObj.dataArr) {
        scaleParameters.push([dataString[0], dataString[1]]);
      }
    }
    /// Создаем два массива отдельно для всех х-значений и всех у-значений
    const scaleXParameters = scaleParameters.map((point) => point[0]);
    const scaleYParameters = scaleParameters.map((point) => point[1]);

    /// Определяем, приведенные данные - диапазон или фиксированные значения?

    loop: for (let dataObj of currentData.dataLines) {
      for (let dataString of dataObj.dataArr) {
        xIsDiapazon2 = typeof dataString[0] !== "number" ? false : true;
        if (xIsDiapazon2 == false) break loop;
      }
    }

    loop: for (let dataObj of currentData.dataLines) {
      for (let dataString of dataObj.dataArr) {
        yIsDiapazon2 =
          /*isNaN(Number.parseInt(dataString[1]))*/ typeof dataString[1] !==
          "number"
            ? false
            : true;
        if (xIsDiapazon2 == false) break loop;
      }
    }

    /// Конвертирование данных в координаты. Запись в тот же массив, где и данные (xData, yData, xCoord, yCoord)
    /// КООРДИНАТЫ ОСИ Х ///

    if (xIsDiapazon2) {
      // Если диапазон, то берем все икс значения и находим минимум и максимум для определения значения диапазона

      // Находим среднее арифметическое из диапазона, чтобы сделать отступы от краев графика
      let sum = scaleXParameters.reduce((a, b) => a + b, 0);
      let result = sum / scaleXParameters.length;
      diapazonX = [
        Math.min(...scaleXParameters) - result / 3,
        Math.max(...scaleXParameters) + result / 3,
      ];

      // Конвертируем все данные по оси х и добавляем к массивам данных

      let x = 0;
      currentData.dataLines.forEach((dataObj) => {
        dataObj.dataArr.forEach((dataString) => {
          const coord =
            stepX +
            (scaleXLength / (diapazonX[1] - diapazonX[0])) *
              (scaleXParameters[x] - diapazonX[0]) +
            field.zeroPoint[0] -
            (scaleXLength / 2 - scaleXLength / scaleX / 2);
          dataString[2] = coord;
          allXCoords.push(coord);
          allXTitles.push(dataString[0].toFixed(2));
          ++x;
        });
      });
    } else {
      // Если не диапазон, то создаем сет для определения уникальных значений х во всех поступивших массивах
      const setOfParameters = new Set();
      scaleXParameters.forEach((param) => setOfParameters.add(param));

      // Создаем объект из НЕ-диапазонных параметров, конвертируем координаты и присваиваем координаты каждому его свойству
      const objOfParameters = {};
      let x = 0;
      setOfParameters.forEach((param) => {
        objOfParameters[param] =
          stepX +
          (scaleXLength / (setOfParameters.size + 1)) * (x + 1) +
          field.zeroPoint[0] -
          (scaleXLength / 2 - scaleXLength / scaleX / 2);

        ++x;
      });

      // Присваиваем координаты массивам данных
      currentData.dataLines.forEach((dataObj) => {
        dataObj.dataArr.forEach((dataString) => {
          if (objOfParameters[dataString[0]] !== "undefined") {
            dataString[2] = objOfParameters[dataString[0]];
            allXCoords.push(objOfParameters[dataString[0]]);
            allXTitles.push(dataString[0]);
          }
        });
      });
    }

    /// КООРДИНАТЫ ОСИ Y ///

    if (yIsDiapazon2) {
      // Если диапазон, то берем все игрек значения и находим минимум и максимум для определения значения диапазона

      // Находим среднее арифметическое из диапазона, чтобы сделать отступы от краев графика
      let sum = scaleYParameters.reduce((a, b) => a + b, 0);
      let result = sum / scaleYParameters.length;
      diapazonY = [
        Math.min(...scaleYParameters) - result / 3,
        Math.max(...scaleYParameters) + result / 3,
      ];

      // Конвертируем все данные по оси y и добавляем к массивам данных
      let x = 0;

      currentData.dataLines.forEach((dataObj) => {
        dataObj.dataArr.forEach((dataString) => {
          const coord =
            stepY +
            field.zeroPoint[1] -
            (scaleYLength / (diapazonY[1] - diapazonY[0])) *
              (scaleYParameters[x] - diapazonY[0]) +
            (scaleYLength / 2 - scaleYLength / scaleY / 2);
          dataString[3] = coord;
          allYCoords.push(coord);
          allYTitles.push(dataString[1].toFixed(2));
          ++x;
        });
      });
    } else {
      // Если не диапазон, то создаем сет для определения уникальных значений Y во всех поступивших массивах
      const setOfParameters = new Set();
      scaleYParameters.forEach((param) => setOfParameters.add(param));

      // Создаем объект из НЕ-диапазонных параметров, конвертируем координаты и присваиваем координаты каждому его свойству
      const objOfParameters = {};
      let x = 0;
      setOfParameters.forEach((param) => {
        objOfParameters[param] =
          stepY +
          field.zeroPoint[1] -
          (scaleYLength / (setOfParameters.size + 1)) * (x + 1) +
          (scaleYLength / 2 - scaleYLength / scaleY / 2);

        ++x;
      });

      console.log(objOfParameters);

      // Присваиваем координаты массивам данных
      currentData.dataLines.forEach((dataObj) => {
        dataObj.dataArr.forEach((dataString) => {
          if (objOfParameters[dataString[1]] !== "undefined") {
            dataString[3] = objOfParameters[dataString[1]];
            allYCoords.push(objOfParameters[dataString[1]]);
            allYTitles.push(dataString[1]);
          }
        });
      });
    }

    //// РИСУЕМ РАЗМЕТКУ (СУБОСИ) ////
    /// СУБОСИ Х ///
    // субоси рисуем в первую очередь, чтобы график был нанесен поверх них

    ctx.strokeStyle = currentScales.scaleStyle.subScaleColor;
    ctx.fillStyle = currentScales.scaleStyle.subScaleColor;
    ctx.lineWidth = currentScales.scaleStyle.subScaleWidth;

    let numOfLinesX;
    if (xIsDiapazon2) {
      numOfLinesX = 10;
      for (let x = 0; x < numOfLinesX - 1; ++x) {
        ctx.lineWidth = currentScales.subScaleWidth;
        ctx.beginPath();
        ctx.moveTo(
          stepX +
            (scaleXLength / numOfLinesX) * (x + 1) +
            field.zeroPoint[0] -
            (scaleXLength / 2 - scaleXLength / scaleX / 2),
          field.zeroPoint[1] - scaleYLength
        );
        ctx.lineTo(
          stepX +
            (scaleXLength / numOfLinesX) * (x + 1) +
            field.zeroPoint[0] -
            (scaleXLength / 2 - scaleXLength / scaleX / 2),
          field.zeroPoint[1] * (x + 1)
        );
        ctx.stroke();
      }
    } else {
      currentData.dataLines.forEach((dataObj) => {
        dataObj.dataArr.forEach((dataString) => {
          ctx.beginPath();
          ctx.moveTo(dataString[2], field.zeroPoint[1]);
          ctx.lineTo(dataString[2], field.zeroPoint[1] - scaleYLength);
          ctx.stroke();
        });
      });
    }

    /// СУБОСИ Y ///
    let numOfLinesY;
    if (yIsDiapazon2) {
      numOfLinesY = Math.floor(scaleYLength / (field.canvasHeight / 15));
      for (let x = 0; x < numOfLinesY - 1; ++x) {
        ctx.beginPath();
        ctx.moveTo(
          field.zeroPoint[0],
          stepY +
            field.zeroPoint[1] -
            (scaleYLength / numOfLinesY) * (x + 1) +
            (scaleYLength / 2 - scaleYLength / scaleY / 2)
        );
        ctx.lineTo(
          field.zeroPoint[0] + scaleXLength,
          stepY +
            field.zeroPoint[1] -
            (scaleYLength / numOfLinesY) * (x + 1) +
            (scaleYLength / 2 - scaleYLength / scaleY / 2)
        );
        ctx.stroke();
      }
    } else {
      currentData.dataLines.forEach((dataObj) => {
        dataObj.dataArr.forEach((dataString) => {
          ctx.beginPath();
          ctx.moveTo(field.zeroPoint[0], dataString[3]);
          ctx.lineTo(field.zeroPoint[0] + scaleXLength, dataString[3]);
          ctx.stroke();
        });
      });
    }

    /// РИСУЕМ ГРАФИКИ ///

    // Переменные //
    const radius = currentData.dataStyle.pointsRadius;
    ctx.lineWidth = currentData.dataStyle.strokeWidth;

    /// Рисуем линии ///
    currentData.dataLines.forEach((line, index, array) => {
      currentData.dataLines[index].color =
        currentData.dataLines[index].color ||
        currentData.dataStyle.colors[index] ||
        "grey";
      ctx.strokeStyle = currentData.dataLines[index].color;
      line.dataArr.forEach((point, index, arr) => {
        if (index == 0) {
          ctx.beginPath();
          ctx.moveTo(point[2], point[3]);
        } else if (index == arr.length - 1) {
          ctx.lineTo(point[2], point[3]);
          ctx.stroke();
        } else {
          ctx.lineTo(point[2], point[3]);
        }
      });
    });

    // Рисуем точки
    if (currentData.dataStyle.points === "circle") {
      currentData.dataLines.forEach((line, index, array) => {
        let currentColor = currentData.dataLines[index].color || "#444";
        ctx.fillStyle = currentColor;
        line.dataArr.forEach((point, index) => {
          if (index == 0) {
            ctx.beginPath();
            ctx.moveTo(point[2], point[3]);

            ctx.fillStyle = "#fff";
            let outerCircle = new Path2D();
            outerCircle.arc(point[2], point[3], radius * 1.5, 0, 2 * Math.PI);
            ctx.fill(outerCircle);

            ctx.fillStyle = currentColor;
            let circle = new Path2D();
            circle.arc(point[2], point[3], radius, 0, 2 * Math.PI);
            ctx.fill(circle);

            ctx.moveTo(point[2], point[3]);
          } else if (index == array.length - 1) {
            ctx.lineTo(point[2], point[3]);
            ctx.fill();
            ctx.fillStyle = "#fff";
            let outerCircle = new Path2D();
            outerCircle.arc(point[2], point[3], radius * 1.5, 0, 2 * Math.PI);
            ctx.fill(outerCircle);

            ctx.fillStyle = currentColor;
            let circle = new Path2D();
            circle.arc(point[2], point[3], radius, 0, 2 * Math.PI);
            ctx.fill(circle);
          } else {
            ctx.moveTo(point[2], point[3]);
            ctx.fillStyle = "#fff";
            let outerCircle = new Path2D();
            outerCircle.arc(point[2], point[3], radius * 1.5, 0, 2 * Math.PI);
            ctx.fill(outerCircle);

            ctx.fillStyle = currentColor;
            let circle = new Path2D();
            circle.arc(point[2], point[3], radius, 0, 2 * Math.PI);
            ctx.fill(circle);
            ctx.moveTo(point[2], point[3]);
          }
        });
      });
    }

    /// Рисуем clearRects для шкал
    ctx.clearRect(...field.xBlock);
    ctx.clearRect(...field.yBlock);

    // Рисуем шкалы
    // Присваиваем ctx стили
    ctx.lineWidth = currentScales.scaleStyle.scaleWidth;
    ctx.strokeStyle = currentScales.scaleStyle.scaleColor;
    ctx.font = currentScales.scaleStyle.font;

    // Рисуем ось Х
    ctx.beginPath();
    ctx.moveTo(field.zeroPoint[0], field.zeroPoint[1]);
    ctx.lineTo(
      scaleXLength + field.zeroPoint[0],
      /*zeroPoint[1] * 0.2*/ field.zeroPoint[1]
    );
    ctx.stroke();

    //////// ЗНАЧЕНИЯ НА ОСИ Х /////////
    if (xIsDiapazon2) {
      ctx.strokeStyle = currentScales.scaleStyle.scaleColor;
      ctx.fillStyle = currentScales.scaleStyle.scaleColor;
      for (let x = 0; x < numOfLinesX - 1; ++x) {
        const text = (
          ((diapazonX[1] - diapazonX[0]) / numOfLinesX) * (x + 1) +
          diapazonX[0]
        ).toFixed(2);
        const xCoordOfText =
          stepX +
          field.zeroPoint[0] +
          (scaleXLength / numOfLinesX) * (x + 1) -
          text.length * 3.5 -
          (scaleXLength / 2 - scaleXLength / scaleX / 2);
        if (
          xCoordOfText > field.zeroPoint[0] &&
          xCoordOfText < field.canvasWidth - 50
        ) {
          ctx.fillText(text, xCoordOfText, field.zeroPoint[1] + 20);
        }
      }
    } else {
      /// Создаем массив где будут храниться отрисованные значения шкалы х.
      /// Если в массиве есть значение равное текущему, значит оно уже было нанесено - пропускаем
      const arr = [];
      ctx.strokeStyle = currentScales.scaleStyle.scaleColor;
      ctx.fillStyle = currentScales.scaleStyle.scaleColor;
      currentData.dataLines.forEach((dataObj) => {
        dataObj.dataArr.forEach((dataString) => {
          if (!arr.includes(dataString[0])) {
            ctx.fillText(
              dataString[0],
              dataString[2] - String(dataString[0]).length * 4,
              field.zeroPoint[1] + 20
            );
            arr.push(dataString[0]);
          }
        });
      });
    }

    // Название оси Х

    ctx.fillText(
      currentScales.xScaleLabel,
      ctx.canvas.height,
      field.zeroPoint[1] + 60
    );
    // ctx.rotate(Math.PI / 2);

    // Рисуем ось Y
    ctx.beginPath();
    ctx.moveTo(field.zeroPoint[0], field.zeroPoint[1]);
    ctx.lineTo(field.zeroPoint[0], field.zeroPoint[1] - scaleYLength);
    ctx.stroke();

    //////// ЗНАЧЕНИЯ НА ОСИ Y /////////
    if (yIsDiapazon2) {
      ctx.strokeStyle = currentScales.scaleStyle.scaleColor;
      ctx.fillStyle = currentScales.scaleStyle.scaleColor;

      for (let x = 0; x < numOfLinesY - 1; ++x) {
        const text = (
          ((diapazonY[1] - diapazonY[0]) / numOfLinesY) * (x + 1) +
          diapazonY[0]
        ).toFixed(2);

        const yCoordOfText =
          stepY +
          field.zeroPoint[1] -
          (scaleYLength / numOfLinesY) * (x + 1) +
          Number(
            currentScales.scaleStyle.font.slice(
              0,
              currentScales.scaleStyle.font.indexOf("px")
            )
          ) /
            4 +
          (scaleYLength / 2 - scaleYLength / scaleY / 2);
        if (
          yCoordOfText < field.zeroPoint[1] &&
          yCoordOfText > field.topBlock[3] + 10
        ) {
          ctx.fillText(text, field.yBlock[2] - text.length * 10, yCoordOfText);
        }
      }
    } else {
      /// Создаем массив где будут храниться отрисованные значения шкалы х.
      /// Если в массиве есть значение равное текущему, значит оно уже было нанесено - пропускаем
      const arr = [];
      ctx.strokeStyle = currentScales.scaleStyle.scaleColor;
      ctx.fillStyle = currentScales.scaleStyle.scaleColor;
      currentData.dataLines.forEach((dataObj) => {
        dataObj.dataArr.forEach((dataString) => {
          if (!arr.includes(dataString[1])) {
            ctx.fillText(
              dataString[1],
              field.zeroPoint[0] - String(dataString[1]).length * 10,
              dataString[3] +
                Number(
                  currentScales.scaleStyle.font.slice(
                    0,
                    currentScales.scaleStyle.font.indexOf("px")
                  )
                ) /
                  4
            );
            arr.push(dataString[1]);
          }
        });
      });
    }

    // Название оси Y
    // ctx.rotate(-Math.PI / 2);
    // ctx.fillText(currentScales.yScaleLabel, 500, 500);
    // ctx.rotate(Math.PI / 2);

    ctx.save();
    ctx.translate(20, field.topBlock[3] * 2);
    ctx.rotate(-Math.PI / 2);

    ctx.fillText(currentScales.yScaleLabel, 0, 0);
    ctx.restore();

    ctx.clearRect(...field.topBlock);

    ctx.canvas.addEventListener("mousemove", function (e) {
      const x = e.pageX - e.target.offsetLeft,
        y = e.pageY - e.target.offsetTop;
      for (let i = 0; i < allXCoords.length; ++i) {
        if (
          x + radius * 1.5 > allXCoords[i] &&
          x - radius * 1.5 < allXCoords[i] &&
          y + radius * 1.5 > allYCoords[i] &&
          y - radius * 1.5 < allYCoords[i]
        ) {
          tip.style.left = this.offsetLeft + x + "px";
          tip.style.top = this.offsetTop + y + "px";
          tip.innerHTML = `<span>x: ${allXTitles[i]}</span><br><span>y: ${allYTitles[i]}</span>`;
          break;
        } else {
          tip.style.left = "-9999px";
        }
      }
    });
    const paramSize = this.scale.scaleStyle.font
      ? this.scale.scaleStyle.font.slice(
          0,
          this.scale.scaleStyle.font.indexOf("px")
        )
      : "12px";
    for (let p = 0; p < currentData.dataLines.length; ++p) {
      paramsWrapper.innerHTML += `<div style = 'margin: auto; display: flex;'>
        <div style="width:${paramSize}px;height:${paramSize}px;background-color:${
        currentData.dataLines[p].color
      }; margin-right: ${paramSize}px; margin-left:${paramSize * 2}px"></div>
      <div style='display:flex; height:100%; margin:0; text-align: center; font:${
        this.scale.scaleStyle.font
      }; color:${
        this.scale.scaleStyle.scaleColor
      }'><span style='margin: auto;'>${
        currentData.dataLines[p].name || `line ${p + 1}`
      }</span></div>
        </div>
      </div>`;
    }
  }

  changeStyles(obj) {
    if (obj.scale) {
      for (let key in obj.scale) {
        this.scale.scaleStyle[key] = obj.scale[key];
      }
    }
    if (obj.data) {
      for (let key in obj.data) {
        this.data.dataStyle[key] = obj.data[key];
      }
    }
    this.update();
  }
}
