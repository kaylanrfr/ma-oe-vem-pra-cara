function getQuestions() {
  return new Promise((resolve, reject) =>
    fetch(
      "https://raw.githubusercontent.com/felipecsl/show-do-milhao/master/questions.txt"
    )
      .then((res) => res.text())
      .then((data) => {
        let json = [];
        let dificuldade = null;

        data = data.split("\n### Answers\n");

        const perguntas = data[0].split("\n");

        for (let i = 0; i < perguntas.length - 5; i++) {
          linha = perguntas[i];

          if (linha.includes("###")) {
            dificuldade = linha.split("### ")[1];
            continue;
          }

          if (linha === "" && !perguntas[i + 1].includes("###")) {
            json.push({
              pergunta: perguntas[i + 1],
              opcoes: [
                perguntas[i + 2],
                perguntas[i + 3],
                perguntas[i + 4],
                perguntas[i + 5],
              ],
              resposta: null,
              dificuldade: dificuldade,
            });
            continue;
          }
        }

        const respostas = data[1].split("\n");
        json = json.map((item, i) =>
          // i + 1 cuz the first element is an empty string
          Object.assign(item, { resposta: parseInt(respostas[i + 1]) })
        );
        resolve(json);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      })
  );
}

const _parametersByLevel = {
  1: {
    difficulty: "Fácil",
    cash: 1000,
  },
  2: {
    difficulty: "Difícil",
    cash: 10000,
  },
  3: {
    difficulty: "Médio",
    cash: 100000,
  },
};

let _data;

let _score;
let _nextPrize;
let _level;
let _questions;
let _skipCounter = 3;
let _counter = 1;
let _millionQuestion = false;

getQuestions().then((res) => {
  _data = res;
  console.log(_data);
});

function setScore(int) {
  _score = int;
  document.getElementById("score").innerText = "R$ " + int;
}

function updateCounter() {
  document.getElementById("level").innerText = `${_level}-${++_counter}`;
}

function handleLevelChange(int) {
  _level = int;
  _questions = _data.filter(
    (item) => item.dificuldade === _parametersByLevel[int].difficulty
  );

  _nextPrize = _parametersByLevel[int].cash;

  document.getElementById("level").innerText = `${int}-${_counter}`;
}

function generateQuestion() {
  _questions = _questions.filter(
    (item) => item.dificuldade === _parametersByLevel[_level].difficulty
  );

  let index = Math.floor(Math.random() * _questions.length);
  const question = _questions[index];

  document.getElementById("question").innerText = question.pergunta;
  document.getElementById("answers").innerHTML = question.opcoes
    .map(
      (opcao, i) =>
        `<li><button class="option" onclick="handleQuestionAnswer(${index}, ${
        i + 1
        })">${i + 1} - ${opcao.slice(1)}</button></li>`
    )
    .join("");

}

function handleNextQuestion() {
  document.getElementById("skip").disabled = false;
  updateCounter();
  handleQuestion();
}

function handleQuestion() {
  document.getElementById("validation").innerText = "";
  document.getElementById("next").disabled = true;

  if (_counter > 5) {
    _counter = 1;

    if (_level < Object.keys(_parametersByLevel).length) {
      handleLevelChange(++_level);
    } else {
      alert("Pergunta do milhão. Se acertar voce ganha 1 milhão");
      _millionQuestion = true;
      _nextPrize = 1000000;
    }
  }

  document.getElementById("prize").innerText = "R$ " + _nextPrize;
  generateQuestion();
}

function handleQuestionAnswer(qIndex, aIndex) {
  const options = document.querySelectorAll("[class^='option']");
  options.forEach((btn) => {
    btn.disabled = true;
  });

  const span = document.getElementById("validation");
  const question = _questions[qIndex];

  if (question.resposta === aIndex) {
    document.getElementById("skip").disabled = true;
    span.innerText = "Correto!!";
    if (!_millionQuestion) {
      setScore(_nextPrize);
      _nextPrize += _parametersByLevel[_level].cash;
    } else {
      setScore(1000000);
      winGame();
    }
  } else {
    span.innerText = `Errado! A resposta correta é a opção ${_questions[qIndex].resposta}`;
    if (!_millionQuestion) {
      setScore(_score / 2);
    } else {
      setScore(0);
    }
    lostGame();
  }

  _questions.splice(qIndex, 1);
  document.getElementById("next").disabled = false;
}

function skipQuestion() {
  if (_skipCounter > 0 && _millionQuestion == false) {
    --_skipCounter;
    generateQuestion();
    if (_skipCounter > 1) {
      alert(`Atenção você só pode pular mais ${_skipCounter} questões`);
    }
    else if(_skipCounter == 1){
      alert(`Atenção você só pode pular mais ${_skipCounter} questão`);
    }
    else{
      alert(`Atenção você não pode pular mais questões`);
    }

  }
  else {
    document.getElementById("skip").disabled = true;
  }

}

function startNewGame() {
  document.getElementById("play").style.display = "none";
  document.getElementById("game").style.display = "block";

  setScore(0);
  handleLevelChange(1);
  handleQuestion();
  _counter = 1;
  _skipCounter = 3;
  document.getElementById("skip").disabled = false;
}

function winGame() {
  document.getElementById("play").style.display = "flex";
  document.getElementById("game").style.display = "none";

  alert(`Voce ganhou, vai levar R$ 1.000.000 para casa`);
}

function lostGame() {
  document.getElementById("play").style.display = "flex";
  document.getElementById("game").style.display = "none";

  alert(`Voce perdeu, vai levar R$ ${_score} para casa`);
}

function giveUp() {
  document.getElementById("play").style.display = "flex";
  document.getElementById("game").style.display = "none";

  alert(`Voce desistiu, vai levar R$ ${_score} para casa`);
}
